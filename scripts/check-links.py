#!/usr/bin/env python3
"""
check-links.py

Simple script to check for broken internal links in MDX documentation files.
Checks both markdown links [text](url) and href attributes href="url".

Usage:
    python check-links.py
"""

import sys
import os
import re
import glob
from urllib.parse import urlparse

def find_docs_dir():
    """Find the docs directory relative to script location - works from project root or scripts folder"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Try current directory first (if run from project root)
    docs_dir = os.path.join(script_dir, 'docs')
    if os.path.exists(docs_dir):
        return docs_dir
    
    # Try parent directory (if run from scripts folder)
    docs_dir = os.path.join(script_dir, '..', 'docs')
    if os.path.exists(docs_dir):
        return docs_dir
    
    # Try relative to current working directory
    docs_dir = 'docs'
    if os.path.exists(docs_dir):
        return docs_dir
    
    return None

def is_template_or_dynamic(link):
    """Check if link is a template variable or dynamic content that should be ignored"""
    # Template variables: ${variable}, {variable}, {{variable}}
    if ('${' in link and '}' in link) or ('{' in link and '}' in link):
        return True
    
    # Dynamic placeholders: [variable], <variable>
    if ('[' in link and ']' in link) or ('<' in link and '>' in link):
        return True
    
    # Common template patterns: :variable, @variable
    if link.startswith(':') or link.startswith('@'):
        return True
    
    # Interpolation patterns: %variable%, %{variable}
    if ('%' in link and link.count('%') >= 2) or ('%{' in link and '}' in link):
        return True
    
    return False

def find_links(file_path):
    """Extract all links from file - both markdown [text](url) and HTML href="url" formats"""
    # Regex for markdown links: [text](url)
    markdown_pattern = re.compile(r'\[[^\]]+\]\(([^)]+)\)')
    # Regex for href attributes: href="url" or href='url' (case insensitive)
    href_pattern = re.compile(r'href=["\']([^"\']+)["\']', re.IGNORECASE)
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract URLs from both link types
        markdown_links = markdown_pattern.findall(content)
        href_links = href_pattern.findall(content)
        
        # Filter out template variables and dynamic content
        filtered_links = [link for link in markdown_links + href_links if not is_template_or_dynamic(link)]
        
        # Return combined list of all found URLs
        return filtered_links
        
    except Exception as e:
        print(f"Warning: Could not read {file_path}: {e}")
        return []

def is_internal(link):
    """Check if link is internal (relative/absolute path) vs external (http/https URL)"""
    parsed = urlparse(link)
    # Internal = no protocol scheme + doesn't start with http + no domain
    return parsed.scheme == '' and not link.startswith('http') and parsed.netloc == ''

def normalize_link(link):
    """Clean link by removing URL fragments (#section) and query params (?param=value)"""
    return link.split('#', 1)[0].split('?', 1)[0].strip()

def check_file_exists(path):
    """Check if file/directory exists, trying common variations (.mdx, .md, /index.mdx)"""
    candidates = [path]
    
    # Try adding file extensions if not present
    if not any(path.endswith(ext) for ext in ('.mdx', '.md')):
        candidates.append(path + '.mdx')
        candidates.append(path + '.md')
    
    # Try index files if path is a directory
    if os.path.isdir(path):
        candidates.append(os.path.join(path, 'index.mdx'))
        candidates.append(os.path.join(path, 'index.md'))
    
    return any(os.path.exists(c) for c in candidates)

def main():
    """Main function - scan all MDX files and report broken internal links"""
    docs_dir = find_docs_dir()
    
    if not docs_dir:
        print("❌ Error: docs directory not found")
        print("Make sure you're running this from the project root or scripts folder")
        sys.exit(1)
    
    print("🔍 Checking for broken links in documentation...\n")
    print(f"Using docs directory: {docs_dir}")
    print("Checking both markdown links [text](url) and href attributes href=\"url\"")
    print("Filtering out template variables (${var}, {var}, [var], <var>, :var, @var, %var%)\n")
    
    # Get all MDX files recursively
    mdx_files = glob.glob(os.path.join(docs_dir, '**/*.mdx'), recursive=True)
    broken = {}  # Dictionary to store broken links by file
    total_files = 0
    total_links = 0
    
    # Process each MDX file
    for mdx in mdx_files:
        total_files += 1
        links = find_links(mdx)
        rel_dir = os.path.dirname(mdx)  # Directory containing current file
        
        # Check each link found in the file
        for link in links:
            total_links += 1
            
            # Skip external links (http/https)
            if not is_internal(link):
                continue
                
            # Clean up link (remove fragments/queries)
            norm = normalize_link(link)
            if not norm:
                continue
                
            # Resolve link path relative to file location
            if norm.startswith('/'):
                # Absolute path: could be docs root or NextJS public assets
                target = os.path.join(docs_dir, norm.lstrip('/'))
                
                # If not found in docs, try NextJS public directory
                if not check_file_exists(target):
                    public_dir = os.path.join(os.path.dirname(docs_dir), 'public')
                    public_target = os.path.join(public_dir, norm.lstrip('/'))
                    if check_file_exists(public_target):
                        target = public_target
            else:
                # Relative path: relative to current file's directory
                target = os.path.join(rel_dir, norm)
                
            # Check if target file exists
            if not check_file_exists(target):
                src_rel = os.path.relpath(mdx, '.')
                if link == ".+?":  # Skip regex false positives
                    continue
                # Record broken link
                broken.setdefault(src_rel, []).append(link)
    
    # Display results
    if broken:
        print("❌ Found broken links:\n")
        for src, links in broken.items():
            print(f"📄 {src}")
            for link in links:
                print(f"   ❌ {link}")
            print()
        
        total_broken = sum(len(links) for links in broken.values())
        print(f"Summary: {total_broken} broken links in {len(broken)} files")
        print(f"Checked {total_links} links across {total_files} files")
        sys.exit(1)  # Exit with error code for CI/CD
    else:
        print("✅ No broken links found!")
        print(f"Checked {total_links} links across {total_files} files")

if __name__ == '__main__':
    main() 