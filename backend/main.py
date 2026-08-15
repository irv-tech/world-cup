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
import json
from pathlib import Path
from copy import deepcopy

Base.metadata.create_all(bind=engine)

load_dotenv()

app = FastAPI()

app.include_router(auth.router)
app.include_router(favorites.router)

cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173"
).split(",")

allowed_origins = [
    origin.strip()
    for origin in cors_origins
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("FOOTBALL_API_KEY")
BASE_URL = "https://api.football-data.org/v4"

def load_platform_data():
    platform_file = (
        Path(__file__).parent
        / "data"
        / "world_cup_platform.json"
    )

    with open(
        platform_file,
        "r",
        encoding="utf-8",
    ) as file:
        return json.load(file)

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
            "group": match.get("group"),
            "homeTeam": match.get("homeTeam", {}).get("name"),
            "awayTeam": match.get("awayTeam", {}).get("name"),
            "homeCrest": match.get("homeTeam", {}).get("crest"),
            "awayCrest": match.get("awayTeam", {}).get("crest"),
            "score": match.get("score")
        })

    return formatted_matches

@app.get("/world-cup-2026/groups")
def get_2026_groups():
    if not API_KEY:
        return {"error": "Missing FOOTBALL_API_KEY"}

    response = requests.get(
        f"{BASE_URL}/competitions/WC/matches",
        headers={"X-Auth-Token": API_KEY}
    )

    if response.status_code != 200:
        return {
            "error": "Failed to fetch World Cup matches",
            "status_code": response.status_code,
            "details": response.text
        }

    data = response.json()
    matches = data.get("matches", [])

    group_matches = [
        match
        for match in matches
        if match.get("stage") == "GROUP_STAGE"
        and match.get("group")
    ]

    groups = {}

    for match in group_matches:
        group_name = match.get("group")

        if group_name not in groups:
            groups[group_name] = {
                "standings": {},
                "matches": []
            }

        home_team = match.get("homeTeam", {}).get("name")
        away_team = match.get("awayTeam", {}).get("name")

        home_crest = match.get("homeTeam", {}).get("crest")
        away_crest = match.get("awayTeam", {}).get("crest")

        score = match.get("score", {})
        full_time = score.get("fullTime", {})

        home_score = full_time.get("home")
        away_score = full_time.get("away")

        groups[group_name]["matches"].append({
            "id": match.get("id"),
            "utcDate": match.get("utcDate"),
            "status": match.get("status"),
            "homeTeam": home_team,
            "awayTeam": away_team,
            "homeCrest": home_crest,
            "awayCrest": away_crest,
            "homeScore": home_score,
            "awayScore": away_score
        })

        for team_name, crest in [
            (home_team, home_crest),
            (away_team, away_crest)
        ]:
            if team_name not in groups[group_name]["standings"]:
                groups[group_name]["standings"][team_name] = {
                    "team": team_name,
                    "crest": crest,
                    "played": 0,
                    "wins": 0,
                    "draws": 0,
                    "losses": 0,
                    "goalsFor": 0,
                    "goalsAgainst": 0,
                    "goalDifference": 0,
                    "points": 0
                }

        if (
            match.get("status") == "FINISHED"
            and home_score is not None
            and away_score is not None
        ):
            home = groups[group_name]["standings"][home_team]
            away = groups[group_name]["standings"][away_team]

            home["played"] += 1
            away["played"] += 1

            home["goalsFor"] += home_score
            home["goalsAgainst"] += away_score

            away["goalsFor"] += away_score
            away["goalsAgainst"] += home_score

            if home_score > away_score:
                home["wins"] += 1
                home["points"] += 3
                away["losses"] += 1

            elif away_score > home_score:
                away["wins"] += 1
                away["points"] += 3
                home["losses"] += 1

            else:
                home["draws"] += 1
                away["draws"] += 1
                home["points"] += 1
                away["points"] += 1

    formatted_groups = []

    for group_name, group_data in groups.items():
        standings = list(group_data["standings"].values())

        for team in standings:
            team["goalDifference"] = (
                team["goalsFor"] - team["goalsAgainst"]
            )

        standings.sort(
            key=lambda team: (
                team["points"],
                team["goalDifference"],
                team["goalsFor"]
            ),
            reverse=True
        )

        for index, team in enumerate(standings):
            team["position"] = index + 1

        formatted_groups.append({
            "group": group_name,
            "standings": standings,
            "matches": group_data["matches"]
        })

    formatted_groups.sort(
        key=lambda item: item["group"]
    )

    return formatted_groups

@app.get("/world-cup-info")
def get_world_cup_info():
    if not API_KEY:
        return {"error": "Missing FOOTBALL_API_KEY"}

    response = requests.get(
        f"{BASE_URL}/competitions/WC",
        headers={"X-Auth-Token": API_KEY}
    )

    if response.status_code != 200:
        return {
            "error": "Failed to fetch World Cup information",
            "status_code": response.status_code,
            "details": response.text
        }

    return response.json()

@app.get("/history")
def get_world_cup_history():
    history_file = Path(__file__).parent / "data" / "world_cup_history.json"

    with open(history_file, "r", encoding="utf-8") as file:
        return json.load(file)

@app.get("/history/{year}/matches")
def get_historical_matches(year: int):
    history_file = Path(__file__).parent / "data" / "world_cup_matches.json"

    with open(history_file, "r", encoding="utf-8") as file:
        data = json.load(file)

    tournament_id = f"WC-{year}"

    matches = [
        match
        for match in data
        if match.get("tournament_id") == tournament_id
    ]

    return matches

