# app/fuzzy.py
from symspellpy import SymSpell, Verbosity
from rapidfuzz import fuzz, process

# Init SymSpell (can be tuned)
sym_spell = SymSpell(max_dictionary_edit_distance=3, prefix_length=7)

def load_symspell_from_queries(query_list: list):
    """
    Load all known queries into SymSpell for typo correction.
    """
    for q in query_list:
        sym_spell.create_dictionary_entry(q.lower(), 1)

# Add this function to app/fuzzy.py

def build_symspell_from_products(products_data: list):
    """
    Builds the SymSpell dictionary from the product catalog.
    Includes debugging print statements.
    """
    print("\n--- Running SymSpell Dictionary Builder ---")
    if not products_data:
        print("!!! ERROR: No product data received. The spell check dictionary will be empty.")
        return

    print(f"Received {len(products_data)} products to process.")
    from app.utils import normalize_text
    
    word_counts = {}
    
    for i, product in enumerate(products_data):
        text_to_process = " ".join([
            product.get('name', ''),
            product.get('category', ''),
            product.get('brand', '')
        ])
        
        words = normalize_text(text_to_process).split()
        for word in words:
            if word:  # Ensure not adding empty strings
                word_counts[word] = word_counts.get(word, 0) + 1
        
        # Print the text from the first product for verification
        if i == 0:
            print(f"Example text from first product: '{text_to_process}'")
            print(f"Example normalized words: {words}")

    if not word_counts:
        print("!!! ERROR: No words were extracted from the product data. The dictionary is empty.")
        return
    
    # Create dictionary entries
    for word, count in word_counts.items():
        sym_spell.create_dictionary_entry(word, count)
        
    print(f"✅ SymSpell dictionary built successfully with {len(word_counts)} unique words.")
    print("--- Dictionary Builder Finished ---\n")

def correct_typo(query: str) -> str:
    """
    Corrects spelling word-by-word in a query, ignoring numbers and special keywords.
    """
    # Keywords that should not be spell-checked
    special_keywords = {'under', 'below', 'less', 'than', 'over', 'above', 'size', 'sz'}
    
    words = query.split()
    corrected_words = []
    
    for word in words:
        # Do not correct numbers or special keywords
        if word.lower() in special_keywords or word.isdigit() or (word.lower().endswith('k') and word[:-1].isdigit()):
            corrected_words.append(word)
            continue
        
        # Correct normal words
        suggestions = sym_spell.lookup(word.lower(), Verbosity.CLOSEST, max_edit_distance=2)
        if suggestions:
            corrected_words.append(suggestions[0].term)
        else:
            corrected_words.append(word)
            
    return " ".join(corrected_words)

def load_core_keywords(keywords: list):
    """
    Loads a list of core, correctly-spelled keywords into SymSpell with a high frequency
    count to improve correction accuracy for common terms.
    """
    print("Loading core keywords into SymSpell dictionary...")
    for keyword in keywords:
        sym_spell.create_dictionary_entry(keyword, 100) # Use a high count for importance
    print(f"{len(keywords)} core keywords loaded.")


def add_term_to_symspell(term: str):
    """Dynamically adds a new term to the SymSpell dictionary."""
    sym_spell.create_dictionary_entry(term.lower(), 1)

    
def get_fuzzy_matches(prefix: str, corpus: list, limit: int = 10, threshold: int = 70):
    """
    Fuzzy match using token sort ratio (handles misspellings and reordering).
    Returns: List of (query, score) tuples.
    """
    if not corpus:
        return []
    return process.extract(
        query=prefix,
        choices=corpus,
        scorer=fuzz.token_sort_ratio,
        score_cutoff=threshold,
        limit=limit
    )
