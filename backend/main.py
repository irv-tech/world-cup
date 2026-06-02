from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv
from database.database import engine
from models.user import User
from database.database import Base
from routes import auth
from models.favorite import FavoriteTeam
from models.favorite_player import FavoritePlayer
from routes import favorites

Base.metadata.create_all(bind=engine)

load_dotenv()

app = FastAPI()

app.include_router(auth.router)
app.include_router(favorites.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("FOOTBALL_API_KEY")
BASE_URL = "https://api.football-data.org/v4"

@app.get("/")
def home():
    return {"message": "World Cup backend is running"}

@app.get("/teams")
def get_teams():
    if not API_KEY:
        return {"error": "Missing FOOTBALL_API_KEY"}

    response = requests.get(
        f"{BASE_URL}/competitions/WC/teams",
        headers={"X-Auth-Token": API_KEY}
    )

    if response.status_code != 200:
        return {
            "error": "Failed to fetch teams",
            "status_code": response.status_code,
            "details": response.text
        }

    data = response.json()
    return data.get("teams", [])

@app.get("/players")
def get_players():
    if not API_KEY:
        return {"error": "Missing FOOTBALL_API_KEY"}

    response = requests.get(
        f"{BASE_URL}/competitions/WC/teams",
        headers={"X-Auth-Token": API_KEY}
    )

    if response.status_code != 200:
        return {
            "error": "Failed to fetch players",
            "status_code": response.status_code,
            "details": response.text
        }

    data = response.json()
    teams = data.get("teams", [])

    players = []

    for team in teams:
        for player in team.get("squad", []):
            players.append({
                "id": player.get("id"),
                "name": player.get("name"),
                "position": player.get("position"),
                "dateOfBirth": player.get("dateOfBirth"),
                "nationality": player.get("nationality"),
                "team": team.get("name"),
                "teamCode": team.get("tla"),
                "teamCrest": team.get("crest")
            })

    return players

@app.get("/matches")
def get_matches():
    if not API_KEY:
        return {"error": "Missing FOOTBALL_API_KEY"}

    response = requests.get(
        f"{BASE_URL}/competitions/WC/matches",
        headers={"X-Auth-Token": API_KEY}
    )

    if response.status_code != 200:
        return {
            "error": "Failed to fetch matches",
            "status_code": response.status_code,
            "details": response.text
        }

    data = response.json()
    matches = data.get("matches", [])

    formatted_matches = []

    for match in matches:
        formatted_matches.append({
            "id": match.get("id"),
            "utcDate": match.get("utcDate"),
            "status": match.get("status"),
            "stage": match.get("stage"),
            "homeTeam": match.get("homeTeam", {}).get("name"),
            "awayTeam": match.get("awayTeam", {}).get("name"),
            "homeCrest": match.get("homeTeam", {}).get("crest"),
            "awayCrest": match.get("awayTeam", {}).get("crest"),
            "score": match.get("score")
        })

    return formatted_matches