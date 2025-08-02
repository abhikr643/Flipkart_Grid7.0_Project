from app.realtime import get_rating, get_offer_score, get_availability

def compute_dynamic_score(query: str, relevance_score: float) -> float:
    rating = get_rating(query)
    offer_score = get_offer_score(query)
    availability = get_availability(query)

    return round(
        (0.5 * relevance_score) +
        (0.2 * rating / 5.0) +             # Normalize rating out of 5
        (0.1 * offer_score) +
        (0.2 * availability),
        3
    )
