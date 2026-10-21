from html.parser import HTMLParser
from pathlib import Path
import json,re,collections,sys
sys.stdout.reconfigure(encoding="utf-8")
class N:
 def __init__(self,tag='',attrs=(),parent=None):self.tag=tag;self.a=dict(attrs);self.parent=parent;self.children=[]
 def text(self):return ''.join(x if isinstance(x,str) else x.text() for x in self.children)
 def all(self,tag=None):
  out=[]
  for x in self.children:
   if isinstance(x,N):
    if tag is None or x.tag==tag:out.append(x)
    out+=x.all(tag)
  return out
class P(HTMLParser):
 def __init__(self):super().__init__();self.root=N();self.current=self.root
 def handle_starttag(self,t,a):
  n=N(t,a,self.current);self.current.children.append(n)
  if t not in ['img','input','br','hr','meta','link','source','area','base','embed','param','track','wbr']:self.current=n
 def handle_startendtag(self,t,a):self.handle_starttag(t,a);self.handle_endtag(t)
 def handle_endtag(self,t):
  n=self.current
  while n.parent:
   if n.tag==t:self.current=n.parent;return
   n=n.parent
 def handle_data(self,d):
  if self.current.tag not in ['style','script','noscript']:self.current.children.append(d)
def norm(s):return re.sub(r'\s+',' ',s).strip()
def summary(path):
 p=P();p.feed(path.read_text(encoding='utf8'));m=next(iter(p.root.all('main')),p.root)
 imgs=[dict(src=n.a.get('src',''),alt=n.a.get('alt',''),mobile=n.a.get('data-generated-mobile',''),cls=n.a.get('class','')) for n in m.all('img')]
 headings=[norm(n.text()) for n in m.all() if n.tag in ['h1','h2']]
 english=[norm(n.text()) for n in m.all() if n.tag in ['p','h1','h2','h3','summary','label'] and len(re.findall('[A-Za-z]{3,}',n.text()))>=4 and not re.search('[\u0600-\u06ff]',n.text())]
 assets=[]
 for n in m.all():
  for attr in ['srcset','data-src','data-generated-mobile','poster']:
   if n.a.get(attr):assets.append([n.tag,attr,n.a[attr]])
  for url in re.findall(r'url\([\"\x27]?([^\)\"\x27]+)',n.a.get('style','')):assets.append([n.tag,'background',url])
 return dict(paragraphs=[norm(n.text()) for n in m.all('p')],images=imgs,responsiveAndBackground=assets,headings=headings,sections=[n.a.get('class','') for n in m.all('section')],english=english,text=norm(m.text()))
dir=Path('docs/bilingual-review');routes=json.loads((dir/'routes.json').read_text(encoding='utf8'));pairs={r['key']:r for r in routes if r['locale']=='en'};results=[]
for key in pairs:
 en=summary(dir/(key+'-en.html'));ar=summary(dir/(key+'-ar.html'));diff=[]
 for i in range(max(len(en['images']),len(ar['images']))):
  a=en['images'][i] if i<len(en['images']) else {};b=ar['images'][i] if i<len(ar['images']) else {}
  if a.get('src')!=b.get('src'):diff.append(dict(index=i,en=a,ar=b))
 results.append(dict(key=key,path=pairs[key]['path'],imageDiffs=diff,imageCounts=[len(en['images']),len(ar['images'])],responsiveAndBackground=[en['responsiveAndBackground'],ar['responsiveAndBackground']],headings=[en['headings'],ar['headings']],sectionCounts=[len(en['sections']),len(ar['sections'])],arabicEnglish=ar['english'],paragraphs=[en['paragraphs'],ar['paragraphs']],numbers=[dict(collections.Counter(re.findall(r'(?<![A-Za-z])\b\d+(?:[.,]\d+)?%?',x['text']))) for x in [en,ar]]))
(dir/'comparison.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
for r in results:
 if r['imageDiffs'] or r['sectionCounts'][0]!=r['sectionCounts'][1]:print(json.dumps({k:r[k] for k in ['key','imageCounts','sectionCounts','imageDiffs']},ensure_ascii=False))
print('PAIRS',len(results))