@app.get("/history/{year}/groups")
def get_historical_group_standings(year: int):
    standings_file = (
        Path(__file__).parent
        / "data"
        / "world_cup_group_standings.json"
    )

    with open(standings_file, "r", encoding="utf-8") as file:
        data = json.load(file)

    tournament_id = f"WC-{year}"

    standings = [
        row
        for row in data
        if row.get("tournament_id") == tournament_id
    ]

    return standings

@app.get("/platform/summary")
def get_platform_summary():
    data = load_platform_data()

    return data.get(
        "summary",
        {},
    )


@app.get("/platform/teams")
def get_platform_teams(year: int | None = None):
    data = load_platform_data()

    teams = list(
        data.get(
            "teams",
            {},
        ).values()
    )

    if year is not None:
        teams = [
            team
            for team in teams
            if year in team.get(
                "tournaments",
                [],
            )
        ]

    teams.sort(
        key=lambda team: team.get(
            "name",
            "",
        )
    )

    return teams


@app.get("/platform/teams/{team_id}")
def get_platform_team(
    team_id: str,
    year: int | None = None,
):
    data = load_platform_data()

    team = data.get(
        "teams",
        {},
    ).get(team_id)

    if not team:
        return {
            "error": "Team not found"
        }

    available_tournaments = team.get(
        "tournaments",
        [],
    )

    if not available_tournaments:
        selected_year = None

    elif (
        year is not None
        and year in available_tournaments
    ):
        selected_year = year

    else:
        selected_year = max(
            available_tournaments
        )

    squad = None

    if selected_year is not None:
        squad = (
            data.get(
                "squads",
                {},
            )
            .get(
                str(selected_year),
                {},
            )
            .get(team_id)
        )

    return {
        **team,
        "selectedTournament": selected_year,
        "squad": squad,
    }

@app.get("/stats")
def get_world_cup_stats():
    historical_stats_file = (
        Path(__file__).parent
        / "data"
        / "world_cup_stats.json"
    )

    stats_2026_file = (
        Path(__file__).parent
        / "data"
        / "world_cup_2026_stats.json"
    )

    with open(
        historical_stats_file,
        "r",
        encoding="utf-8"
    ) as file:
        historical_stats = json.load(file)

    with open(
        stats_2026_file,
        "r",
        encoding="utf-8"
    ) as file:
        stats_2026 = json.load(file)

    stats = deepcopy(historical_stats)

    # --------------------------------------------------
    # Normalize team names across historical + 2026 data
    # --------------------------------------------------

    def normalize_team_name(team_name):
        aliases = {
            "West Germany": "Germany",
            "Czech Republic": "Czechia",
            "Bosnia and Herzegovina": "Bosnia-Herzegovina",
        }

        return aliases.get(team_name, team_name)

    # --------------------------------------------------
    # Existing historical values
    # --------------------------------------------------

    title_counts = {
        normalize_team_name(row["team"]): row["count"]
        for row in stats["titles"]
    }

    appearance_counts = {
        normalize_team_name(row["team"]): row["count"]
        for row in stats["teamAppearances"]
    }

    goal_counts = {
        normalize_team_name(row["team"]): row["count"]
        for row in stats["teamGoals"]
    }

    # --------------------------------------------------
    # Add 2026 champion
    # --------------------------------------------------

    champion = normalize_team_name(
        stats_2026.get("champion")
    )

    if champion:
        title_counts[champion] = (
            title_counts.get(champion, 0) + 1
        )

    # --------------------------------------------------
    # Add 2026 tournament appearances
    # Each team in the snapshot appeared once in 2026.
    # --------------------------------------------------

    for team in stats_2026.get("teamStats", []):
        team_name = normalize_team_name(
            team.get("team")
        )

        if not team_name:
            continue

        appearance_counts[team_name] = (
            appearance_counts.get(team_name, 0) + 1
        )

    # --------------------------------------------------
    # Add 2026 team goals
    # --------------------------------------------------

    for team in stats_2026.get("teamGoals", []):
        team_name = normalize_team_name(
            team.get("team")
        )

        goals = team.get("goals", 0)

        if not team_name:
            continue

        goal_counts[team_name] = (
            goal_counts.get(team_name, 0) + goals
        )

    # --------------------------------------------------
    # Rebuild sorted output
    # --------------------------------------------------

    stats["titles"] = sorted(
        [
            {
                "team": team,
                "count": count,
            }
            for team, count in title_counts.items()
        ],
        key=lambda row: (
            row["count"],
            row["team"]
        ),
        reverse=True,
    )

    stats["teamAppearances"] = sorted(
        [
            {
                "team": team,
                "count": count,
            }
            for team, count in appearance_counts.items()
        ],
        key=lambda row: (
            row["count"],
            row["team"]
        ),
        reverse=True,
    )

    stats["teamGoals"] = sorted(
        [
            {
                "team": team,
                "count": count,
            }
            for team, count in goal_counts.items()
        ],
        key=lambda row: (
            row["count"],
            row["team"]
        ),
        reverse=True,
    )

    # --------------------------------------------------
    # 2026 snapshot section
    # --------------------------------------------------

    stats["worldCup2026"] = {
        "champion": stats_2026.get("champion"),
        "runnerUp": stats_2026.get("runnerUp"),
        "thirdPlace": stats_2026.get("thirdPlace"),
        "metadata": stats_2026.get("metadata", {}),
        "teamStats": stats_2026.get("teamStats", []),
        "teamGoals": stats_2026.get("teamGoals", []),
    }

    # --------------------------------------------------
    # Coverage metadata
    # --------------------------------------------------

    stats["metadata"]["teamStatsThrough"] = 2026
    stats["metadata"]["playerStatsThrough"] = 2022

    return stats