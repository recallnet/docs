#!/usr/bin/env python3
"""
fix-redirects.py

Script to fix redirect destinations in redirects.json to point to current file locations.

Usage:
    python fix-redirects.py [--dry-run]
    
Options:
    --dry-run    Show what would be fixed without making changes
"""

import sys
import os
import json
import glob
import argparse
from difflib import SequenceMatcher

def find_docs_dir():
    """Find the docs directory relative to script location - works from project root or scripts folder"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Try parent directory (if run from scripts folder)
    docs_dir = os.path.join(script_dir, '..', 'docs')
    if os.path.exists(docs_dir):
        return docs_dir
    
    # Try current directory (if run from project root)
    docs_dir = os.path.join(script_dir, 'docs')
    if os.path.exists(docs_dir):
        return docs_dir
    
    # Try relative to current working directory
    docs_dir = 'docs'
    if os.path.exists(docs_dir):
        return docs_dir
    
    return None

def find_redirects_file():
    """Find the redirects.json file - works from project root or scripts folder"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Try parent directory (if run from scripts folder)
    redirects_file = os.path.join(script_dir, '..', 'redirects.json')
    if os.path.exists(redirects_file):
        return redirects_file
    
    # Try current directory
    redirects_file = os.path.join(script_dir, 'redirects.json')
    if os.path.exists(redirects_file):
        return redirects_file
    
    # Try relative to current working directory
    redirects_file = 'redirects.json'
    if os.path.exists(redirects_file):
        return redirects_file
    
    return None

def get_all_current_files():
    """Build set of all valid URL paths from existing MDX files for redirect validation"""
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

def generate_destination_fixes():
    """Define mapping rules for fixing redirect destinations (old path → new path)"""
    return {
        # Agent toolkit moved to advanced
        '/agents/build-your-agent/agent-toolkit': '/advanced/agent-toolkit',
        
        # Developer resources moved to advanced
        '/developer-resources/protocol': '/advanced/protocol',
        '/developer-resources/tools': '/advanced/tools',
        
        # Direct moves to advanced
        '/agents': '/advanced/agents',
        '/sources': '/advanced/sources',
        '/frameworks': '/advanced/frameworks',
        '/mcp': '/advanced/mcp',

        # competitions/guides moved to developer-guides
        '/competitions/guides/mcp': '/competitions/developer-guides/mcp',
        '/competitions/guides/setup': '/competitions/developer-guides/setup',
        '/competitions/guides/trading': '/competitions/developer-guides/trading',
        '/competitions/guides/portfolio-manager-tutorial': '/competitions/developer-guides/portfolio-manager-tutorial',
        '/competitions/guides/faq': '/competitions/faq',
        '/competitions/guides/register': '/competitions/developer-guides/register',
        '/competitions/guides/mastra': '/competitions/developer-guides/mastra',
    }

def similarity(a, b):
    """Calculate string similarity ratio (0.0 to 1.0) using sequence matching"""
    return SequenceMatcher(None, a, b).ratio()

def find_fuzzy_match(broken_path, current_urls, min_similarity=0.8):
    """Find best fuzzy match for broken path to catch typos in redirect destinations"""
    best_match = None
    best_score = 0
    
    for url in current_urls:
        score = similarity(broken_path, url)
        if score > best_score and score >= min_similarity:
            best_score = score
            best_match = url
    
    return best_match if best_score >= min_similarity else None

def fix_destination(destination, current_urls, destination_fixes):
    """Try multiple strategies to fix a broken redirect destination"""
    # Skip if destination already exists (not broken)
    if destination in current_urls:
        return None
    
    # Strategy 1: Direct mapping from fix rules
    for old_pattern, new_pattern in destination_fixes.items():
        if destination.startswith(old_pattern):
            potential_fix = destination.replace(old_pattern, new_pattern, 1)
            if potential_fix in current_urls:
                return potential_fix
    
    # Strategy 2: Try adding /advanced/ prefix for common directories
    if destination.startswith('/'):
        parts = destination.strip('/').split('/')
        if len(parts) > 0:
            first_part = parts[0]
            common_dirs = ['agents', 'agent-toolkit', 'sources', 'frameworks', 'mcp', 'protocol', 'tools']
            if first_part in common_dirs:
                potential_fix = '/advanced/' + destination.lstrip('/')
                if potential_fix in current_urls:
                    return potential_fix
    
    # Strategy 3: Fuzzy matching for typos
    fuzzy_match = find_fuzzy_match(destination, current_urls)
    if fuzzy_match:
        return fuzzy_match
    
    return None

