import json

def load_queries(path="data/queries.json"):
    with open(path, "r") as f:
        return json.load(f)

def load_products(path="data/products.json"):
    with open(path, "r") as f:
        return json.load(f)