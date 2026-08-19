import json
from pathlib import Path
from urllib.request import urlopen


BASE_DIR = Path(__file__).parent

OUTPUT_FILE = (
    BASE_DIR
    / "data"
    / "world_cup_2026_stats.json"
)

MATCHES_URL = "http://127.0.0.1:8000/matches"


# --------------------------------------------------
# Load finalized 2026 matches from local FastAPI
# --------------------------------------------------

with urlopen(MATCHES_URL) as response:
    matches = json.load(response)


teams = {}


def ensure_team(team_name):
    if team_name not in teams:
        teams[team_name] = {
            "team": team_name,
            "matches": 0,
            "wins": 0,
            "draws": 0,
            "losses": 0,
            "goalsFor": 0,
            "goalsAgainst": 0,
            "goalDifference": 0,
        }


def get_match_goals(match):
    score = match.get("score", {})
    duration = score.get("duration")

    # Penalty shootout kicks are not counted as match goals.
    if duration == "PENALTY_SHOOTOUT":
        regular_time = score.get("regularTime", {}) or {}
        extra_time = score.get("extraTime", {}) or {}

        home_goals = (
            (regular_time.get("home") or 0)
            + (extra_time.get("home") or 0)
        )

        away_goals = (
            (regular_time.get("away") or 0)
            + (extra_time.get("away") or 0)
        )

        return home_goals, away_goals

    full_time = score.get("fullTime", {}) or {}

    return (
        full_time.get("home") or 0,
        full_time.get("away") or 0,
    )


# --------------------------------------------------
# Aggregate 2026 team statistics
# --------------------------------------------------

for match in matches:
    if match.get("status") != "FINISHED":
        continue

    home_team = match.get("homeTeam")
    away_team = match.get("awayTeam")

    if not home_team or not away_team:
        continue

    ensure_team(home_team)
    ensure_team(away_team)

    home = teams[home_team]
    away = teams[away_team]

    home["matches"] += 1
    away["matches"] += 1

    home_goals, away_goals = get_match_goals(match)

    home["goalsFor"] += home_goals
    home["goalsAgainst"] += away_goals

    away["goalsFor"] += away_goals
    away["goalsAgainst"] += home_goals

    winner = match.get("score", {}).get("winner")

    if winner == "HOME_TEAM":
        home["wins"] += 1
        away["losses"] += 1

    elif winner == "AWAY_TEAM":
        away["wins"] += 1
        home["losses"] += 1

    else:
        home["draws"] += 1
        away["draws"] += 1


for team in teams.values():
    team["goalDifference"] = (
        team["goalsFor"]
        - team["goalsAgainst"]
    )


# --------------------------------------------------
# Determine champion from Final
# --------------------------------------------------

champion = None
runner_up = None

final_match = next(
    (
        match
        for match in matches
        if match.get("stage") == "FINAL"
    ),
    None,
)

if final_match:
    winner = final_match.get(
        "score",
        {}
    ).get("winner")

    if winner == "HOME_TEAM":
        champion = final_match.get("homeTeam")
        runner_up = final_match.get("awayTeam")

    elif winner == "AWAY_TEAM":
        champion = final_match.get("awayTeam")
        runner_up = final_match.get("homeTeam")


# --------------------------------------------------
# Third place
# --------------------------------------------------

third_place = None

third_place_match = next(
    (
        match
        for match in matches
        if match.get("stage") == "THIRD_PLACE"
    ),
    None,
)

if third_place_match:
    winner = third_place_match.get(
        "score",
        {}
    ).get("winner")

    if winner == "HOME_TEAM":
        third_place = third_place_match.get(
            "homeTeam"
        )

    elif winner == "AWAY_TEAM":
        third_place = third_place_match.get(
            "awayTeam"
        )

# --------------------------------------------------
# 2026 individual awards
# --------------------------------------------------

awards = [
    {
        "award": "Golden Ball",
        "player": "Rodri",
        "team": "Spain",
    },
    {
        "award": "Golden Boot",
        "player": "Kylian Mbappé",
        "team": "France",
        "goals": 10,
    },
    {
        "award": "Golden Glove",
        "player": "Unai Simón",
        "team": "Spain",
    },
    {
        "award": "Best Young Player",
        "player": "Pau Cubarsí",
        "team": "Spain",
    },
]

# --------------------------------------------------
# Build compact snapshot
# --------------------------------------------------

team_stats = sorted(
    teams.values(),
    key=lambda team: (
        team["wins"],
        team["goalDifference"],
        team["goalsFor"],
    ),
    reverse=True,
)


stats = {
    "metadata": {
        "competition": "2026 FIFA Men's World Cup",
        "year": 2026,
        "teams": len(teams),
        "matches": len(matches),
        "source": "football-data.org via local FastAPI snapshot",
    },

    "champion": champion,
    "runnerUp": runner_up,
    "thirdPlace": third_place,
    "awards": awards,

    "teamStats": team_stats,

    "teamGoals": [
        {
            "team": team["team"],
            "goals": team["goalsFor"],
        }
        for team in sorted(
            teams.values(),
            key=lambda team: team["goalsFor"],
            reverse=True,
        )
    ],
}


with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8",
) as file:
    json.dump(
        stats,
        file,
        ensure_ascii=False,
        indent=2,
    )


print("2026 World Cup stats generated successfully.")
print(f"Teams: {len(teams)}")
print(f"Matches: {len(matches)}")
print(f"Champion: {champion}")
print(f"Runner-up: {runner_up}")
print(f"Third place: {third_place}")
print(f"Output: {OUTPUT_FILE}")