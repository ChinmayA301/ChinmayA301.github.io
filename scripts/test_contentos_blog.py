import hashlib,importlib.util,json,tempfile,unittest
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
if __name__=='__main__':unittest.main()
