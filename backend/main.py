from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

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