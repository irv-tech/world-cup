from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import json
import os
from copy import deepcopy
from pathlib import Path

import requests
from dotenv import load_dotenv

from database.database import Base
from database.database import engine

from models.user import User
from models.favorite import FavoriteTeam
from models.favorite_player import FavoritePlayer

from routes import auth
from routes import favorites


# --------------------------------------------------
# Database
# --------------------------------------------------

Base.metadata.create_all(
    bind=engine
)


# --------------------------------------------------
# Environment
# --------------------------------------------------

load_dotenv()


# --------------------------------------------------
# FastAPI application
# --------------------------------------------------

app = FastAPI()

app.include_router(
    auth.router
)

app.include_router(
    favorites.router
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173",
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


# --------------------------------------------------
# football-data.org
# --------------------------------------------------

API_KEY = os.getenv(
    "FOOTBALL_API_KEY"
)

BASE_URL = (
    "https://api.football-data.org/v4"
)


# --------------------------------------------------
# Local data files
# --------------------------------------------------

DATA_DIR = (
    Path(__file__).parent
    / "data"
)


MATCHES_SNAPSHOT_FILE = (
    DATA_DIR
    / "world_cup_2026_matches.json"
)


# --------------------------------------------------
# Platform data helper
# --------------------------------------------------

def load_platform_data():
    platform_file = (
        DATA_DIR
        / "world_cup_platform.json"
    )

    with open(
        platform_file,
        "r",
        encoding="utf-8",
    ) as file:
        return json.load(file)


# --------------------------------------------------
# 2026 match snapshot helpers
# --------------------------------------------------

def format_world_cup_matches(
    matches
):
    formatted_matches = []

    for match in matches:
        formatted_matches.append(
            {
                "id":
                    match.get("id"),

                "utcDate":
                    match.get("utcDate"),

                "status":
                    match.get("status"),

                "stage":
                    match.get("stage"),

                "group":
                    match.get("group"),

                "homeTeam":
                    match
                    .get(
                        "homeTeam",
                        {},
                    )
                    .get("name"),

                "awayTeam":
                    match
                    .get(
                        "awayTeam",
                        {},
                    )
                    .get("name"),

                "homeCrest":
                    match
                    .get(
                        "homeTeam",
                        {},
                    )
                    .get("crest"),

                "awayCrest":
                    match
                    .get(
                        "awayTeam",
                        {},
                    )
                    .get("crest"),

                "score":
                    match.get(
                        "score"
                    ),
            }
        )

    return formatted_matches


def load_matches_snapshot():
    if not MATCHES_SNAPSHOT_FILE.exists():
        return None

    with open(
        MATCHES_SNAPSHOT_FILE,
        "r",
        encoding="utf-8",
    ) as file:
        return json.load(file)


def save_matches_snapshot(
    matches
):
    MATCHES_SNAPSHOT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with open(
        MATCHES_SNAPSHOT_FILE,
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            matches,
            file,
            ensure_ascii=False,
            indent=2,
        )


def get_2026_matches_data(
    refresh=False
):
    """
    Load finalized 2026 World Cup matches.

    Normal requests use the local snapshot.

    refresh=True intentionally requests
    fresh data from football-data.org.

    If the external API fails or becomes
    rate limited, an existing snapshot is
    returned automatically.
    """

    if not refresh:
        snapshot = (
            load_matches_snapshot()
        )

        if snapshot is not None:
            return snapshot


    if not API_KEY:
        snapshot = (
            load_matches_snapshot()
        )

        if snapshot is not None:
            return snapshot

        return {
            "error":
                "Missing FOOTBALL_API_KEY"
        }


    response = requests.get(
        (
            f"{BASE_URL}"
            "/competitions/WC/matches"
        ),
        headers={
            "X-Auth-Token":
                API_KEY
        },
    )


    if response.status_code != 200:
        snapshot = (
            load_matches_snapshot()
        )

        if snapshot is not None:
            print(
                "football-data.org match "
                "request failed. "
                "Using local snapshot."
            )

            return snapshot

        return {
            "error":
                "Failed to fetch matches",

            "status_code":
                response.status_code,

            "details":
                response.text,
        }


    data = response.json()

    matches = data.get(
        "matches",
        [],
    )

    formatted_matches = (
        format_world_cup_matches(
            matches
        )
    )


    save_matches_snapshot(
        formatted_matches
    )


    return formatted_matches


# --------------------------------------------------
# Root
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message":
            "World Cup backend is running"
    }


