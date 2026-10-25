#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Daily Markdown Note Batch Processor v2
Rule 1: Target files matching "YYYY-MM-DD <suffix>.md" or "YYYY-MM-DD_<suffix>.md" (skip pure "YYYY-MM-DD.md").
Rule 2: Extract text from 11th character onwards (strip leading spaces and underscores), create "# <extracted_text>".
Rule 3: If YAML frontmatter exists ("---" at line 1 to closing "---"), insert heading directly after closing "---".
        If no frontmatter, insert heading at line 1.
Rule 4: Rename to "YYYY-MM-DD.md".
Rule 5: If "YYYY-MM-DD.md" already exists, append newline + heading + body (excluding frontmatter) to existing file,
        and delete the original long-named file.
"""

import os
import sys
import re
import zipfile
import datetime
import unicodedata

DAILY_DIR = "/Users/takahashinorihiko/Library/Mobile Documents/iCloud~md~obsidian/Documents/My Note Matio/Daily"
PURE_DATE_RE = re.compile(r"^(\d{4}-\d{2}-\d{2})\.md$")

def split_frontmatter(content):
    """
    Splits content into (frontmatter_block, body_content).
    frontmatter_block includes opening '---' to closing '---' with its trailing newline.
    If no frontmatter, frontmatter_block is "" and body_content is content.
    """
    lines = content.splitlines(keepends=True)
    if lines and lines[0].strip() == "---":
        closing_idx = -1
        for i in range(1, len(lines)):
            if lines[i].strip() == "---":
                closing_idx = i
                break
        if closing_idx != -1:
            frontmatter_block = "".join(lines[:closing_idx + 1])
            body_content = "".join(lines[closing_idx + 1:])
            return frontmatter_block, body_content
    return "", content

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
                # Strip leading half-width/full-width spaces and underscores
                extracted_text = re.sub(r"^[ \u3000_]+", "", rest)
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
    fm_count = 0
    for t in targets:
        path = os.path.join(daily_dir, t["orig_filename"])
        with open(path, "r", encoding="utf-8", errors="replace") as fp:
            fm, _ = split_frontmatter(fp.read())
            if fm:
                fm_count += 1
    print(f"[DRY-RUN] Target files with YAML frontmatter: {fm_count}\n")

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
            
        with open(orig_path, "r", encoding="utf-8", errors="replace") as f:
            orig_content = f.read()
            
        fm_block, body_content = split_frontmatter(orig_content)
        heading = f"# {t['extracted_text']}" if t['extracted_text'] else ""
        
        if os.path.exists(dest_path) and os.path.abspath(orig_path) != os.path.abspath(dest_path):
            # Rule 5: If destination exists, append to it excluding incoming frontmatter
            with open(dest_path, "r", encoding="utf-8", errors="replace") as f:
                existing_content = f.read()
                
            block_to_append = f"{heading}\n\n{body_content.lstrip()}" if heading else body_content.lstrip()
            merged_content = existing_content.rstrip() + "\n\n" + block_to_append
            
            with open(dest_path, "w", encoding="utf-8") as f:
                f.write(merged_content)
                
            os.remove(orig_path)
            merged_count += 1
        else:
            # Rule 3 & 4: Insert heading (after frontmatter if present, else at line 1) and rename
            if fm_block:
                new_content = f"{fm_block.rstrip()}\n\n{heading}\n\n{body_content.lstrip()}" if heading else f"{fm_block.rstrip()}\n\n{body_content.lstrip()}"
            else:
                new_content = f"{heading}\n\n{body_content.lstrip()}" if heading else body_content
                
            with open(orig_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            os.rename(orig_path, dest_path)
            renamed_count += 1
            
        processed_count += 1

    print(f"\nProcessing Complete!")
    print(f"Total processed: {processed_count} (Renamed: {renamed_count}, Merged: {merged_count})")

if __name__ == "__main__":
    if "--execute" in sys.argv:
        execute_batch(DAILY_DIR, make_backup=True)
    else:
        run_dry_run(DAILY_DIR)
