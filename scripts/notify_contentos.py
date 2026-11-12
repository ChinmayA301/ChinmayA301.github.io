#!/usr/bin/env python3
"""Verify a deployed article revision, then send a signed, retry-safe event."""
import hashlib,hmac,json,os,re,subprocess,time
from urllib.error import HTTPError,URLError
from urllib.parse import urlsplit
from urllib.request import Request,build_opener,HTTPRedirectHandler
ORIGIN='https://brainvomit.blog'
FIELDS=('title','url','summary','tags','published_at','content_type')
class NoRedirect(HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):return None

def fetch(url):
 p=urlsplit(url)
 if p.scheme!='https' or p.netloc!='brainvomit.blog' or p.query or p.fragment:raise ValueError('Untrusted publication URL')
 with build_opener(NoRedirect()).open(Request(url,headers={'User-Agent':'ContentOS-Blog-Verify/1','Cache-Control':'no-cache'}),timeout=20) as response:
  data=response.read(2_000_001)
  if len(data)>2_000_000:raise ValueError('Publication response too large')
  return data

def event_for(post):
 value={key:post[key] for key in (*FIELDS,'content_hash','packet_url')}
 value.update(event='blog.post.published',event_id='post_'+hashlib.sha256((post['url']+'\n'+post['content_hash']).encode()).hexdigest())
 return value

def verification_issue(post):
 catalog=json.loads(fetch(ORIGIN+'/api/posts.json'))
 actual=next((p for p in catalog['posts'] if p['url']==post['url']),None)
 if actual is None:return 'article missing from public catalog'
 mismatched=[k for k in (*FIELDS,'content_hash','packet_url') if actual.get(k)!=post.get(k)]
 if mismatched:return 'catalog mismatch: '+', '.join(mismatched)
 packet=json.loads(fetch(post['packet_url']))
 calculated='sha256:'+hashlib.sha256(json.dumps([packet[k] for k in FIELDS]+[packet['content_text']],ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
 if calculated!=post['content_hash']:return 'public evidence hash mismatch'
 mismatched=[k for k in (*FIELDS,'content_hash','packet_url') if packet.get(k)!=post.get(k)]
 if mismatched:return 'evidence metadata mismatch: '+', '.join(mismatched)
 html=fetch(post['url']).decode()
 if ('<meta name="contentos-content-hash" content="'+post['content_hash']+'">') not in html:return 'HTML revision marker mismatch'
 if re.search(r'<link\s+rel="canonical"\s+href="'+re.escape(post['url'])+'"',html) is None:return 'HTML canonical URL mismatch'
 return None

def verify(post):return verification_issue(post) is None

ERROR_CODES={'payload','event_id','unauthorized','not_configured','too_large','idempotency_conflict','storage_quota_exceeded','storage_unavailable'}
def rejection(error):
 # Only known machine codes may enter logs. Never echo response text or headers.
 try:code=json.loads(error.read(4097)).get('error')
 except (ValueError,AttributeError):code=None
 detail=code if isinstance(code,str) and code in ERROR_CODES else 'unrecognized_response'
 retry=error.headers.get('Retry-After','') if error.headers else ''
 if not re.fullmatch(r'\d{1,6}',retry):retry=''
 return detail,retry

def send(post,endpoint,secret):
 p=urlsplit(endpoint)
 if p.scheme!='https' or not p.hostname or p.username or p.password or p.query or p.fragment or p.path!='/v1/blog/events':raise ValueError('Invalid ContentOS endpoint')
 if len(secret)<32:raise ValueError('Missing ContentOS signing secret')
 body=json.dumps(event_for(post),ensure_ascii=False,separators=(',',':')).encode()
 last='network timeout or connection failure'
 for attempt in range(5):
  timestamp=str(int(time.time()));signature=hmac.new(secret.encode(),timestamp.encode()+b'.'+body,hashlib.sha256).hexdigest()
  try:
   with build_opener(NoRedirect()).open(Request(endpoint,data=body,method='POST',headers={'Content-Type':'application/json','User-Agent':'ContentOS-Blog-Notify/1','X-ContentOS-Timestamp':timestamp,'X-ContentOS-Signature':'sha256='+signature}),timeout=30) as response:
    receipt=json.loads(response.read(4096))
    if receipt.get('event_id')!=event_for(post)['event_id']:raise ValueError('Invalid event receipt')
    return receipt
  except HTTPError as error:
   detail,retry=rejection(error)
   last='HTTP '+str(error.code)+'; '+detail+('; retry after '+retry+' seconds' if retry else '')
   if error.code not in (408,429,500,502,503,504) or (retry and int(retry)>=60):raise RuntimeError('ContentOS rejected '+event_for(post)['event_id']+' ('+last+'); rerun this post after resolving the cause') from None
  except (URLError,TimeoutError):pass
  if attempt<4:time.sleep(2**attempt)
 raise RuntimeError('ContentOS event delivery failed ('+last+'); rerun this workflow safely')

def changed_paths():
 selected=os.environ.get('POST_PATH','')
 if selected:
  if not re.fullmatch(r'_posts/[A-Za-z0-9_.-]+\.(md|markdown|html)',selected):raise ValueError('Select one _posts/ file')
  return [selected]
 before=os.environ.get('BEFORE_SHA','');after=os.environ.get('GITHUB_SHA','')
 if not re.fullmatch(r'[a-f0-9]{40}',before) or not re.fullmatch(r'[a-f0-9]{40}',after):raise ValueError('Missing valid commit range; select a post for manual dispatch')
 if before=='0'*40:raise ValueError('Initial import requires explicit per-post dispatch; archive backfill is disabled')
 return subprocess.check_output(['git','diff','--name-only','--no-renames','--diff-filter=AM',before,after,'--','_posts/'],text=True).splitlines()

def main():
 if not os.environ.get('CONTENTOS_BLOG_WEBHOOK_URL') or len(os.environ.get('CONTENTOS_BLOG_WEBHOOK_SECRET',''))<32:raise ValueError('Configure the ContentOS Actions URL variable and signing secret first')
 with open('_site_brainvomit/api/posts.json') as catalog_file:posts=json.load(catalog_file)['posts']
 paths=set(changed_paths())
 selected=[p for p in posts if p['source_path'] in paths]
 pending=list(selected);issues={};failures=[];end=time.monotonic()+1200
 while pending:
  for post in pending[:]:
   path=post['source_path']
   try:issue=verification_issue(post)
   except HTTPError as error:issue='public evidence HTTP '+str(error.code)
   except (URLError,TimeoutError):issue='public evidence connection failure'
   except (ValueError,KeyError):issue='invalid public evidence schema or response'
   if issue:
    if issues.get(path)!=issue:print('Waiting for',path+':',issue,flush=True)
    issues[path]=issue
    continue
   print('Verified deployed revision',path,post['content_hash'],flush=True)
   pending.remove(post)
   try:
    receipt=send(post,os.environ['CONTENTOS_BLOG_WEBHOOK_URL'],os.environ['CONTENTOS_BLOG_WEBHOOK_SECRET'])
    print('ContentOS accepted',receipt['event_id'],'for review-only intake',flush=True)
   except RuntimeError as error:failures.append(path+': '+str(error))
  if not pending:break
  if time.monotonic()>=end:
   failures.extend(p['source_path']+': '+issues[p['source_path']] for p in pending)
   break
  time.sleep(15)
 if failures:raise RuntimeError('ContentOS intake incomplete: '+'; '.join(failures))
 if not selected:print('No changed published articles; no events sent')
if __name__=='__main__':main()