# --------------------------------------------------
# Current World Cup teams
# --------------------------------------------------

@app.get("/teams")
def get_teams():
    if not API_KEY:
        return {
            "error":
                "Missing FOOTBALL_API_KEY"
        }


    response = requests.get(
        (
            f"{BASE_URL}"
            "/competitions/WC/teams"
        ),
        headers={
            "X-Auth-Token":
                API_KEY
        },
    )


    if response.status_code != 200:
        return {
            "error":
                "Failed to fetch teams",

            "status_code":
                response.status_code,

            "details":
                response.text,
        }


    data = response.json()

    return data.get(
        "teams",
        [],
    )


# --------------------------------------------------
# Current World Cup squad
# Uses competition endpoint because the direct
# /teams/{id} endpoint is restricted on the
# current football-data.org subscription.
# --------------------------------------------------

@app.get("/teams/{team_id}/squad")
def get_team_squad(
    team_id: int
):
    if not API_KEY:
        return {
            "error":
                "Missing FOOTBALL_API_KEY"
        }


    response = requests.get(
        (
            f"{BASE_URL}"
            "/competitions/WC/teams"
        ),
        headers={
            "X-Auth-Token":
                API_KEY
        },
    )


    if response.status_code != 200:
        return {
            "error":
                "Failed to fetch World Cup teams",

            "status_code":
                response.status_code,

            "details":
                response.text,
        }


    data = response.json()

    teams = data.get(
        "teams",
        [],
    )


    team = next(
        (
            item
            for item in teams
            if item.get("id") ==
            team_id
        ),
        None,
    )


    if not team:
        return {
            "error":
                "Team not found"
        }


    squad = team.get(
        "squad",
        [],
    )


    normalized_squad = []

    for player in squad:
        normalized_squad.append(
            {
                "externalPlayerId":
                    player.get("id"),

                "name":
                    player.get("name"),

                "position":
                    player.get(
                        "position"
                    ),

                "dateOfBirth":
                    player.get(
                        "dateOfBirth"
                    ),

                "nationality":
                    player.get(
                        "nationality"
                    ),
            }
        )


    return {
        "externalTeamId":
            team.get("id"),

        "name":
            team.get("name"),

        "shortName":
            team.get("shortName"),

        "tla":
            team.get("tla"),

        "crest":
            team.get("crest"),

        "coach": (
            team
            .get(
                "coach",
                {},
            )
            .get("name")
            if team.get("coach")
            else None
        ),

        "squad":
            normalized_squad,
    }


# --------------------------------------------------
# Current World Cup players
# --------------------------------------------------

@app.get("/players")
def get_players():
    if not API_KEY:
        return {
            "error":
                "Missing FOOTBALL_API_KEY"
        }


    response = requests.get(
        (
            f"{BASE_URL}"
            "/competitions/WC/teams"
        ),
        headers={
            "X-Auth-Token":
                API_KEY
        },
    )


    if response.status_code != 200:
        return {
            "error":
                "Failed to fetch players",

            "status_code":
                response.status_code,

            "details":
                response.text,
        }


    data = response.json()

    teams = data.get(
        "teams",
        [],
    )


    players = []


    for team in teams:
        for player in team.get(
            "squad",
            [],
        ):
            players.append(
                {
                    "id":
                        player.get("id"),

                    "name":
                        player.get(
                            "name"
                        ),

                    "position":
                        player.get(
                            "position"
                        ),

                    "dateOfBirth":
                        player.get(
                            "dateOfBirth"
                        ),

                    "nationality":
                        player.get(
                            "nationality"
                        ),

                    "team":
                        team.get("name"),

                    "teamCode":
                        team.get("tla"),

                    "teamCrest":
                        team.get("crest"),
                }
            )


    return players


# --------------------------------------------------
# 2026 matches
# Local snapshot by default.
#
# Normal:
# /matches
#
# Refresh intentionally:
# /matches?refresh=true
# --------------------------------------------------

@app.get("/matches")
def get_matches(
    refresh: bool = False
):
    return get_2026_matches_data(
        refresh=refresh
    )


