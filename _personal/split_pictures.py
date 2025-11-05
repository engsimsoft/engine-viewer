#!/usr/bin/env python3
"""
Split Pictures folder by chapter for markdown-chapters.
Each chapter gets its own XX-Pictures/ folder with only the images it uses.
"""

import os
import re
import shutil
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).parent / "markdown-chapters"
PICTURES_DIR = BASE_DIR / "Pictures"

# Find all chapter markdown files
chapters = sorted([f for f in BASE_DIR.glob("*.md") if f.name != "README.md"])

print(f"Found {len(chapters)} chapters")
print(f"Pictures directory: {PICTURES_DIR}")
print(f"Total images available: {len(list(PICTURES_DIR.glob('*')))}")
print()

# Process each chapter
for chapter_file in chapters:
    chapter_num = chapter_file.stem.split("-")[0]  # Extract "01", "02", etc.
    chapter_name = chapter_file.stem

    print(f"Processing {chapter_name}...")

    # Read chapter content
    content = chapter_file.read_text(encoding='utf-8')

    # Find all image references: Pictures/filename.jpg
    image_pattern = r'Pictures/([^)]+)'
    images = re.findall(image_pattern, content)

    if not images:
        print(f"  No images found in {chapter_name}")
        continue

    print(f"  Found {len(images)} image references")

    # Create chapter-specific Pictures folder
    chapter_pictures_dir = BASE_DIR / f"{chapter_num}-Pictures"
    chapter_pictures_dir.mkdir(exist_ok=True)

    # Copy images and track which ones exist
    copied_count = 0
    missing_count = 0

    for img in set(images):  # Use set to avoid duplicates
        src = PICTURES_DIR / img
        dst = chapter_pictures_dir / img

        if src.exists():
            # Create subdirectories if needed
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
            copied_count += 1
        else:
            print(f"    WARNING: Image not found: {img}")
            missing_count += 1

    print(f"  Copied {copied_count} images to {chapter_num}-Pictures/")
    if missing_count > 0:
        print(f"  WARNING: {missing_count} images missing!")

    # Update markdown links: Pictures/ -> XX-Pictures/
    new_content = re.sub(
        r'Pictures/',
        f'{chapter_num}-Pictures/',
        content
    )

    # Write updated content
    chapter_file.write_text(new_content, encoding='utf-8')
    print(f"  Updated links in {chapter_name}")
    print()

print("=" * 60)
print("Done! Summary:")
print(f"  Processed {len(chapters)} chapters")
print(f"  Created {len([d for d in BASE_DIR.glob('*-Pictures') if d.is_dir()])} chapter-specific Pictures folders")
print()
print("Next steps:")
print("  1. Verify images load correctly in markdown preview")
print("  2. Delete old Pictures/ folder: rm -rf Pictures/")
print("  3. Commit changes")
