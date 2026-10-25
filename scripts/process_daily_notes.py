#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Daily Markdown Note Batch Processor
Rule 1: Target files matching "YYYY-MM-DD <suffix>.md" (skip pure "YYYY-MM-DD.md").
Rule 2: Extract text from 11th character onwards (strip leading spaces), prepend "# <extracted_text>\n\n".
Rule 3: Rename to "YYYY-MM-DD.md".
Rule 4: If "YYYY-MM-DD.md" already exists, append to it and remove the long-named file.
"""

import os
import sys
import re
import shutil
import zipfile
import datetime
import unicodedata

DAILY_DIR = "/Users/takahashinorihiko/Library/Mobile Documents/iCloud~md~obsidian/Documents/My Note Matio/Daily"
PURE_DATE_RE = re.compile(r"^(\d{4}-\d{2}-\d{2})\.md$")

def get_target_files(daily_dir):
    files = sorted(os.listdir(daily_dir))
    pure_files = set()
    targets = []
    
    for f in files:
        if not f.endswith(".md"):
            continue
        name_no_ext = f[:-3]
        raw_date = name_no_ext[:10]
        norm_date = unicodedata.normalize("NFKC", raw_date)
        
        if PURE_DATE_RE.match(norm_date + ".md"):
            if len(name_no_ext) == 10:
                pure_files.add(f)
            else:
                # 11th char onwards
                rest = name_no_ext[10:]
                extracted_text = rest.lstrip()
                targets.append({
                    "orig_filename": f,
                    "date": norm_date,
                    "extracted_text": extracted_text,
                    "dest_filename": f"{norm_date}.md"
                })
    return targets, pure_files

def run_dry_run(daily_dir):
    targets, pure_files = get_target_files(daily_dir)
    print(f"[DRY-RUN] Found {len(targets)} target file(s) to process.")
    print(f"[DRY-RUN] Found {len(pure_files)} already-pure 'YYYY-MM-DD.md' file(s).\n")
    
    # Check conflicts
    conflicts = []
    seen_dests = set(pure_files)
    
    for t in targets:
        dest = t["dest_filename"]
        if dest in seen_dests:
            conflicts.append(t)
        seen_dests.add(dest)
        
    print(f"[DRY-RUN] Conflicts requiring merge: {len(conflicts)}")
    for c in conflicts:
        print(f"  - {c['orig_filename']} -> merge into existing {c['dest_filename']}")
    print()

def create_backup(daily_dir):
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_zip_path = os.path.join(os.path.dirname(daily_dir), f"Daily_backup_{timestamp}.zip")
    print(f"Creating safety backup at: {backup_zip_path}...")
    with zipfile.ZipFile(backup_zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, _, files in os.walk(daily_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, daily_dir)
                zf.write(full_path, rel_path)
    print("Backup created successfully.")
    return backup_zip_path

def execute_batch(daily_dir, make_backup=True):
    if make_backup:
        create_backup(daily_dir)
        
    targets, _ = get_target_files(daily_dir)
    print(f"Executing batch process on {len(targets)} files...")
    
    processed_count = 0
    merged_count = 0
    renamed_count = 0
    
    for t in targets:
        orig_path = os.path.join(daily_dir, t["orig_filename"])
        dest_path = os.path.join(daily_dir, t["dest_filename"])
        
        if not os.path.exists(orig_path):
            continue
            
        with open(orig_path, "r", encoding="utf-8") as f:
            orig_content = f.read()
            
        heading = f"# {t['extracted_text']}"
        new_block = f"{heading}\n\n{orig_content.lstrip()}" if orig_content.strip() else f"{heading}\n"
        
        if os.path.exists(dest_path) and os.path.abspath(orig_path) != os.path.abspath(dest_path):
            # Rule 4: Append to existing file and delete original
            with open(dest_path, "r", encoding="utf-8") as f:
                existing_content = f.read()
                
            merged_content = existing_content.rstrip() + "\n\n" + new_block
            with open(dest_path, "w", encoding="utf-8") as f:
                f.write(merged_content)
                
            os.remove(orig_path)
            print(f"[MERGED] {t['orig_filename']} -> {t['dest_filename']}")
            merged_count += 1
        else:
            # Rule 2 & 3: Prepend heading and rename
            with open(orig_path, "w", encoding="utf-8") as f:
                f.write(new_block)
            os.rename(orig_path, dest_path)
            print(f"[RENAMED] {t['orig_filename']} -> {t['dest_filename']}")
            renamed_count += 1
            
        processed_count += 1

    print(f"\nProcessing Complete!")
    print(f"Total processed: {processed_count} (Renamed: {renamed_count}, Merged: {merged_count})")

if __name__ == "__main__":
    if "--execute" in sys.argv:
        execute_batch(DAILY_DIR, make_backup=True)
    else:
        run_dry_run(DAILY_DIR)
