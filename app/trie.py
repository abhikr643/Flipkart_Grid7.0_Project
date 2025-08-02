# app/trie.py
from .utils import normalize_text

class TrieNode:
    def __init__(self):
        self.children = {}
        self.suggestions = []

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, query_obj: dict):
        word = normalize_text(query_obj.get("query", ""))
        popularity = query_obj.get("popularity", 0)
        
        node = self.root
        for ch in word.lower():
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
            # Store the original query text and its popularity
            node.suggestions.append((query_obj["query"], popularity))

    def search(self, prefix):
        prefix = normalize_text(prefix)
        node = self.root
        for ch in prefix.lower():
            if ch not in node.children:
                return []
            node = node.children[ch]
        
        # Remove duplicates while preserving order
        seen = set()
        unique_suggestions = [x for x in node.suggestions if not (x[0] in seen or seen.add(x[0]))]
        
        return sorted(unique_suggestions, key=lambda x: -x[1])[:10]