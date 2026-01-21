import os
import json
import re
import shutil
from config import CANCIONES_DIR, INDEX_JSON_PATH, WEB_DIR
from validate import validate_all

def parse_letra(letra_path):
    with open(letra_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    metadata = {}
    body = content
    
    # Parse Frontmatter (--- ... ---)
    if content.startswith('---'):
        try:
            parts = content.split('---', 2)
            if len(parts) >= 3:
                frontmatter = parts[1]
                body = parts[2].strip()
                
                # Simple YAML parser (since we don't have pyyaml/python-frontmatter guaranteed)
                for line in frontmatter.split('\n'):
                    if ':' in line:
                        key, value = line.split(':', 1)
                        metadata[key.strip()] = value.strip().strip('"').strip("'")
        except Exception as e:
            print(f"Error parsing frontmatter in {letra_path}: {e}")
    else:
        # Fallback to old format (just in case)
        for match in re.finditer(r'{(.*?):(.*?)}', content):
            key = match.group(1).strip()
            value = match.group(2).strip()
            metadata[key] = value
        # Remove metadata lines from content? 
        # For old format logic, but let's assume valid frontmatter mostly.

    return metadata, body

def build():
    print("Starting build process...")
    if not validate_all():
        print("Build aborted due to validation errors.")
        return

    songs_data = []
    
    # Prepare web/canciones directory
    web_canciones_dir = os.path.join(WEB_DIR, 'canciones')
    if os.path.exists(web_canciones_dir):
        shutil.rmtree(web_canciones_dir)
    os.makedirs(web_canciones_dir)
    
    songs = sorted([s for s in os.listdir(CANCIONES_DIR) if os.path.isdir(os.path.join(CANCIONES_DIR, s))])

    for song_slug in songs:
        song_path = os.path.join(CANCIONES_DIR, song_slug)
        letra_path = os.path.join(song_path, 'letra.txt')
        
        # Prepare dest dir for this song
        song_dest_dir = os.path.join(web_canciones_dir, song_slug)
        os.makedirs(song_dest_dir, exist_ok=True)
        
        # Check for audio files
        audios = {}
        for f in os.listdir(song_path):
            if f.endswith('.mp3'):
                voice = os.path.splitext(f)[0]
                audios[voice] = f"canciones/{song_slug}/{f}"
                # Copy audio file
                shutil.copy2(os.path.join(song_path, f), os.path.join(song_dest_dir, f))

        metadata, content = parse_letra(letra_path)
        
        song_entry = {
            'slug': song_slug,
            'title': metadata.get('title', song_slug),
            'artist': metadata.get('artist', 'Unknown'),
            'key': metadata.get('key', ''),
            'audios': audios,
            'content': content # Full content with markup
        }
        songs_data.append(song_entry)

    with open(INDEX_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(songs_data, f, ensure_ascii=False, indent=2)
    
    print(f"Build successful! generated {INDEX_JSON_PATH} with {len(songs_data)} songs.")

if __name__ == "__main__":
    build()
