import hashlib, json
from pathlib import Path

archive = Path(r'C:/Users/grdez/Documents/codex-projects/codeyea/Generated images')
records = []
for asset in sorted(archive.rglob('*')):
    if asset.is_file() and asset.suffix.lower() in {'.png', '.webp', '.svg', '.jpg', '.jpeg'}:
        records.append({'file': asset.relative_to(archive).as_posix(), 'sha256': hashlib.sha256(asset.read_bytes()).hexdigest(), 'bytes': asset.stat().st_size})
(archive / 'asset-index.json').write_text(json.dumps(records, indent=2), encoding='utf-8')
print(f'Indexed {len(records)} archived assets')
