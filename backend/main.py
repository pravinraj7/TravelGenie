"""
TravelGenie FastAPI Backend
Provides /plan and /book endpoints.
Uses Google Places Text Search when GOOGLE_PLACES_API_KEY is set;
falls back to CITY-AWARE contextual demo data otherwise.
Accepts lat/lng + locationLabel from the frontend.
"""

import os
import asyncio
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

app = FastAPI(title="TravelGenie API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://travel-genie-git-main-pravin-rajs-projects-0b00a05d.vercel.app",
        "https://travel-genie-5mr5hyhap-pravin-rajs-projects-0b00a05d.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Configuration ─────────────────────────────────────────────────────────────
GOOGLE_API_KEY   = os.getenv("GOOGLE_PLACES_API_KEY", "").strip()
DEFAULT_LOCATION = "12.9716,77.5946"   # Bengaluru fallback if no GPS
RADIUS           = 5000                # metres for Places Text Search bias


# ── Request schema ────────────────────────────────────────────────────────────
class PlanRequest(BaseModel):
    lat:           Optional[float] = None
    lng:           Optional[float] = None
    locationLabel: Optional[str]  = None   # city name e.g. "Madurai, IN"
    startTime:     Optional[str]  = None
    endTime:       Optional[str]  = None
    preference:    Optional[str]  = "business"   # business | relax | food | explore


# ── Preference → Google Places Text Search config ─────────────────────────────
PREFERENCE_CONFIG = {
    "business": {
        "a": {"query": "best hotel",             "type": "lodging",           "title": "Hotel Stay"},
        "b": {"query": "business lounge cafe",   "type": "cafe",              "title": "Business Lounge"},
    },
    "relax": {
        "a": {"query": "spa wellness centre",    "type": "spa",               "title": "Spa & Wellness"},
        "b": {"query": "park garden nature",     "type": "park",              "title": "Relax & Unwind"},
    },
    "food": {
        "a": {"query": "top restaurant fine dining", "type": "restaurant",    "title": "Fine Dining"},
        "b": {"query": "cafe dessert coffee shop",   "type": "cafe",          "title": "Café & Bites"},
    },
    "explore": {
        "a": {"query": "tourist attraction museum",  "type": "tourist_attraction", "title": "Local Attraction"},
        "b": {"query": "shopping mall",              "type": "shopping_mall",      "title": "Explore & Shop"},
    },
}


# ── City-aware demo data builder ──────────────────────────────────────────────
def build_city_demo(city: str, pref: str) -> dict:
    """
    Generates contextual mock data that always references the real city
    (Madurai, Seoul, Chennai…) — never hardcoded 'Bengaluru'.
    Used when Google Places API is unavailable.
    """
    city_short = city.split(",")[0].strip() if city else "your city"
    q = city_short.replace(" ", "+")
    base = "https://maps.google.com/?q="

    templates = {
        "business": {
            "optionA": {
                "title": "Hotel Stay",
                "place": f"Top-Rated Hotel in {city_short}",
                "rating": "4.5", "address": city_short, "distance": "~10 min",
                "reviews": 1200, "tags": ["Hotel", "Business", "Central"],
                "desc": f"A highly rated hotel near you in {city_short}, ideal for business travellers seeking comfort.",
                "photo": None, "maps_url": f"{base}hotels+in+{q}",
            },
            "optionB": {
                "title": "Business Lounge",
                "place": f"Premium Café & Lounge, {city_short}",
                "rating": "4.3", "address": city_short, "distance": "~8 min",
                "reviews": 800, "tags": ["Café", "WiFi", "Work-Friendly"],
                "desc": f"A well-connected café in {city_short} perfect for remote work or client calls.",
                "photo": None, "maps_url": f"{base}business+lounge+cafe+in+{q}",
            },
        },
        "relax": {
            "optionA": {
                "title": "Spa & Wellness",
                "place": f"Wellness Spa, {city_short}",
                "rating": "4.6", "address": city_short, "distance": "~12 min",
                "reviews": 950, "tags": ["Spa", "Relaxing", "Wellness"],
                "desc": f"Rejuvenate at a top-rated spa in {city_short} — the perfect antidote to a busy day.",
                "photo": None, "maps_url": f"{base}spa+wellness+in+{q}",
            },
            "optionB": {
                "title": "Relax & Unwind",
                "place": f"City Park / Garden, {city_short}",
                "rating": "4.4", "address": city_short, "distance": "~15 min",
                "reviews": 2300, "tags": ["Nature", "Peaceful", "Evening Walk"],
                "desc": f"Take a refreshing evening walk through one of {city_short}'s most scenic parks.",
                "photo": None, "maps_url": f"{base}park+garden+in+{q}",
            },
        },
        "food": {
            "optionA": {
                "title": "Fine Dining",
                "place": f"Best Restaurant in {city_short}",
                "rating": "4.6", "address": city_short, "distance": "~10 min",
                "reviews": 2800, "tags": ["Fine Dining", "Local Cuisine", "Ambiance"],
                "desc": f"Experience the finest local cuisine {city_short} has to offer — curated for your evening.",
                "photo": None, "maps_url": f"{base}best+restaurant+in+{q}",
            },
            "optionB": {
                "title": "Café & Bites",
                "place": f"Popular Café, {city_short}",
                "rating": "4.3", "address": city_short, "distance": "~8 min",
                "reviews": 1500, "tags": ["Café", "Snacks", "Coffee"],
                "desc": f"A beloved café in {city_short} known for great brews and a welcoming atmosphere.",
                "photo": None, "maps_url": f"{base}cafe+in+{q}",
            },
        },
        "explore": {
            "optionA": {
                "title": "Local Attraction",
                "place": f"Must-Visit Attraction, {city_short}",
                "rating": "4.5", "address": city_short, "distance": "~20 min",
                "reviews": 5600, "tags": ["Tourism", "Heritage", "Culture"],
                "desc": f"Discover {city_short}'s most celebrated landmark — a cultural gem to explore tonight.",
                "photo": None, "maps_url": f"{base}tourist+attraction+in+{q}",
            },
            "optionB": {
                "title": "Explore & Shop",
                "place": f"Shopping Hub, {city_short}",
                "rating": "4.4", "address": city_short, "distance": "~15 min",
                "reviews": 8900, "tags": ["Shopping", "Entertainment", "Local"],
                "desc": f"Explore the vibrant shopping and entertainment scene of {city_short} this evening.",
                "photo": None, "maps_url": f"{base}shopping+mall+in+{q}",
            },
        },
    }
    plan = templates.get(pref, templates["business"])
    return {**plan, "source": "demo"}


# ── Helpers ───────────────────────────────────────────────────────────────────

def photo_url(photo_ref: str) -> str:
    return (
        f"https://maps.googleapis.com/maps/api/place/photo"
        f"?maxwidth=800&photoreference={photo_ref}&key={GOOGLE_API_KEY}"
    )

def maps_url(place_id: str, name: str) -> str:
    if place_id:
        return f"https://www.google.com/maps/place/?q=place_id:{place_id}"
    return f"https://maps.google.com/?q={name.replace(' ', '+')}"


async def fetch_places_text(query: str, location: str) -> list[dict]:
    """
    Discovery Agent — Google Places Text Search.
    Sends city-anchored query like "best restaurant in Madurai"
    biased to the GPS location for precise local results.
    """
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query":    query,
        "location": location,
        "radius":   RADIUS,
        "key":      GOOGLE_API_KEY,
    }
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()
    return [r for r in data.get("results", []) if r.get("name")]


