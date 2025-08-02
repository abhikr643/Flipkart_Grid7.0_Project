import re
import random
from datetime import datetime, timedelta
from .utils import normalize_text
from .realtime import get_rating
from .fuzzy import correct_typo, get_fuzzy_matches

STOP_WORDS = {'for', 'a', 'the', 'in', 'on', 'at', 'with', 'by', 'an'}

# Abbreviation and Synonym maps remain the same
ABBREVIATION_MAP = {
    'blk': 'black', 'blu': 'blue', 'grn': 'green', 'wht': 'white', 'rd': 'red',
}
SYNONYM_MAP = {
    'smartphone': 'mobile', 'smartphones': 'mobile', 'phones': 'mobile', 'mobile': 'mobiles',
    'tshirt': 't-shirt', 'tshirts': 't-shirt', 'tee': 't-shirt',
    'jeans': 'jean', 'trousers': 'jeans',
    'laptop': 'computer', 'laptops': 'computer', 'notebook': 'computer',
    'sneakers': 'shoes','sneaker': 'snekars', 'trainer': 'shoes', 'trainers': 'shoes',
    'headphone': 'headphones',
    'bottle' : 'flask',
    'cam' : 'camera', 'camera' : 'cam',
}

def preprocess_spaced_query(query: str) -> str:
    if all(len(word) == 1 for word in query.split()):
        return "".join(query.split())
    return query

def expand_abbreviations(query: str) -> str:
    words = query.lower().split()
    expanded_words = [ABBREVIATION_MAP.get(word, word) for word in words]
    return " ".join(expanded_words)

def parse_query_for_filters(query: str):
    filters = {'price_under': None, 'color': None, 'gender': None, 'size': None}
    known_colors = ['blue', 'black', 'white', 'red', 'green', 'pink', 'yellow', 'silver', 'grey', 'titanium', 'brown', 'khaki', 'tan']
    known_genders = {'men': 'Men', 'man': 'Men', 'women': 'Women', 'woman': 'Women', 'kids': 'Kids', 'girls': 'Kids', 'boy': 'Kids', 'unisex':'Unisex'}

    price_match = re.search(r'(?:under|below|<)\s*(\d+k?)', query, re.IGNORECASE)
    if price_match:
        price_str = price_match.group(1).lower()
        price_val = int(price_str.replace('k', '')) * 1000 if 'k' in price_str else int(price_str)
        filters['price_under'] = price_val
        query = query.replace(price_match.group(0), '', 1).strip()

    size_match = re.search(r'(?:size|sz)\s*(\w+)', query, re.IGNORECASE)
    if size_match:
        filters['size'] = size_match.group(1)
        query = query.replace(size_match.group(0), '', 1).strip()

    remaining_words = []
    for word in query.split():
        if word.lower() in known_colors:
            filters['color'] = word.capitalize()
        elif word.lower() in known_genders:
            filters['gender'] = known_genders[word.lower()]
        else:
            remaining_words.append(word)
    cleaned_query = " ".join(remaining_words)
    return filters, cleaned_query

