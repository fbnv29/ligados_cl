import os
import re
from config import CANCIONES_DIR

def migrate_song(song_dir):
    letra_path = os.path.join(song_dir, 'letra.txt')
    if not os.path.exists(letra_path):
        print(f"Skipping {song_dir} (no letra.txt)")
        return

    with open(letra_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already migrated (starts with ---)
    if content.strip().startswith('---'):
        print(f"Skipping {song_dir} (already migrated)")
        return

    metadata = {}
    body_lines = []
    
    lines = content.split('\n')
    for line in lines:
        line = line.strip()
        # Regex to find {key:value}
        match = re.match(r'^{(.*?):(.*?)}$', line)
        if match:
            key = match.group(1).strip()
            value = match.group(2).strip()
            metadata[key] = value
        else:
            body_lines.append(line)

    # Reconstruct with YAML Frontmatter
    new_content = "---\n"
    for k, v in metadata.items():
        # Escape quotes if needed, though simple logic usually suffices for this project
        # We wrap values in quotes to be safe
        new_content += f'{k}: "{v}"\n'
    new_content += "---\n"
    new_content += "\n".join(body_lines).strip()
    
    # Write back
    with open(letra_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Migrated {song_dir}")

def run_migration():
    print("Starting migration...")
    songs = [os.path.join(CANCIONES_DIR, d) for d in os.listdir(CANCIONES_DIR) if os.path.isdir(os.path.join(CANCIONES_DIR, d))]
    
    for song_dir in songs:
        migrate_song(song_dir)
        
    print("Migration complete.")

if __name__ == "__main__":
    run_migration()