def build_plan_from_results(
    place_a: dict, place_b: dict,
    cfg_a:   dict, cfg_b:   dict,
) -> dict:
    """Planner Agent — converts raw Places API results into OptionA / OptionB."""

    def fmt_rating(r) -> str:
        return str(round(float(r), 1)) if r else "N/A"

    def fmt_address(place: dict) -> str:
        return place.get("formatted_address") or place.get("vicinity") or "Nearby"

    def get_photo(place: dict):
        photos = place.get("photos", [])
        return photo_url(photos[0]["photo_reference"]) if photos else None

    def build_option(place: dict, cfg: dict) -> dict:
        name   = place.get("name") or cfg["title"]
        rating = place.get("rating")
        total  = place.get("user_ratings_total", 0)
        pid    = place.get("place_id", "")
        return {
            "title":    cfg["title"],
            "place":    name,
            "rating":   fmt_rating(rating),
            "address":  fmt_address(place),
            "distance": "~10 min",
            "reviews":  total,
            "tags":     [cfg["type"].replace("_", " ").title()]
                        + (["Open Now"] if place.get("opening_hours", {}).get("open_now") else [])
                        + (["Top Rated"] if (rating or 0) >= 4.5 else []),
            "desc":     (
                f"{name} is a top-rated spot near your location. "
                f"Rated {fmt_rating(rating)}★ by {total:,} visitors. "
                f"{fmt_address(place)}."
            ),
            "photo":    get_photo(place),
            "maps_url": maps_url(pid, name),
        }

    return {
        "optionA": build_option(place_a, cfg_a),
        "optionB": build_option(place_b, cfg_b),
        "source":  "google_places",
    }


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
async def health():
    return {"status": "ok", "api_key_configured": bool(GOOGLE_API_KEY)}


