import json
from pathlib import Path

folder = Path('docs/bilingual-review')
routes = json.loads((folder/'routes.json').read_text(encoding='utf8'))
comparison = json.loads((folder/'comparison.json').read_text(encoding='utf8'))
hover = json.loads((folder/'hover-coverage.json').read_text(encoding='utf8'))
assert len(routes) == 80 and len(comparison) == 40 and len(hover) == 80
assert all(r['status'] == 200 and not r.get('streamError') for r in routes)
for page in comparison:
    assert page['imageCounts'][0] == page['imageCounts'][1], page['key']
    assert page['sectionCounts'][0] == page['sectionCounts'][1], page['key']
    assert page['responsiveAndBackground'][0] == page['responsiveAndBackground'][1], page['key']
    assert not page['arabicEnglish'], page['key']
    for diff in page['imageDiffs']:
        assert page['key'] == 'website-design', page['key']
        assert diff['en']['src'].endswith('custom-cms-ai-en-v1.webp')
        assert diff['ar']['src'].endswith('custom-cms-ai-ar-v1.webp')
assert all(page['marked'] > 0 for page in hover)
print('PASS: 40 bilingual page pairs, matching image placements, responsive assets, sections and 80 browser link inventories; no streamed route errors.')