def main():
    """Main function - fix redirect destinations in redirects.json to point to valid file locations"""
    parser = argparse.ArgumentParser(description='Fix redirect destinations in redirects.json')
    parser.add_argument('--dry-run', action='store_true', 
                       help='Show what would be fixed without making changes')
    args = parser.parse_args()
    
    # Locate required files
    docs_dir = find_docs_dir()
    redirects_file = find_redirects_file()
    
    if not docs_dir:
        print("❌ Error: docs directory not found")
        print("Make sure you're running this from the project root or scripts folder")
        sys.exit(1)
    
    if not redirects_file:
        print("❌ Error: redirects.json not found")
        print("Make sure redirects.json exists in the project root")
        sys.exit(1)
    
    action = "Checking what would be fixed" if args.dry_run else "Fixing redirect destinations"
    print(f"🔧 {action} in redirects.json...\n")
    print(f"Using docs directory: {docs_dir}")
    print(f"Using redirects file: {redirects_file}")
    
    # Load redirects.json
    try:
        with open(redirects_file, 'r', encoding='utf-8') as f:
            redirects = json.load(f)
    except Exception as e:
        print(f"❌ Error reading redirects.json: {e}")
        sys.exit(1)
    
    # Build reference data
    current_urls = get_all_current_files()      # Valid URLs for validation
    destination_fixes = generate_destination_fixes()  # Mapping rules for common moves
    
    # Process each redirect entry
    changes = []         # Track all changes made
    fixed_redirects = [] # New redirect list with fixes applied
    
    for i, redirect in enumerate(redirects):
        if 'destination' not in redirect:
            fixed_redirects.append(redirect)
            continue
        
        original_dest = redirect['destination']
        fixed_dest = fix_destination(original_dest, current_urls, destination_fixes)
        
        if fixed_dest and fixed_dest != original_dest:
            # Record change and create updated redirect entry
            changes.append((original_dest, fixed_dest))
            new_redirect = redirect.copy()
            new_redirect['destination'] = fixed_dest
            fixed_redirects.append(new_redirect)
        else:
            # No change needed
            fixed_redirects.append(redirect)

    # Add missing redirect entries based on destination_fixes mappings
    # Check if we have redirects for all the old patterns that should redirect to new ones
    existing_sources = {r['source'] for r in fixed_redirects}
    
    for old_pattern, new_pattern in destination_fixes.items():
        # Check if we already have a redirect for this old pattern
        if old_pattern not in existing_sources:
            # Check if the new pattern (destination) actually exists
            if new_pattern in current_urls:
                fixed_redirects.append({
                    'source': old_pattern, 
                    'destination': new_pattern, 
                    'permanent': True
                })
                changes.append((f"NEW: {old_pattern}", new_pattern))
    
    # Display results
    if changes:
        print("📄 Redirect destination fixes:\n")
        for old_dest, new_dest in changes:
            status = "would fix" if args.dry_run else "fixed"
            print(f"   🔗 {status}: {old_dest} → {new_dest}")
        print()
        
        # Save changes to file (unless dry run)
        if not args.dry_run:
            try:
                with open(redirects_file, 'w', encoding='utf-8') as f:
                    json.dump(fixed_redirects, f, indent=2)
                print(f"✅ {len(changes)} redirect destinations fixed")
            except Exception as e:
                print(f"❌ Error writing redirects.json: {e}")
                sys.exit(1)
        else:
            print(f"✅ {len(changes)} redirect destinations would be fixed")
            print("\nRun without --dry-run to apply these fixes")
    else:
        print("✅ No broken redirect destinations found!")
    
    print(f"Processed {len(redirects)} redirects")

if __name__ == '__main__':
    main() 