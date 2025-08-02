from sentence_transformers import SentenceTransformer, util
import torch

model = SentenceTransformer('all-MiniLM-L6-v2')
corpus = []
corpus_embeddings = None

def load_query_corpus(query_list: list):
    global corpus, corpus_embeddings
    corpus = query_list
    corpus_embeddings = model.encode(query_list, convert_to_tensor=True)

def semantic_matches(query: str, top_k=10, threshold=0.5):
    global corpus, corpus_embeddings
    query_embedding = model.encode(query, convert_to_tensor=True)
    hits = util.semantic_search(query_embedding, corpus_embeddings, top_k=top_k)[0]

    results = []
    for hit in hits:
        if hit['score'] >= threshold:
            results.append((corpus[hit['corpus_id']], hit['score'] * 100))
    return results
