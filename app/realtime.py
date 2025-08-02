import random

def get_rating(query: str) -> float:
    return round(random.uniform(3.5, 5.0), 2)

def get_offer_score(query: str) -> float:
    return round(random.uniform(0.0, 1.0), 2)

def get_availability(query: str) -> float:
    return round(random.uniform(0.5, 1.0), 2)
