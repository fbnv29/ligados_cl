import os

# Base paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE_DIR = os.path.join(BASE_DIR, 'source')
CANCIONES_DIR = os.path.join(SOURCE_DIR, 'canciones')
WEB_DIR = os.path.join(BASE_DIR, 'docs')
INDEX_JSON_PATH = os.path.join(WEB_DIR, 'index.json')

# Validation rules
REQUIRED_METADATA = ['title', 'artist']
REQUIRED_FILES = ['letra.txt']