# --------------------------------------------------
# 2026 group standings
#
# IMPORTANT:
# This now uses the SAME local match snapshot
# as /matches instead of making another
# football-data.org request.
# --------------------------------------------------

@app.get("/world-cup-2026/groups")
def get_2026_groups():
    matches = (
        get_2026_matches_data()
    )


    if not isinstance(
        matches,
        list,
    ):
        return matches


    group_matches = [
        match
        for match in matches
        if (
            match.get("stage") ==
            "GROUP_STAGE"
            and match.get("group")
        )
    ]


    groups = {}


    for match in group_matches:
        group_name = match.get(
            "group"
        )


        if group_name not in groups:
            groups[group_name] = {
                "standings": {},
                "matches": [],
            }


        home_team = match.get(
            "homeTeam"
        )

        away_team = match.get(
            "awayTeam"
        )

        home_crest = match.get(
            "homeCrest"
        )

        away_crest = match.get(
            "awayCrest"
        )


        score = match.get(
            "score",
            {},
        ) or {}

        full_time = score.get(
            "fullTime",
            {},
        ) or {}


        home_score = full_time.get(
            "home"
        )

        away_score = full_time.get(
            "away"
        )


        groups[
            group_name
        ][
            "matches"
        ].append(
            {
                "id":
                    match.get("id"),

                "utcDate":
                    match.get(
                        "utcDate"
                    ),

                "status":
                    match.get(
                        "status"
                    ),

                "homeTeam":
                    home_team,

                "awayTeam":
                    away_team,

                "homeCrest":
                    home_crest,

                "awayCrest":
                    away_crest,

                "homeScore":
                    home_score,

                "awayScore":
                    away_score,
            }
        )


        for (
            team_name,
            crest,
        ) in [
            (
                home_team,
                home_crest,
            ),
            (
                away_team,
                away_crest,
            ),
        ]:
            if (
                team_name
                not in
                groups[
                    group_name
                ][
                    "standings"
                ]
            ):
                groups[
                    group_name
                ][
                    "standings"
                ][
                    team_name
                ] = {
                    "team":
                        team_name,

                    "crest":
                        crest,

                    "played":
                        0,

                    "wins":
                        0,

                    "draws":
                        0,

                    "losses":
                        0,

                    "goalsFor":
                        0,

                    "goalsAgainst":
                        0,

                    "goalDifference":
                        0,

                    "points":
                        0,
                }


        if (
            match.get("status") ==
            "FINISHED"
            and home_score
            is not None
            and away_score
            is not None
        ):
            home = (
                groups[
                    group_name
                ][
                    "standings"
                ][
                    home_team
                ]
            )

            away = (
                groups[
                    group_name
                ][
                    "standings"
                ][
                    away_team
                ]
            )


            home["played"] += 1
            away["played"] += 1


            home["goalsFor"] += (
                home_score
            )

            home[
                "goalsAgainst"
            ] += away_score


            away["goalsFor"] += (
                away_score
            )

            away[
                "goalsAgainst"
            ] += home_score


            if (
                home_score >
                away_score
            ):
                home["wins"] += 1
                home["points"] += 3
                away["losses"] += 1

            elif (
                away_score >
                home_score
            ):
                away["wins"] += 1
                away["points"] += 3
                home["losses"] += 1

            else:
                home["draws"] += 1
                away["draws"] += 1

                home["points"] += 1
                away["points"] += 1


    formatted_groups = []


    for (
        group_name,
        group_data,
    ) in groups.items():

        standings = list(
            group_data[
                "standings"
            ].values()
        )


        for team in standings:
            team[
                "goalDifference"
            ] = (
                team[
                    "goalsFor"
                ]
                -
                team[
                    "goalsAgainst"
                ]
            )


        standings.sort(
            key=lambda team: (
                team[
                    "points"
                ],
                team[
                    "goalDifference"
                ],
                team[
                    "goalsFor"
                ],
            ),
            reverse=True,
        )


        for (
            index,
            team,
        ) in enumerate(
            standings
        ):
            team[
                "position"
            ] = index + 1


        formatted_groups.append(
            {
                "group":
                    group_name,

                "standings":
                    standings,

                "matches":
                    group_data[
                        "matches"
                    ],
            }
        )


    formatted_groups.sort(
        key=lambda item:
            item["group"]
    )


    return formatted_groups


