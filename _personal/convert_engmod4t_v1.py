#!/usr/bin/env python3
"""
Convert EngMod4T Help (CHM extracted HTML) to Markdown chapters
Based on convert_post4t_v3.py pattern
"""

import subprocess
from pathlib import Path
import shutil
import re

# Paths
EXTRACTED_DIR = Path('EngMod4THelp-extracted')
CONTENTS_DIR = EXTRACTED_DIR / 'Contents'
PICTURES_DIR = EXTRACTED_DIR / 'Pictures'
OUTPUT_DIR = Path('EngMod4THelp-chapters')

def preprocess_html(html_file):
    """Fix relative paths before pandoc conversion"""
    content = html_file.read_text(encoding='utf-8', errors='ignore')
    # Fix relative paths: ../Pictures/ -> Pictures/
    content = content.replace('../Pictures/', 'Pictures/')
    return content

def convert_html_to_md(html_file, output_file):
    """Convert HTML to Markdown using pandoc"""
    # Preprocess HTML
    preprocessed_content = preprocess_html(html_file)

    # Write to temp file
    temp_html = html_file.parent / f'_temp_{html_file.name}'
    temp_html.write_text(preprocessed_content, encoding='utf-8')

    try:
        subprocess.run([
            'pandoc',
            str(temp_html),
            '-f', 'html',
            '-t', 'markdown',
            '--wrap=none',
            '-o', str(output_file)
        ], check=True)
    finally:
        # Clean up temp file
        if temp_html.exists():
            temp_html.unlink()

def extract_images_from_md(md_file):
    """Extract image references from markdown file"""
    content = md_file.read_text(encoding='utf-8')
    # Pattern: ![...](Pictures/filename.ext)
    image_pattern = r'Pictures/([^)]+)'
    images = re.findall(image_pattern, content)
    return list(set(images))  # Unique images

def main():
    print("🔧 EngMod4T Help → Markdown Converter")
    print("=" * 60)

    # Create output directory
    OUTPUT_DIR.mkdir(exist_ok=True)

    # Get all HTML files
    html_files = sorted(CONTENTS_DIR.glob('*.htm*'))
    print(f"\n📄 Found {len(html_files)} HTML files")

    # Convert HTML to Markdown
    print("\n🔄 Converting HTML → Markdown...")
    chapter_files = []
    for idx, html_file in enumerate(html_files, 1):
        chapter_num = f'{idx:02d}'
        md_filename = f'{chapter_num}-{html_file.stem}.md'
        md_file = OUTPUT_DIR / md_filename

        print(f"  {chapter_num}. {html_file.stem} → {md_filename}")
        convert_html_to_md(html_file, md_file)
        chapter_files.append((chapter_num, md_file))

    # Analyze images per chapter
    print("\n🖼️  Analyzing images per chapter...")
    chapter_images = {}
    all_used_images = set()

    for chapter_num, md_file in chapter_files:
        images = extract_images_from_md(md_file)
        if images:
            chapter_images[chapter_num] = images
            all_used_images.update(images)
            print(f"  Chapter {chapter_num}: {len(images)} images")

    # Create Pictures folders and copy images
    print("\n📂 Creating Pictures folders...")
    for chapter_num, images in chapter_images.items():
        pictures_dir = OUTPUT_DIR / f'{chapter_num}-Pictures'
        pictures_dir.mkdir(exist_ok=True)

        for image in images:
            src = PICTURES_DIR / image
            dst = pictures_dir / image
            if src.exists():
                shutil.copy2(src, dst)
            else:
                print(f"  ⚠️  Missing: {image}")

        print(f"  {chapter_num}-Pictures/: {len(images)} images copied")

    # Update markdown links: Pictures/ -> XX-Pictures/
    print("\n🔗 Updating image links in markdown...")
    for chapter_num, md_file in chapter_files:
        if chapter_num in chapter_images:
            content = md_file.read_text(encoding='utf-8')
            # Replace Pictures/ with XX-Pictures/
            content = re.sub(r'Pictures/', f'{chapter_num}-Pictures/', content)
            md_file.write_text(content, encoding='utf-8')
            print(f"  Updated: {md_file.name}")

    # Create README
    print("\n📝 Creating README.md...")
    readme_content = f"""# EngMod4T - Simulation Engine Documentation (Markdown + Images)

**Источник:** EngMod4T Help.chm (извлечено и конвертировано в Markdown)
**Дата конвертации:** 5 ноября 2025
**Формат:** Markdown + изображения разбиты по главам - оптимизировано для Claude Chat!

---

## 📚 Структура

```
EngMod4THelp-chapters/
"""

    # Add chapter list
    for chapter_num, md_file in chapter_files:
        size_kb = md_file.stat().st_size / 1024
        readme_content += f"├── {md_file.name:40s} # {size_kb:.1f} KB\n"
        if chapter_num in chapter_images:
            num_images = len(chapter_images[chapter_num])
            readme_content += f"├── {chapter_num}-Pictures/:30s # {num_images} изображений\n"

    readme_content += """└── README.md
```

**Общий размер:** ~2 MB (текст + картинки)
**Структура:** Каждая глава имеет свою папку XX-Pictures/ с только нужными изображениями

---

## ✅ О документации

**EngMod4T** - simulation engine для системы моделирования двигателей EngMod4T Suite.

**Что содержит:**
- Installation & StartUp
- Folder Structure & File Formats
- Simulation Modes (Screen Mode, Batch Mode)
- Output Files (Performance, Graphics, Text)
- Trace Types (Pressure, Temperature, Mach, Wave, Mass, Efficiency, Combustion, Turbo, Pure)
- Graphics Output (1-cylinder, 2-4 cylinders, 5-8 cylinders)
- Error Handling & Runtime Control

**Формат:**
- Каждая глава = отдельный .md файл
- Картинки разбиты по главам (`01-Pictures/`, `02-Pictures/`, ...)
- Оптимизировано для Claude Chat (можно присоединить репозиторий!)

---

## 📊 Статистика

- **HTML файлов:** {len(html_files)}
- **Markdown глав:** {len(chapter_files)}
- **Глав с изображениями:** {len(chapter_images)}
- **Всего изображений использовано:** {len(all_used_images)}
- **Всего изображений в Pictures/:** {len(list(PICTURES_DIR.glob('*')))}

---

**Документация готова!** Можешь обсуждать с Claude Chat как работает EngMod4T! 🎉
"""

    readme_file = OUTPUT_DIR / 'README.md'
    readme_file.write_text(readme_content, encoding='utf-8')

    # Summary
    print("\n" + "=" * 60)
    print("✅ CONVERSION COMPLETE!")
    print(f"\n📂 Output directory: {OUTPUT_DIR.absolute()}")
    print(f"📄 Markdown chapters: {len(chapter_files)}")
    print(f"🖼️  Chapters with images: {len(chapter_images)}")
    print(f"📊 Total images used: {len(all_used_images)}")
    print(f"📝 README.md created")
    print("\n🎉 Ready for Claude Chat!")

if __name__ == '__main__':
    main()
