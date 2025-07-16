#!/usr/bin/env python3
"""
fix-links.py

Simple script to automatically fix broken internal links in MDX documentation files.
Fixes both markdown links [text](url) and href attributes href="url".

Usage:
    python fix-links.py [--dry-run]
    
Options:
    --dry-run    Show what would be fixed without making changes
"""

import sys
import os
import re
import glob
import argparse
from difflib import SequenceMatcher

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

def get_all_current_files():
    """Build set of all valid URL paths from existing MDX files for link validation"""
    docs_dir = find_docs_dir()
    if not docs_dir:
        return set()
        
    mdx_files = glob.glob(os.path.join(docs_dir, '**/*.mdx'), recursive=True)
    current_urls = set()
    
    for file in mdx_files:
        # Convert file path to URL path
        rel_path = os.path.relpath(file, docs_dir)
        path_without_ext = rel_path.replace('.mdx', '')
        url_path = '/' + path_without_ext.replace(os.sep, '/')
        current_urls.add(url_path)
        
        # Add index variations (both /path/index and /path)
        if url_path.endswith('/index'):
            current_urls.add(url_path[:-6])  # Remove /index
        else:
            current_urls.add(url_path + '/index')  # Add /index
    
    return current_urls

def generate_link_fixes():
    """Define mapping rules for common folder moves (old path → new path)"""
    return {
        # Main directories moved to advanced/
        '/agents': '/advanced/agents',
        '/agent-toolkit': '/advanced/agent-toolkit',
        '/sources': '/advanced/sources',
        '/frameworks': '/advanced/frameworks',
        '/mcp': '/advanced/mcp',
        '/protocol': '/advanced/protocol',
        '/tools': '/advanced/tools',
        
        # Developer resources moved
        '/developer-resources/protocol': '/advanced/protocol',
        '/developer-resources/tools': '/advanced/tools',
        
        # Old agent-toolkit paths
        '/agents/build-your-agent/agent-toolkit': '/advanced/agent-toolkit',
        
        # Framework paths (old /framework/* to /advanced/frameworks/*)
        '/framework/mastra': '/advanced/frameworks/mastra',
        '/framework/langchain': '/advanced/frameworks/langchain',
        '/framework/openai': '/advanced/frameworks/openai',
        '/framework/ai-sdk': '/advanced/frameworks/ai-sdk',
        '/framework/eliza': '/advanced/frameworks/eliza',
        
        # Specific quickstart moves
        '/quickstart/portfolio-manager-tutorial': '/competitions/guides/portfolio-manager-tutorial',
        
        # Common relative link fixes (missing leading slash)
        'advanced/': '/advanced/',
        'agents/': '/advanced/agents/',
        'agent-toolkit/': '/advanced/agent-toolkit/',
        'sources/': '/advanced/sources/',
        'frameworks/': '/advanced/frameworks/',
        'mcp/': '/advanced/mcp/',
        'protocol/': '/advanced/protocol/',
        'tools/': '/advanced/tools/',
        'framework/': '/advanced/frameworks/',

        # After refactoring docs for the competitions app
        "competitions/guides/": "/competitions/developer-guides/",
    }

def similarity(a, b):
    """Calculate string similarity ratio (0.0 to 1.0) using sequence matching"""
    return SequenceMatcher(None, a, b).ratio()

def find_fuzzy_match(broken_link, current_urls, min_similarity=0.8):
    """Find best fuzzy match for broken link to catch typos (e.g. 'sourcess' → 'sources')"""
    best_match = None
    best_score = 0
    
    for url in current_urls:
        score = similarity(broken_link, url)
        if score > best_score and score >= min_similarity:
            best_score = score
            best_match = url
    
    return best_match if best_score >= min_similarity else None

def smart_fix_link(broken_link, current_urls, link_fixes):
    """Try multiple strategies to fix a broken link: direct mapping, patterns, /advanced/ prefix, fuzzy matching"""
    # Strategy 1: Direct mapping from fix rules
    if broken_link in link_fixes:
        potential_fix = link_fixes[broken_link]
        if potential_fix in current_urls:
            return potential_fix
    
    # Strategy 2: Pattern matching (e.g. /protocol/x → /advanced/protocol/x)
    for old_pattern, new_pattern in link_fixes.items():
        if broken_link.startswith(old_pattern):
            potential_fix = broken_link.replace(old_pattern, new_pattern, 1)
            if potential_fix in current_urls:
                return potential_fix
    
    # Strategy 3: Try adding /advanced/ prefix for common directories
    if broken_link.startswith('/'):
        parts = broken_link.strip('/').split('/')
        if len(parts) > 0:
            first_part = parts[0]
            common_dirs = ['agents', 'agent-toolkit', 'sources', 'frameworks', 'mcp', 'protocol', 'tools']
            if first_part in common_dirs:
                potential_fix = '/advanced/' + broken_link.lstrip('/')
                if potential_fix in current_urls:
                    return potential_fix
    
    # Strategy 4: Fuzzy matching for typos
    fuzzy_match = find_fuzzy_match(broken_link, current_urls)
    if fuzzy_match:
        return fuzzy_match
    
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

