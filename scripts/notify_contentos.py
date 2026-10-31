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

def verify(post):
 catalog=json.loads(fetch(ORIGIN+'/api/posts.json'))
 actual=next((p for p in catalog['posts'] if p['url']==post['url']),None)
 if actual is None or any(actual.get(k)!=post.get(k) for k in (*FIELDS,'content_hash','packet_url')):return False
 packet=json.loads(fetch(post['packet_url']))
 calculated='sha256:'+hashlib.sha256(json.dumps([packet[k] for k in FIELDS]+[packet['content_text']],ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
 if calculated!=post['content_hash'] or any(packet.get(k)!=post.get(k) for k in (*FIELDS,'content_hash','packet_url')):return False
 html=fetch(post['url']).decode()
 return ('<meta name="contentos-content-hash" content="'+post['content_hash']+'">') in html and re.search(r'<link\s+rel="canonical"\s+href="'+re.escape(post['url'])+'"',html) is not None

def send(post,endpoint,secret):
 p=urlsplit(endpoint)
 if p.scheme!='https' or not p.hostname or p.username or p.password or p.query or p.fragment or p.path!='/v1/blog/events':raise ValueError('Invalid ContentOS endpoint')
 if len(secret)<32:raise ValueError('Missing ContentOS signing secret')
 body=json.dumps(event_for(post),ensure_ascii=False,separators=(',',':')).encode()
 for attempt in range(5):
  timestamp=str(int(time.time()));signature=hmac.new(secret.encode(),timestamp.encode()+b'.'+body,hashlib.sha256).hexdigest()
  try:
   with build_opener(NoRedirect()).open(Request(endpoint,data=body,method='POST',headers={'Content-Type':'application/json','User-Agent':'ContentOS-Blog-Notify/1','X-ContentOS-Timestamp':timestamp,'X-ContentOS-Signature':'sha256='+signature}),timeout=30) as response:
    receipt=json.loads(response.read(4096))
    if receipt.get('event_id')!=event_for(post)['event_id']:raise ValueError('Invalid event receipt')
    return receipt
  except HTTPError as error:
   if error.code not in (408,429,500,502,503,504):raise RuntimeError('ContentOS rejected event (HTTP '+str(error.code)+'); details withheld') from None
  except (URLError,TimeoutError):pass
  if attempt<4:time.sleep(2**attempt)
 raise RuntimeError('ContentOS event delivery failed; rerun this workflow safely')

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
 posts=json.load(open('_site_brainvomit/api/posts.json'))['posts'];paths=set(changed_paths())
 selected=[p for p in posts if p['source_path'] in paths]
 for post in selected:
  end=time.monotonic()+1200
  while True:
   try:
    if verify(post):break
   except (HTTPError,URLError,TimeoutError,ValueError,KeyError):pass
   if time.monotonic()>end:raise RuntimeError('Published article revision was not verified within 20 minutes; no event sent')
   time.sleep(15)
  receipt=send(post,os.environ.get('CONTENTOS_BLOG_WEBHOOK_URL',''),os.environ.get('CONTENTOS_BLOG_WEBHOOK_SECRET',''))
  print('ContentOS accepted',receipt['event_id'],'for review-only intake')
 if not selected:print('No changed published articles; no events sent')
if __name__=='__main__':main()
