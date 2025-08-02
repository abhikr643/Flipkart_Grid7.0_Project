# app/main.py

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from fastapi.middleware.cors import CORSMiddleware
from .ranker import compute_dynamic_score
from .trie import Trie
from .loader import load_queries, load_products
from .query_processor import process_query
from .fuzzy import load_symspell_from_queries, build_symspell_from_products, load_core_keywords, add_term_to_symspell
from .search import find_products_logic

class PriceFilter(BaseModel):
    min: int
    max: int

class SearchFilters(BaseModel):
    price: PriceFilter
    rating: Optional[float] = None
    brand: Optional[List[str]] = None
    category: Optional[List[str]] = None
    
    class Config:
        extra = 'allow'

class SearchRequest(BaseModel):
    query: str
    filters: SearchFilters
    sort_option: str

class HistoryItem(BaseModel):
    term: str

# --- App Initialization ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Loading & Initialization ---
query_data = load_queries()
products_data = load_products()
core_keywords = ['shoes', 'sneakers', 'shirt', 't-shirt', 'jeans', 'laptop', 'mobile', 'headphones', 'dress']

load_core_keywords(core_keywords)
load_symspell_from_queries([q["query"] for q in query_data])
build_symspell_from_products(products_data)

trie = Trie()
# This now correctly passes the entire object to the updated Trie.insert method
for q_obj in query_data:
    trie.insert(q_obj)

# --- In-Memory Storage ---
search_history: List[str] = []
trending_searches: List[str] = ["shoes", "t-shirts", "laptops", "watches", "tv", "sarees"]
search_counts: Dict[str, int] = {}

# --- API Endpoints ---

@app.get("/trending")
def get_trending():
    return {"trending": trending_searches}

@app.get("/history")
def get_history():
    return {"history": list(reversed(search_history))}

@app.post("/history")
def add_to_history(item: HistoryItem):
    term = item.term.strip().lower()
    if not term:
        return {"status": "error", "message": "Empty term"}

    if term in search_history:
        search_history.remove(term)
    search_history.append(term)
    if len(search_history) > 10:
        search_history.pop(0)
    
    search_counts[term] = search_counts.get(term, 0) + 1
    is_existing_query = any(q['query'] == term for q in query_data)
    
    if search_counts[term] > 2 and not is_existing_query:
        new_query_obj = {"query": term, "popularity": 5000, "landing_quality": 0.8}
        query_data.append(new_query_obj)
        trie.insert(new_query_obj) # Pass the full object here
        add_term_to_symspell(term)
        clear_autosuggest_cache()
        print(f"Promoted '{term}' to autosuggest pool.")

    return {"status": "success", "history": list(reversed(search_history))}

@app.get("/autosuggest")
def autosuggest(query: str = ""):
    if not query:
        default = sorted(query_data, key=lambda x: -x["popularity"])[:5]
        return {
            "query": query,
            "suggestions": [
                {
                    "text": item["query"],
                    "score": compute_dynamic_score(item["query"], item["landing_quality"])
                }
                for item in default
            ]
        }
    suggestions = process_query(query, trie, query_data)
    return {
        "query": query,
        "suggestions": suggestions
    }


@app.post("/search")
def search_products(request: SearchRequest):
    return find_products_logic(
        query=request.query,
        products_data=products_data,
        filters=request.filters,
        sort_option=request.sort_option
    )

@app.get("/")
def read_root():
    return {"status": "Flipkart Search API is running!"}