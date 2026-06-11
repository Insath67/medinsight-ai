import os
import sys
from pathlib import Path

# Make backend root importable
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

from app.main import app