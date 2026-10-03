"""Verify lossless delivery assets against the preserved generated PNG masters.

Run with Python 3 and Pillow (development utility; no browser dependency).
"""
import hashlib
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'docs/art-manifest.json').read_text())
for entry in manifest:
    source = root / entry['file']
    delivery = root / entry['delivery']['file']
    for path, record in [(source, entry), (delivery, entry['delivery'])]:
        assert path.stat().st_size == record['bytes'], f'Size changed: {path}'
        assert hashlib.sha256(path.read_bytes()).hexdigest() == record['sha256'], f'Checksum changed: {path}'
    with Image.open(source) as original, Image.open(delivery) as encoded:
        assert original.size == encoded.size == tuple(entry['pixels']), f'Dimensions changed: {source}'
        pixels = encoded.convert('RGBA').tobytes()
        assert original.convert('RGBA').tobytes() == pixels, f'Pixels changed: {source}'
        assert hashlib.sha256(pixels).hexdigest() == entry['delivery']['decoded_rgba_sha256']
print(f'{len(manifest)} delivery assets verified: identical dimensions, colours and transparency.')
