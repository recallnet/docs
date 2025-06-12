#!/usr/bin/env python3
"""
check_links.py

A script to find internal broken links in MDX files within a documentation directory.

Usage:
    python check_links.py --root . --docs docs

This will scan all .mdx files under the 'docs' directory (relative to project root),
find markdown links of the form [label](path), and report any internal links
whose targets do not exist.

Example output:
    getstarted.mdx -> broken link to /old/faq
"""

import sys
import os
import re
import glob
import argparse
from urllib.parse import urlparse

def find_links(file_path):
    pattern = re.compile(r'\[[^\]]+\]\(([^)]+)\)')
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    return pattern.findall(content)

def is_internal(link):
    parsed = urlparse(link)
    return parsed.scheme == '' and not link.startswith('http') and parsed.netloc == ''

def normalize_link(link):
    # Remove any fragment (#...) or query (?...)
    return link.split('#', 1)[0].split('?', 1)[0].strip()

def check_file_exists(path):
    # Check for file or directory-index variations
    candidates = [path]
    if not any(path.endswith(ext) for ext in ('.mdx', '.md')):
        candidates.append(path + '.mdx')
        candidates.append(path + '.md')
    if os.path.isdir(path):
        candidates.append(os.path.join(path, 'index.mdx'))
        candidates.append(os.path.join(path, 'index.md'))
    return any(os.path.exists(c) for c in candidates)

def main(root, docs_dir):
    root = os.path.abspath(root)
    docs_dir = os.path.join(root, docs_dir)
    mdx_files = glob.glob(os.path.join(docs_dir, '**/*.mdx'), recursive=True)
    broken = {}

    for mdx in mdx_files:
        links = find_links(mdx)
        rel_dir = os.path.dirname(mdx)
        for link in links:
            if not is_internal(link):
                continue
            norm = normalize_link(link)
            if not norm:
                continue
            if norm.startswith('/'):
                target = os.path.join(docs_dir, norm.lstrip('/'))
            else:
                target = os.path.join(rel_dir, norm)
            if check_file_exists(target):
                continue
            src_rel = os.path.relpath(mdx, root)
            if link == ".+?": # regex false positive
                continue
            broken.setdefault(src_rel, []).append(link)

    if broken:
        for src, links in broken.items():
            for l in links:
                print(f"{src} -> broken link to {l}")
        sys.exit(1)
    else:
        print("No broken links found.")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Check internal links in MDX files')
    parser.add_argument('--root', default='.', help='Project root directory')
    parser.add_argument('--docs', default='docs', help='Docs directory relative to root')
    args = parser.parse_args()
    main(args.root, args.docs)