def fix_file_links(file_path, current_urls, link_fixes, dry_run=False):
    """Process single file to fix broken links using regex replacement functions"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        changes = []  # Track all changes made
        
        def replace_markdown_link(match):
            """Replacement function for markdown links [text](url)"""
            full_match = match.group(0)
            link_text = match.group(1)
            link_url = match.group(2)
            
            # Skip external links (http/https) and fragments/queries
            if link_url.startswith('http') or '#' in link_url or '?' in link_url:
                return full_match
            
            # Skip template variables or dynamic content
            if is_template_or_dynamic(link_url):
                return full_match
            
            # Try to fix the link
            fixed_url = smart_fix_link(link_url, current_urls, link_fixes)
            if fixed_url and fixed_url != link_url:
                changes.append((link_url, fixed_url))
                return f'[{link_text}]({fixed_url})'
            
            return full_match
        
        def replace_href_link(match):
            """Replacement function for href attributes href="url" or href='url'"""
            full_match = match.group(0)
            quote_char = match.group(1)  # Preserve original quote style (" or ')
            link_url = match.group(2)
            
            # Skip external links (http/https) and fragments/queries
            if link_url.startswith('http') or '#' in link_url or '?' in link_url:
                return full_match
            
            # Skip template variables or dynamic content
            if is_template_or_dynamic(link_url):
                return full_match
            
            # Try to fix the link
            fixed_url = smart_fix_link(link_url, current_urls, link_fixes)
            if fixed_url and fixed_url != link_url:
                changes.append((link_url, fixed_url))
                return f'href={quote_char}{fixed_url}{quote_char}'
            
            return full_match
        
        # Apply fixes using regex substitution
        # Process markdown links: [text](url)
        markdown_pattern = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')
        new_content = markdown_pattern.sub(replace_markdown_link, content)
        
        # Process href attributes: href="url" or href='url' (case insensitive)
        href_pattern = re.compile(r'href=(["\'])([^"\']+)\1', re.IGNORECASE)
        new_content = href_pattern.sub(replace_href_link, new_content)
        
        # Save changes to file (unless dry run)
        if changes and not dry_run:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
        
        return changes
        
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return []

def main():
    """Main function - process all MDX files and fix broken internal links"""
    parser = argparse.ArgumentParser(description='Fix broken links in documentation')
    parser.add_argument('--dry-run', action='store_true', 
                       help='Show what would be fixed without making changes')
    args = parser.parse_args()
    
    docs_dir = find_docs_dir()
    if not docs_dir:
        print("❌ Error: docs directory not found")
        print("Make sure you're running this from the project root or scripts folder")
        sys.exit(1)
    
    action = "Checking what would be fixed" if args.dry_run else "Fixing broken links"
    print(f"🔧 {action} in documentation...\n")
    print(f"Using docs directory: {docs_dir}")
    print("Fixing both markdown links [text](url) and href attributes href=\"url\"")
    print("Filtering out template variables (${var}, {var}, [var], <var>, :var, @var, %var%)\n")
    
    # Build reference data
    current_urls = get_all_current_files()  # Valid URLs for validation
    link_fixes = generate_link_fixes()      # Mapping rules for common moves
    
    # Process all MDX files
    mdx_files = glob.glob(os.path.join(docs_dir, '**/*.mdx'), recursive=True)
    total_fixes = 0
    files_changed = 0
    
    for mdx_file in mdx_files:
        changes = fix_file_links(mdx_file, current_urls, link_fixes, args.dry_run)
        
        if changes:
            files_changed += 1
            total_fixes += len(changes)
            rel_path = os.path.relpath(mdx_file, '.')
            
            # Report changes for this file
            print(f"📄 {rel_path}")
            for old_link, new_link in changes:
                status = "would fix" if args.dry_run else "fixed"
                print(f"   🔗 {status}: {old_link} → {new_link}")
            print()
    
    # Display summary
    if total_fixes > 0:
        status = "would be fixed" if args.dry_run else "fixed"
        print(f"✅ {total_fixes} links {status} in {files_changed} files")
        
        if args.dry_run:
            print("\nRun without --dry-run to apply these fixes")
    else:
        print("✅ No broken links found that can be automatically fixed!")
    
    print(f"Processed {len(mdx_files)} files")

if __name__ == '__main__':
    main() 