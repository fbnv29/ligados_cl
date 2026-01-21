import os
import re
from config import CANCIONES_DIR, REQUIRED_METADATA, REQUIRED_FILES

def validate_song(song_slug):
    song_path = os.path.join(CANCIONES_DIR, song_slug)
    errors = []

    if not os.path.isdir(song_path):
        return [f"'{song_slug}' is not a directory"]

    # Check required files
    for f in REQUIRED_FILES:
        if not os.path.exists(os.path.join(song_path, f)):
            errors.append(f"Missing '{f}' in {song_slug}")

    # 2. Check metadata format (Frontmatter)
    letra_path = os.path.join(song_path, 'letra.txt')
    if not os.path.exists(letra_path):
        errors.append(f"Missing 'letra.txt' in {song_slug}")
    else:
        with open(letra_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if not content.startswith('---'):
            errors.append(f"'{song_slug}/letra.txt' does not start with '---' (Frontmatter)")
        else:
            missing_metadata = []
            
            # Extract metadata keys manually from the first block
            parts = content.split('---', 2)
            if len(parts) < 3:
                 errors.append(f"'{song_slug}/letra.txt' has invalid Frontmatter format (missing closing '---')")
            else:
                frontmatter = parts[1]
                found_keys = []
                for line in frontmatter.split('\n'):
                    if ':' in line:
                        found_keys.append(line.split(':', 1)[0].strip())
                        
                for req in REQUIRED_METADATA:
                    if req not in found_keys:
                        missing_metadata.append(req)
                        
                if missing_metadata:
                    errors.append(f"Missing metadata keys in '{song_slug}/letra.txt': {missing_metadata}")

    return errors

def validate_all():
    all_errors = []
    if not os.path.exists(CANCIONES_DIR):
        print("No 'canciones' directory found.")
        return

    songs = [s for s in os.listdir(CANCIONES_DIR) if os.path.isdir(os.path.join(CANCIONES_DIR, s))]
    
    for song in songs:
        errs = validate_song(song)
        if errs:
            all_errors.extend(errs)

    if all_errors:
        print("Validation ERRORS found:")
        for err in all_errors:
            print(f"- {err}")
        return False
    else:
        print("All songs validated successfully.")
        return True

if __name__ == "__main__":
    validate_all()