# --------------------------------------------------
# World Cup competition info
# --------------------------------------------------

@app.get("/world-cup-info")
def get_world_cup_info():
    if not API_KEY:
        return {
            "error":
                "Missing FOOTBALL_API_KEY"
        }


    response = requests.get(
        (
            f"{BASE_URL}"
            "/competitions/WC"
        ),
        headers={
            "X-Auth-Token":
                API_KEY
        },
    )


    if response.status_code != 200:
        return {
            "error":
                "Failed to fetch World Cup information",

            "status_code":
                response.status_code,

            "details":
                response.text,
        }


    return response.json()


# --------------------------------------------------
# Historical World Cup summary
# --------------------------------------------------

@app.get("/history")
def get_world_cup_history():
    history_file = (
        DATA_DIR
        / "world_cup_history.json"
    )


    with open(
        history_file,
        "r",
        encoding="utf-8",
    ) as file:
        return json.load(file)


# --------------------------------------------------
# Historical matches
# --------------------------------------------------

@app.get("/history/{year}/matches")
def get_historical_matches(
    year: int
):
    history_file = (
        DATA_DIR
        / "world_cup_matches.json"
    )


    with open(
        history_file,
        "r",
        encoding="utf-8",
    ) as file:
        data = json.load(file)


    tournament_id = (
        f"WC-{year}"
    )


    matches = [
        match
        for match in data
        if match.get(
            "tournament_id"
        ) == tournament_id
    ]


    return matches


# --------------------------------------------------
# Historical group standings
# --------------------------------------------------

@app.get("/history/{year}/groups")
def get_historical_group_standings(
    year: int
):
    standings_file = (
        DATA_DIR
        / "world_cup_group_standings.json"
    )


    with open(
        standings_file,
        "r",
        encoding="utf-8",
    ) as file:
        data = json.load(file)


    tournament_id = (
        f"WC-{year}"
    )


    standings = [
        row
        for row in data
        if row.get(
            "tournament_id"
        ) == tournament_id
    ]


    return standings


# --------------------------------------------------
# Platform summary
# --------------------------------------------------

@app.get("/platform/summary")
def get_platform_summary():
    data = (
        load_platform_data()
    )


    return data.get(
        "summary",
        {},
    )


# --------------------------------------------------
# Platform teams
# --------------------------------------------------

@app.get("/platform/teams")
def get_platform_teams(
    year: int | None = None
):
    data = (
        load_platform_data()
    )


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
        key=lambda team:
            team.get(
                "name",
                "",
            )
    )


    return teams


# --------------------------------------------------
# Platform team details
# --------------------------------------------------

@app.get("/platform/teams/{team_id}")
def get_platform_team(
    team_id: str,
    year: int | None = None,
):
    data = (
        load_platform_data()
    )


    team = data.get(
        "teams",
        {},
    ).get(
        team_id
    )


    if not team:
        return {
            "error":
                "Team not found"
        }


    available_tournaments = (
        team.get(
            "tournaments",
            [],
        )
    )


    if not available_tournaments:
        selected_year = None

    elif (
        year is not None
        and year
        in available_tournaments
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
                str(
                    selected_year
                ),
                {},
            )
            .get(
                team_id
            )
        )


    return {
        **team,

        "selectedTournament":
            selected_year,

        "squad":
            squad,
    }


# --------------------------------------------------
# Platform tournament
# --------------------------------------------------

@app.get("/platform/tournaments/{year}")
def get_platform_tournament(
    year: int
):
    data = (
        load_platform_data()
    )


    tournament = (
        data.get(
            "tournaments",
            {},
        )
        .get(
            str(year)
        )
    )


    if not tournament:
        return {
            "error":
                "Tournament not found"
        }


    return tournament


# --------------------------------------------------
# World Cup statistics
# --------------------------------------------------