@app.post("/plan")
async def plan(req: PlanRequest = PlanRequest()):
    """
    1. Discovery Agent  → fetches places near REAL GPS city using preference
    2. Planner Agent    → shapes top results into OptionA / OptionB
    Falls back to CITY-AWARE demo data if API key missing or API fails.
    """
    pref = (req.preference or "business").lower()
    if pref not in PREFERENCE_CONFIG:
        pref = "business"

    city = req.locationLabel or "your city"

    # ── No API key — return city-aware demo data ──────────────────────────────
    if not GOOGLE_API_KEY:
        print(f"[TravelGenie] No API key — city demo (city={city}, pref={pref})")
        return {**build_city_demo(city, pref), "mode": "demo", "preference": pref}

    # ── Resolve GPS location ──────────────────────────────────────────────────
    if req.lat is not None and req.lng is not None:
        location = f"{req.lat},{req.lng}"
        print(f"[TravelGenie] ✅ Real GPS: {location} | city={city} | pref={pref}")
    else:
        location = DEFAULT_LOCATION
        print(f"[TravelGenie] ⚠️  No GPS — using default | city={city} | pref={pref}")

    cfg = PREFERENCE_CONFIG[pref]

    # Build city-anchored query: "best restaurant in Madurai"
    city_short = city.split(",")[0].strip() if city else ""
    query_a = f"{cfg['a']['query']} in {city_short}" if city_short else cfg['a']['query']
    query_b = f"{cfg['b']['query']} in {city_short}" if city_short else cfg['b']['query']

    try:
        results_a, results_b = await asyncio.gather(
            fetch_places_text(query_a, location),
            fetch_places_text(query_b, location),
        )
        print(f"[TravelGenie] Results → A:{len(results_a)}, B:{len(results_b)} near {city_short}")

        place_a = results_a[0] if results_a else {}
        place_b = results_b[0] if results_b else {}

        if not place_a and not place_b:
            print("[TravelGenie] No Places results — city-aware fallback")
            return {**build_city_demo(city, pref), "mode": "fallback", "reason": "no_results"}

        result = build_plan_from_results(place_a or {}, place_b or {}, cfg["a"], cfg["b"])
        return {**result, "preference": pref, "city": city_short}

    except Exception as exc:
        print(f"[TravelGenie] Places error: {exc} — city-aware fallback")
        return {**build_city_demo(city, pref), "mode": "fallback", "error": str(exc)}


# ── Booking ───────────────────────────────────────────────────────────────────

class BookingRequest(BaseModel):
    place:  str
    option: str   # "a" or "b"
    title:  str = ""


@app.post("/book")
async def book(req: BookingRequest):
    """Notification Agent — simulates confirming a booking and sending an SMS."""
    if not req.place:
        raise HTTPException(status_code=400, detail="place is required")

    return {
        "success": True,
        "message": f"Booking confirmed for {req.place}! SMS sent ✅",
        "place":   req.place,
        "option":  req.option,
    }