def find_products_logic(query: str, products_data: list, filters, sort_option: str):
    normalized_query = normalize_text(query)
    if not normalized_query or not any(char.isalnum() for char in normalized_query):
        return []

    processed_query = preprocess_spaced_query(query)
    processed_query = expand_abbreviations(processed_query)
    
    parsed_filters, keyword_query = parse_query_for_filters(processed_query.lower())
    
    corrected_keywords = correct_typo(keyword_query)
    query_terms = {term for term in normalize_text(corrected_keywords).split() if term and term not in STOP_WORDS}
    
    product_keywords = {term for term in query_terms if term in SYNONYM_MAP or any(term in s for s in SYNONYM_MAP.values())}
    attribute_keywords = query_terms - product_keywords

    expanded_product_terms = set(product_keywords)
    for term in product_keywords:
        canonical = SYNONYM_MAP.get(term, term) or term
        synonyms = {k for k, v in SYNONYM_MAP.items() if v == canonical}
        expanded_product_terms.update(synonyms)

    expanded_terms = set()
    for term in query_terms:
        expanded_terms.add(term)
        canonical = SYNONYM_MAP.get(term)
        if canonical:
            expanded_terms.add(canonical)
            # Also add other words that map to the same canonical term
            for k, v in SYNONYM_MAP.items():
                if v == canonical:
                    expanded_terms.add(k)

    filtered_products = []
    filter_dict = filters.dict()
    all_brands = list(set(p['brand'] for p in products_data if 'brand' in p))

    for p in products_data:
        prod_attrs = p.get('attributes') or {}
        
        # --- THIS IS THE FIX ---
        # Explicitly check if the parsed filter is not None to handle the value 0.
        if parsed_filters.get('price_under') is not None and p.get('base_price', 0) >= parsed_filters['price_under']:
            continue
        # --- END OF FIX ---

        if not (filter_dict['price']['min'] <= p.get('base_price', 0) <= filter_dict['price']['max']): continue
        if (filter_dict.get('brand') and p.get('brand') not in filter_dict['brand']): continue
        
        if (parsed_filters.get('color') and prod_attrs.get('color', '').lower() != parsed_filters['color'].lower()): continue
        if (parsed_filters.get('size') and str(prod_attrs.get('size', '')).lower() != parsed_filters['size'].lower()): continue
        if (parsed_filters.get('gender') and prod_attrs.get('gender', '').lower() != parsed_filters['gender'].lower()): continue
        
        dynamic_filters = {k: v for k, v in filter_dict.items() if k not in ['price', 'rating', 'brand', 'category'] and v}
        if not all(str(prod_attrs.get(key)) in values for key, values in dynamic_filters.items()):
            continue
            
        product_text = " ".join(normalize_text(str(p.get(key, ''))) for key in ['name', 'category', 'brand', 'description'])
        if product_keywords and not any(term in product_text for term in expanded_product_terms):
            continue
        # Match ALL of the attribute keywords (e.g., AND men)
        if attribute_keywords and not all(term in product_text for term in attribute_keywords):
            continue
            
        filtered_products.append(p)
        
    # --- THIS IS THE FIX ---
    # Only trigger the fuzzy match fallback if the corrected term is different from the original.
    if not filtered_products and len(query_terms) == 1:
        original_term = list(query_terms)[0]
        all_keywords = all_brands + list(SYNONYM_MAP.keys())
        best_match = get_fuzzy_matches(original_term, all_keywords, limit=1)
        if best_match:
            corrected_term = best_match[0][0]
            if corrected_term != original_term: # This check prevents the infinite loop
                print(f"No results for '{original_term}', trying fuzzy match: '{corrected_term}'")
                return find_products_logic(corrected_term, products_data, filters, sort_option)
    # --- END OF FIX ---

    ranked_products = []
    for p in filtered_products:
        relevance_score = 100 if query_terms and all(term in normalize_text(p.get('name', '')) for term in query_terms) else 0
        rating = get_rating(p['id'])
        if filter_dict.get('rating') and rating < filter_dict['rating']: continue
        
        final_score = (0.8 * relevance_score) + (0.2 * rating)
        
        p['original_price'] = int(p.get('base_price', 0) * (1 + random.uniform(0.3, 0.9)))
        p['discount_percent'] = round(((p['original_price'] - p['base_price']) / p['original_price']) * 100) if p['original_price'] > 0 else 0
        
        ranked_products.append({"product": p, "score": final_score, "rating": rating})

    if sort_option == 'price_asc':
        ranked_products.sort(key=lambda x: x['product']['base_price'])
    elif sort_option == 'price_desc':
        ranked_products.sort(key=lambda x: x['product']['base_price'], reverse=True)
    else:
        ranked_products.sort(key=lambda x: x['score'], reverse=True)

    return ranked_products