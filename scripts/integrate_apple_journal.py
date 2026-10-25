#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Apple Journal to Obsidian Daily Media Integrator
Parses HTML files from /Volumes/SSD/AppleJournalEntries/Entries,
extracts referenced media from Resources/,
converts HEIF-in-JPEG/PNG to genuine JPEG/PNG via macOS `sips`,
copies media to Obsidian's Daily/Attachments,
and embeds ![[filename]] links into Daily/YYYY-MM-DD.md.
"""

import os
import sys
import re
import shutil
import subprocess
import zipfile
import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

ENTRIES_DIR = "/Volumes/SSD/AppleJournalEntries/Entries"
RESOURCES_DIR = "/Volumes/SSD/AppleJournalEntries/Resources"
DAILY_DIR = "/Users/takahashinorihiko/Library/Mobile Documents/iCloud~md~obsidian/Documents/My Note Matio/Daily"
ATTACHMENTS_DIR = os.path.join(DAILY_DIR, "Attachments")

def get_media_format_via_sips(file_path):
    try:
        res = subprocess.run(["sips", "-g", "format", file_path], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        for line in res.stdout.splitlines():
            if "format:" in line:
                return line.split("format:")[-1].strip().lower()
    except Exception:
        pass
    return ""

def process_single_media(ref):
    """
    Copies and converts if necessary a single media reference.
    Returns (ref, status_string) where status is 'converted', 'copied', or 'existed'.
    """
    src_path = os.path.join(RESOURCES_DIR, ref)
    if not os.path.exists(src_path):
        return ref, "missing"
        
    dest_path = os.path.join(ATTACHMENTS_DIR, ref)
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 0:
        return ref, "existed"
        
    ext = os.path.splitext(ref)[1].lower()
    fmt = get_media_format_via_sips(src_path)
    is_heif = (fmt == "heic" or fmt == "heif")
    
    if is_heif:
        target_fmt = "png" if ext == ".png" else "jpeg"
        cmd = ["sips", "-s", "format", target_fmt, src_path, "--out", dest_path]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if res.returncode == 0:
            return ref, "converted"
        else:
            shutil.copy2(src_path, dest_path)
            return ref, "copied"
    else:
        shutil.copy2(src_path, dest_path)
        return ref, "copied"

def parse_html_entry(html_path):
    with open(html_path, "r", encoding="utf-8", errors="replace") as fp:
        html = fp.read()
        
    filename = os.path.basename(html_path)
    m = re.match(r"^(\d{4}-\d{2}-\d{2})(?:_(.+))?\.html$", filename)
    if not m:
        return None
        
    date_str = m.group(1)
    file_title = m.group(2) or ""
    
    # Extract title from <div class="title"> if present
    title_m = re.search(r"<div class=[\x22\x27]title[\x22\x27]>([^<]+)</div>", html)
    html_title = title_m.group(1).strip() if title_m else file_title
    
    # Extract media references (src="../Resources/...")
    media_refs = re.findall(r"src=[\x22\x27]\.\./Resources/([^\x22\x27]+)[\x22\x27]", html)
    seen = set()
    unique_media = []
    for r in media_refs:
        if r not in seen:
            seen.add(r)
            unique_media.append(r)
            
    # Extract body text
    body_match = re.search(r"<div class=[\x22\x27]bodyText[\x22\x27]>([\s\S]*?)</div>\s*</div>\s*</span>", html)
    if not body_match:
        body_match = re.search(r"<div class=[\x22\x27]bodyText[\x22\x27]>([\s\S]*?)(?:</body>|$)", html)
        
    body_html = body_match.group(1) if body_match else ""
    body_text = re.sub(r"<br\s*/?>", "\n", body_html)
    body_text = re.sub(r"</p>", "\n\n", body_text)
    body_text = re.sub(r"<[^>]+>", "", body_text)
    body_text = re.sub(r"\n{3,}", "\n\n", body_text).strip()
    
    return {
        "filename": filename,
        "date": date_str,
        "title": html_title,
        "media_refs": unique_media,
        "body_text": body_text
    }

def create_daily_backup():
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_zip = os.path.join(os.path.dirname(DAILY_DIR), f"Daily_backup_before_journal_{timestamp}.zip")
    print(f"Creating safety backup at: {backup_zip}...")
    with zipfile.ZipFile(backup_zip, "w", zipfile.ZIP_DEFLATED) as zf:
        for item in os.listdir(DAILY_DIR):
            if item.endswith(".md"):
                full_p = os.path.join(DAILY_DIR, item)
                zf.write(full_p, item)
    print("Backup created successfully.")
    return backup_zip

def integrate_all():
    print("=" * 60)
    print("Apple Journal to Obsidian Media Integration")
    print("=" * 60)
    
    # Step 1: Safety backup
    create_daily_backup()
    
    # Ensure Attachments dir exists
    os.makedirs(ATTACHMENTS_DIR, exist_ok=True)
    
    # Step 2: Parse all HTML files and collect media
    html_files = sorted([f for f in os.listdir(ENTRIES_DIR) if f.endswith(".html")])
    print(f"Scanning {len(html_files)} HTML entries...")
    
    entries = []
    all_media_set = set()
    for h in html_files:
        p = os.path.join(ENTRIES_DIR, h)
        parsed = parse_html_entry(p)
        if parsed:
            entries.append(parsed)
            for m in parsed["media_refs"]:
                all_media_set.add(m)
                
    print(f"Found {len(all_media_set)} unique media file references across {len(entries)} entries.")
    
    # Step 3: Copy and convert media in parallel
    print("Copying & converting media (HEIF -> true JPEG/PNG) to Daily/Attachments...")
    stats = {"converted": 0, "copied": 0, "existed": 0, "missing": 0}
    
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(process_single_media, ref): ref for ref in all_media_set}
        for future in as_completed(futures):
            _, status = future.result()
            stats[status] = stats.get(status, 0) + 1
            
    print(f"Media processing results: Converted(HEIF): {stats['converted']}, Copied(Direct): {stats['copied']}, Already Existed: {stats['existed']}, Missing: {stats['missing']}\n")
    
    # Step 4: Embed media links into Daily notes
    print("Embedding media links into Daily Markdown notes...")
    updated_notes_count = 0
    created_notes_count = 0
    skipped_no_media_count = 0
    
    for entry in entries:
        if not entry["media_refs"]:
            skipped_no_media_count += 1
            continue
            
        daily_file = f"{entry['date']}.md"
        daily_path = os.path.join(DAILY_DIR, daily_file)
        
        media_links = [f"![[{r}]]" for r in entry["media_refs"]]
        media_block = "\n".join(media_links)
        
        if not os.path.exists(daily_path):
            # Create new file
            heading_part = f"# {entry['title']}\n\n" if entry['title'] else ""
            content = f"{heading_part}{media_block}\n\n{entry['body_text']}".strip() + "\n"
            with open(daily_path, "w", encoding="utf-8") as fp:
                fp.write(content)
            created_notes_count += 1
            continue
            
        with open(daily_path, "r", encoding="utf-8", errors="replace") as fp:
            existing_content = fp.read()
            
        # Check if media links already embedded
        if all(link in existing_content for link in media_links):
            continue
            
        # Strategy 1: Heading match
        title = entry["title"]
        heading = f"# {title}" if title else ""
        
        if heading and heading in existing_content:
            # Find the position of heading
            pattern = re.compile(rf"^({re.escape(heading)}\s*\n)", re.MULTILINE)
            m = pattern.search(existing_content)
            if m:
                insert_pos = m.end()
                new_content = existing_content[:insert_pos] + "\n" + media_block + "\n\n" + existing_content[insert_pos:].lstrip()
            else:
                new_content = existing_content.replace(heading, f"{heading}\n\n{media_block}\n")
            updated_notes_count += 1
        else:
            # Strategy 2: Body text match (if existing content contains body sample)
            sample_body = entry["body_text"][:60].strip() if entry["body_text"] else ""
            if sample_body and sample_body in existing_content:
                # Find where sample_body starts
                pos = existing_content.find(sample_body)
                # If there is a title, prepend heading + media_block
                insert_str = f"{heading}\n\n{media_block}\n\n" if heading else f"{media_block}\n\n"
                new_content = existing_content[:pos] + insert_str + existing_content[pos:]
                updated_notes_count += 1
            else:
                # Strategy 3: Check if file has frontmatter, insert after frontmatter or append
                if existing_content.strip() == "":
                    heading_part = f"{heading}\n\n" if heading else ""
                    new_content = f"{heading_part}{media_block}\n\n{entry['body_text']}".strip() + "\n"
                else:
                    # Append as new section
                    heading_part = f"{heading}\n\n" if heading else ""
                    body_part = f"\n\n{entry['body_text']}" if entry['body_text'] else ""
                    new_content = existing_content.rstrip() + f"\n\n{heading_part}{media_block}{body_part}\n"
                updated_notes_count += 1
                
        with open(daily_path, "w", encoding="utf-8") as fp:
            fp.write(new_content)

    print(f"Daily Notes Integration Complete!")
    print(f"Notes Updated: {updated_notes_count}")
    print(f"Notes Created: {created_notes_count}")
    print(f"Entries without media (skipped): {skipped_no_media_count}")
    print("=" * 60)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--execute":
        integrate_all()
    elif len(sys.argv) > 1 and sys.argv[1] == "--preview":
        target = sys.argv[2] if len(sys.argv) > 2 else "2026-08-18_なぎちゃんとの再会.html"
        from integrate_apple_journal import preview_entry_integration
        preview_entry_integration(target)
    else:
        print("Usage: python3 integrate_apple_journal.py [--preview <file> | --execute]")
