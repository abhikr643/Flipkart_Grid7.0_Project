from app.trie import Trie
from app.fuzzy import correct_typo

# Simple cache for final suggestions
final_cache = {}

def process_query(prefix: str, trie: Trie, query_data: list) -> list:
    """
    Processes the user's query to generate autosuggestions, prioritizing
    popularity-ranked results from the Trie and using spell-correction.
    """
    if not prefix:
        return []
        
    # Check cache first for the original prefix
    if prefix in final_cache:
        return final_cache[prefix]
        
    corrected_prefix = prefix
    if len(prefix) > 2:
        corrected_prefix = correct_typo(prefix)

    trie_results = trie.search(corrected_prefix)
    
    if not trie_results and corrected_prefix != prefix:
        trie_results = trie.search(prefix)

    # Handle the tuple/dict inconsistency here
    suggestions = []
    for item in trie_results:
        if isinstance(item, dict):
            suggestions.append({
                "text": item.get("query"),
                "category": item.get("category", "general")
            })
        elif isinstance(item, tuple) and isinstance(item[0], dict):
            suggestions.append({
                "text": item[0].get("query"),
                "category": item[0].get("category", "general")
            })
        else:
            # Fallback for tuple like ("mobile", score)
            suggestions.append({
                "text": item[0] if isinstance(item, tuple) else str(item),
                "category": "general"
            })

    final_cache[prefix] = suggestions
    return suggestions
