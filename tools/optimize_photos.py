#!/usr/bin/env python3
"""
Resize phone photos and name them 01.jpg, 02.jpg ... inside the photos/ folder.

Usage (from the project folder):
    pip install pillow
    python3 tools/optimize_photos.py "C:/Users/you/Desktop/raw_photos"

Photos are taken in alphabetical order of their file names, so the first file
becomes 01.jpg (matches id "01" in data.js), the second becomes 02.jpg, and so on.
The mapping is printed so you can double check it.
"""
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow is missing. Run:  pip install pillow")

EXTS = {".jpg", ".jpeg", ".png", ".webp"}

if len(sys.argv) != 2:
    sys.exit(__doc__)

src = Path(sys.argv[1]).expanduser()
if not src.is_dir():
    sys.exit(f"Folder not found: {src}")

out = Path(__file__).resolve().parent.parent / "photos"
out.mkdir(exist_ok=True)

files = sorted(p for p in src.iterdir() if p.suffix.lower() in EXTS)
if not files:
    sys.exit("No .jpg / .png / .webp files found in that folder.")
if len(files) != 20:
    print(f"Note: found {len(files)} photos (expected 20).")

for i, p in enumerate(files, 1):
    im = Image.open(p)
    im = ImageOps.exif_transpose(im).convert("RGB")   # fixes sideways phone photos
    im.thumbnail((900, 900))                          # plenty sharp, loads fast
    target = out / f"{i:02d}.jpg"
    im.save(target, "JPEG", quality=85, optimize=True)
    print(f"{target.name}  <-  {p.name}")

print(f"\nDone. {len(files)} photos saved to {out}")