@app.get("/stats")
def get_world_cup_stats():

    historical_stats_file = (
        DATA_DIR
        / "world_cup_stats.json"
    )


    stats_2026_file = (
        DATA_DIR
        / "world_cup_2026_stats.json"
    )


    with open(
        historical_stats_file,
        "r",
        encoding="utf-8",
    ) as file:
        historical_stats = (
            json.load(file)
        )


    with open(
        stats_2026_file,
        "r",
        encoding="utf-8",
    ) as file:
        stats_2026 = (
            json.load(file)
        )


    stats = deepcopy(
        historical_stats
    )


    # --------------------------------------------------
    # Normalize team names across historical + 2026 data
    # --------------------------------------------------

    def normalize_team_name(
        team_name
    ):
        aliases = {
            "West Germany":
                "Germany",

            "Czech Republic":
                "Czechia",

            "Bosnia and Herzegovina":
                "Bosnia-Herzegovina",
        }


        return aliases.get(
            team_name,
            team_name,
        )


    # --------------------------------------------------
    # Existing historical values
    # --------------------------------------------------

    title_counts = {
        normalize_team_name(
            row["team"]
        ):
            row["count"]

        for row
        in stats["titles"]
    }


    appearance_counts = {
        normalize_team_name(
            row["team"]
        ):
            row["count"]

        for row
        in stats[
            "teamAppearances"
        ]
    }


    goal_counts = {
        normalize_team_name(
            row["team"]
        ):
            row["count"]

        for row
        in stats[
            "teamGoals"
        ]
    }


    # --------------------------------------------------
    # Add 2026 champion
    # --------------------------------------------------

    champion = (
        normalize_team_name(
            stats_2026.get(
                "champion"
            )
        )
    )


    if champion:
        title_counts[
            champion
        ] = (
            title_counts.get(
                champion,
                0,
            )
            + 1
        )


    # --------------------------------------------------
    # Add 2026 tournament appearances
    # --------------------------------------------------

    for team in stats_2026.get(
        "teamStats",
        [],
    ):
        team_name = (
            normalize_team_name(
                team.get(
                    "team"
                )
            )
        )


        if not team_name:
            continue


        appearance_counts[
            team_name
        ] = (
            appearance_counts.get(
                team_name,
                0,
            )
            + 1
        )


    # --------------------------------------------------
    # Add 2026 team goals
    # --------------------------------------------------

    for team in stats_2026.get(
        "teamGoals",
        [],
    ):
        team_name = (
            normalize_team_name(
                team.get(
                    "team"
                )
            )
        )


        goals = team.get(
            "goals",
            0,
        )


        if not team_name:
            continue


        goal_counts[
            team_name
        ] = (
            goal_counts.get(
                team_name,
                0,
            )
            + goals
        )


    # --------------------------------------------------
    # Rebuild sorted output
    # --------------------------------------------------

    stats["titles"] = sorted(
        [
            {
                "team":
                    team,

                "count":
                    count,
            }

            for (
                team,
                count,
            )
            in title_counts.items()
        ],
        key=lambda row: (
            row["count"],
            row["team"],
        ),
        reverse=True,
    )


    stats[
        "teamAppearances"
    ] = sorted(
        [
            {
                "team":
                    team,

                "count":
                    count,
            }

            for (
                team,
                count,
            )
            in appearance_counts.items()
        ],
        key=lambda row: (
            row["count"],
            row["team"],
        ),
        reverse=True,
    )


    stats[
        "teamGoals"
    ] = sorted(
        [
            {
                "team":
                    team,

                "count":
                    count,
            }

            for (
                team,
                count,
            )
            in goal_counts.items()
        ],
        key=lambda row: (
            row["count"],
            row["team"],
        ),
        reverse=True,
    )


    # --------------------------------------------------
    # 2026 snapshot section
    # --------------------------------------------------

    stats["worldCup2026"] = {
        "champion":
            stats_2026.get(
                "champion"
            ),

        "runnerUp":
            stats_2026.get(
                "runnerUp"
            ),

        "thirdPlace":
            stats_2026.get(
                "thirdPlace"
            ),

        "metadata":
            stats_2026.get(
                "metadata",
                {},
            ),

        "teamStats":
            stats_2026.get(
                "teamStats",
                [],
            ),

        "teamGoals":
            stats_2026.get(
                "teamGoals",
                [],
            ),
    }


    # --------------------------------------------------
    # Coverage metadata
    # --------------------------------------------------

    stats[
        "metadata"
    ][
        "teamStatsThrough"
    ] = 2026


    stats[
        "metadata"
    ][
        "playerStatsThrough"
    ] = 2022


    return stats