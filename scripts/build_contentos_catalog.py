#!/usr/bin/env python3
"""Build a public metadata catalog and evidence snapshots from rendered posts."""
import hashlib
import json
import re
import sys
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

FIELDS=('title','url','summary','tags','published_at','content_type')
def digest(data):return 'sha256:'+hashlib.sha256(json.dumps(data,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
class Article(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.depth=0;self.skip=0;self.parts=[]
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if self.depth:
   if tag not in ('br','hr','img','input','meta','link','source','wbr','area','base','embed','param','track'):self.depth+=1
   if tag in ('script','style'):self.skip+=1
   if tag in ('p','div','li','h1','h2','h3','h4','br','tr','pre'):self.parts.append('\n')
  elif attrs.get('itemprop')=='articleBody':self.depth=1
 def handle_startendtag(self,tag,attrs):
  if tag in ('br','hr','img','input','meta','link','source','wbr','area','base','embed','param','track'):self.handle_starttag(tag,attrs)
  else:self.handle_starttag(tag,attrs);self.handle_endtag(tag)
 def handle_endtag(self,tag):
  if tag in ('br','hr','img','input','meta','link','source','wbr','area','base','embed','param','track'):return
  if self.depth:
   if tag in ('script','style'):self.skip=max(0,self.skip-1)
   self.depth-=1
   if tag in ('p','div','li','h1','h2','h3','h4','tr','pre'):self.parts.append('\n')
 def handle_data(self,data):
  if self.depth and not self.skip:self.parts.append(data)
 def text(self):return '\n'.join(' '.join(line.split()) for line in ''.join(self.parts).splitlines() if line.strip())
def build(output):
 output=Path(output);seed=output/'.contentos-posts.json';catalog=[]
 for record in json.loads(seed.read_text()):
  path=(output/record.pop('output_path')).resolve()
  if not path.is_relative_to(output.resolve()):raise ValueError('Post outside build output')
  html=path.read_text();article=Article();article.feed(html);text=article.text()
  if not text:raise ValueError('Article body missing: '+record['url'])
  if urlsplit(record['url']).scheme!='https' or urlsplit(record['url']).netloc!='brainvomit.blog':raise ValueError('Wrong publication origin')
  record['title']=' '.join(unescape(record['title']).split())
  record['summary']=' '.join(unescape(re.sub('<[^>]*>',' ',record['summary'])).split())[:1200] or text.split('\n')[0][:500]
  record['tags']=sorted(set(' '.join(t.split()) for t in record['tags']))
  record['content_hash']=digest([record[k] for k in FIELDS]+[text])
  post_id=hashlib.sha256(record['url'].encode()).hexdigest()[:24]
  record['packet_url']='https://brainvomit.blog/api/posts/'+post_id+'.json'
  packet={**record,'content_text':text,'schema_version':1}
  dest=output/'api/posts'/ (post_id+'.json');dest.parent.mkdir(parents=True,exist_ok=True)
  dest.write_text(json.dumps(packet,ensure_ascii=False,separators=(',',':'))+'\n')
  html=re.sub(r'\s*<meta name="contentos-content-hash" content="[^"]*">','',html)
  html=html.replace('</head>','<meta name="contentos-content-hash" content="'+record['content_hash']+'">\n</head>',1)
  path.write_text(html)
  catalog.append(record)
 catalog.sort(key=lambda p:p['url'])
 (output/'api/posts.json').write_text(json.dumps({'schema_version':1,'posts':catalog},ensure_ascii=False,separators=(',',':'))+'\n')
 seed.unlink()
 return len(catalog)
if __name__=='__main__':print('ContentOS catalog:',build(sys.argv[1]),'published articles')
