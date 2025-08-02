# app/utils.py

import re

def normalize_text(text: str) -> str:
    # Convert to lowercase and strip possessives like "women's" → "women"
    text = text.lower()
    text = re.sub(r"'s\b", "", text)  # remove 's at word-end
    text = re.sub(r"[^\w\s]", "", text)  # remove special characters
    return text.strip()
