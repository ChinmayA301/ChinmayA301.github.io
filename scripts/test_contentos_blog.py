import hashlib,importlib.util,io,json,os,tempfile,unittest
from urllib.error import HTTPError
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch

def load(name):
 spec=importlib.util.spec_from_file_location(name,Path(__file__).with_name(name+'.py'));module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);return module
catalog=load('build_contentos_catalog');notify=load('notify_contentos')
class PipelineTests(unittest.TestCase):
 def test_extract_only_rendered_article_and_ignore_scripts_and_void_tags(self):
  article=catalog.Article();article.feed('<nav>private menu</nav><div itemprop="articleBody"><p>Public text<img src="x"/></p><p>More text</p><script>ignore me</script></div><footer>outside</footer>')
  self.assertEqual(article.text(),'Public text\nMore text')
 def test_public_build_has_stable_hash_and_ignores_unlisted_drafts(self):
  with tempfile.TemporaryDirectory() as temp:
   out=Path(temp);(out/'fixture').mkdir();(out/'fixture/index.html').write_text('<head></head><div itemprop="articleBody"><p>Rendered public text.</p></div>')
   (out/'unpublished.html').write_text('not in published metadata')
   record={'title':'Article','url':'https://brainvomit.blog/fixture/','summary':'Summary','tags':['AI'],'published_at':'2026-01-01T00:00:00Z','content_type':'essay','source_path':'_posts/test.md','output_path':'fixture/index.html'}
   (out/'.contentos-posts.json').write_text(json.dumps([record]));self.assertEqual(catalog.build(out),1)
   first=json.loads((out/'api/posts.json').read_text())['posts'][0];packet=json.loads(next((out/'api/posts').glob('*.json')).read_text())
   self.assertEqual(first['content_hash'],catalog.digest([packet[k] for k in catalog.FIELDS]+[packet['content_text']]))
   self.assertIn(first['content_hash'],(out/'fixture/index.html').read_text());self.assertFalse((out/'.contentos-posts.json').exists())
   self.assertEqual(notify.event_for(first),notify.event_for(first))
   html=(out/'fixture/index.html').read_text().replace('<head>','<head><link rel="canonical" href="https://brainvomit.blog/fixture/">')
   with patch.object(notify,'fetch',side_effect=[json.dumps({'posts':[first]}).encode(),json.dumps(packet).encode(),html.encode()]):self.assertTrue(notify.verify(first))
   stale=dict(first,content_hash='sha256:'+'0'*64)
   with patch.object(notify,'fetch',return_value=json.dumps({'posts':[stale]}).encode()):self.assertFalse(notify.verify(first))
 def test_signed_event_identity_changes_with_article_revision(self):
  post={k:'x' for k in (*notify.FIELDS,'content_hash','packet_url')};post['tags']=[]
  self.assertNotEqual(notify.event_for(post)['event_id'],notify.event_for(dict(post,content_hash='changed'))['event_id'])
 def test_does_not_send_to_non_https_or_wrong_endpoint(self):
  with self.assertRaises(ValueError):notify.send({},'http://localhost/v1/blog/events','a'*64)
class DeliveryTests(unittest.TestCase):
 def post(self,path='_posts/fixture.md'):
  return dict(title='Article',url='https://brainvomit.blog/fixture/',summary='Summary',tags=[],published_at='2026-01-01T00:00:00Z',content_type='essay',content_hash='sha256:'+'c'*64,packet_url='https://brainvomit.blog/api/posts/'+'d'*24+'.json',source_path=path)
 def test_quota_failure_explains_retry_without_leaking_response(self):
  error=HTTPError('https://fixture/v1/blog/events',503,'unavailable',{'Retry-After':'3600'},io.BytesIO(b'{"error":"storage_quota_exceeded","private":"DO_NOT_LOG"}'))
  with patch.object(notify,'build_opener') as opener:
   opener.return_value.open.side_effect=error
   with self.assertRaisesRegex(RuntimeError,'storage_quota_exceeded; retry after 3600 seconds') as caught:notify.send(self.post(),'https://fixture/v1/blog/events','a'*64)
   self.assertNotIn('DO_NOT_LOG',str(caught.exception));self.assertEqual(opener.return_value.open.call_count,1)
 def test_untrusted_response_is_not_logged(self):
  for body in [b'{"error":"SECRET_DO_NOT_LOG"}',b'<html>SECRET_DO_NOT_LOG</html>']:
   error=HTTPError('https://fixture/v1/blog/events',400,'bad',{},io.BytesIO(body))
   with patch.object(notify,'build_opener') as opener:
    opener.return_value.open.side_effect=error
    with self.assertRaisesRegex(RuntimeError,'unrecognized_response') as caught:notify.send(self.post(),'https://fixture/v1/blog/events','a'*64)
    self.assertNotIn('SECRET_DO_NOT_LOG',str(caught.exception))
 def test_transient_retries_keep_identity_and_verify_receipt(self):
  post=self.post();receipt={'event_id':notify.event_for(post)['event_id']}
  from unittest.mock import MagicMock
  response=MagicMock();response.__enter__.return_value.read.return_value=json.dumps(receipt).encode()
  error=HTTPError('https://fixture/v1/blog/events',503,'unavailable',{'Retry-After':'1'},io.BytesIO(b'{"error":"storage_unavailable"}'))
  with patch.object(notify,'build_opener') as opener,patch.object(notify.time,'sleep'):
   opener.return_value.open.side_effect=[error,response]
   self.assertEqual(notify.send(post,'https://fixture/v1/blog/events','a'*64),receipt)
   calls=opener.return_value.open.call_args_list
   self.assertEqual(calls[0].args[0].data,calls[1].args[0].data)
 def test_timeout_names_stale_post_and_does_not_block_verified_post(self):
  stale=self.post('_posts/stale.md');ready=self.post('_posts/ready.md')
  with tempfile.TemporaryDirectory() as temp,patch.dict(os.environ,{'CONTENTOS_BLOG_WEBHOOK_URL':'https://fixture/v1/blog/events','CONTENTOS_BLOG_WEBHOOK_SECRET':'a'*64}),patch.object(notify,'changed_paths',return_value=[stale['source_path'],ready['source_path']]),patch.object(notify,'verification_issue',side_effect=['catalog mismatch: content_hash',None]),patch.object(notify,'send',return_value={'event_id':'post_ready'}) as send,patch.object(notify.time,'monotonic',side_effect=[0,1201]),redirect_stdout(io.StringIO()):
   previous=os.getcwd()
   try:
    os.chdir(temp);Path('_site_brainvomit/api').mkdir(parents=True);Path('_site_brainvomit/api/posts.json').write_text(json.dumps({'posts':[stale,ready]}))
    with self.assertRaisesRegex(RuntimeError,'_posts/stale.md: catalog mismatch: content_hash'):notify.main()
    self.assertEqual(send.call_args.args[0],ready)
   finally:os.chdir(previous)

if __name__=='__main__':unittest.main()
