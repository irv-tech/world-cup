import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path


# ---------------------------------------------------------
# File paths
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

SOURCE_FILE = (
    PROJECT_ROOT
    / "temp-worldcup"
    / "data-json"
    / "worldcup.json"
)

OUTPUT_FILE = (
    BASE_DIR
    / "data"
    / "world_cup_platform.json"
)

STATS_2026_FILE = (
    BASE_DIR
    / "data"
    / "world_cup_2026_stats.json"
)

PLAYER_STATS_2026_FILE = (
    BASE_DIR
    / "data"
    / "world_cup_2026_player_stats.json"
)


# ---------------------------------------------------------
# Team identity aliases
# ---------------------------------------------------------

TEAM_IDENTITY_ALIASES = {
    "Bosnia-Herzegovina": "Bosnia and Herzegovina",
    "Czechia": "Czech Republic",
}


# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------

def load_json(path):
    if not path.exists():
        return None

    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def save_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)

    with path.open("w", encoding="utf-8") as file:
        json.dump(
            data,
            file,
            ensure_ascii=False,
            indent=2,
        )


def get_year(tournament_id):
    try:
        return int(str(tournament_id).replace("WC-", ""))
    except (ValueError, AttributeError):
        return None


def clean_name_part(value):
    if value is None:
        return None

    cleaned = str(value).strip()

    if not cleaned:
        return None

    if cleaned.lower() in {
        "not applicable",
        "n/a",
        "na",
        "none",
        "null",
    }:
        return None

    return cleaned


def clean_name(given_name, family_name):
    given_name = clean_name_part(given_name)
    family_name = clean_name_part(family_name)

    parts = [
        part
        for part in [
            given_name,
            family_name,
        ]
        if part
    ]

    if not parts:
        return "Unknown Player"

    return " ".join(parts)


def slugify(value):
    value = unicodedata.normalize("NFKD", str(value))
    value = value.encode("ascii", "ignore").decode("ascii")
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def normalize_team_name(team_name):
    if not team_name:
        return team_name

    return TEAM_IDENTITY_ALIASES.get(
        team_name,
        team_name,
    )


def normalize_position(position_code, position_name):
    code = (position_code or "").upper().strip()
    name = (position_name or "").lower().strip()

    if code == "GK" or "goal keeper" in name or "goalkeeper" in name:
        return "goalkeepers"

    if code in {
        "DF",
        "CB",
        "LB",
        "RB",
        "LWB",
        "RWB",
        "SW",
    }:
        return "defenders"

    if code in {
        "MF",
        "CM",
        "DM",
        "AM",
        "LM",
        "RM",
        "LW",
        "RW",
    }:
        return "midfielders"

    if code in {
        "FW",
        "CF",
        "ST",
        "SS",
    }:
        return "forwards"

    if "defender" in name or "back" in name:
        return "defenders"

    if (
        "midfielder" in name
        or "midfield" in name
        or "winger" in name
    ):
        return "midfielders"

    if "forward" in name or "striker" in name:
        return "forwards"

    return "other"


# ---------------------------------------------------------
# Load source
# ---------------------------------------------------------

print("Loading World Cup source data...")

source = load_json(SOURCE_FILE)

if source is None:
    raise FileNotFoundError(
        f"Could not find source file:\n{SOURCE_FILE}"
    )

stats_2026 = load_json(STATS_2026_FILE)
player_stats_2026 = load_json(PLAYER_STATS_2026_FILE)

tournaments_source = source.get("tournaments", [])
teams_source = source.get("teams", [])
team_appearances_source = source.get("team_appearances", [])
squads_source = source.get("squads", [])
goals_source = source.get("goals", [])
player_appearances_source = source.get("player_appearances", [])
award_winners_source = source.get("award_winners", [])
host_countries_source = source.get("host_countries", [])
matches_source = source.get("matches", [])
tournament_standings_source = source.get("tournament_standings", [])


# ---------------------------------------------------------
# Historical Men's World Cups
# ---------------------------------------------------------

mens_tournaments = {}

for tournament in tournaments_source:
    tournament_name = tournament.get("tournament_name", "")

    if "FIFA Men's World Cup" not in tournament_name:
        continue

    tournament_id = tournament.get("tournament_id")
    year = get_year(tournament_id)

    if year is None:
        continue

    mens_tournaments[tournament_id] = {
        "tournamentId": tournament_id,
        "year": year,
        "name": tournament_name,
    }


mens_tournament_ids = set(mens_tournaments.keys())

print(
    f"Found {len(mens_tournament_ids)} historical "
    "Men's World Cup tournaments."
)


# ---------------------------------------------------------
# Hosts
# ---------------------------------------------------------

hosts_by_tournament = defaultdict(list)

for row in host_countries_source:
    tournament_id = row.get("tournament_id")

    if tournament_id not in mens_tournament_ids:
        continue

    country_name = (
        row.get("country_name")
        or row.get("host_country")
        or row.get("team_name")
    )

    if (
        country_name
        and country_name not in hosts_by_tournament[tournament_id]
    ):
        hosts_by_tournament[tournament_id].append(
            country_name
        )


# ---------------------------------------------------------
# Tournament teams
# ---------------------------------------------------------

teams_by_tournament = defaultdict(dict)
team_tournaments = defaultdict(set)

for row in team_appearances_source:
    tournament_id = row.get("tournament_id")

    if tournament_id not in mens_tournament_ids:
        continue

    team_id = row.get("team_id")
    team_name = row.get("team_name")
    team_code = row.get("team_code")

    if not team_id or not team_name:
        continue

    teams_by_tournament[tournament_id][team_id] = {
        "teamId": team_id,
        "name": team_name,
        "code": team_code,
    }

    year = get_year(tournament_id)

    if year:
        team_tournaments[team_id].add(year)


# ---------------------------------------------------------
# Historical team master records
# ---------------------------------------------------------

team_master = {}

for row in teams_source:
    team_id = row.get("team_id")
    team_name = row.get("team_name")
    team_code = row.get("team_code")

    if not team_id or not team_name:
        continue

    if team_id not in team_tournaments:
        continue

    team_master[team_id] = {
        "teamId": team_id,
        "name": team_name,
        "code": team_code,
        "tournaments": sorted(
            team_tournaments[team_id],
            reverse=True,
        ),
        "titles": [],
        "titleCount": 0,
    }


for tournament_teams in teams_by_tournament.values():
    for team_id, team in tournament_teams.items():

        if team_id in team_master:
            continue

        team_master[team_id] = {
            "teamId": team_id,
            "name": team["name"],
            "code": team.get("code"),
            "tournaments": sorted(
                team_tournaments.get(team_id, []),
                reverse=True,
            ),
            "titles": [],
            "titleCount": 0,
        }


# ---------------------------------------------------------
# Historical champions
# ---------------------------------------------------------

champions_by_tournament = {}

for row in tournament_standings_source:
    tournament_id = row.get("tournament_id")

    if tournament_id not in mens_tournament_ids:
        continue

    position = (
        row.get("position")
        or row.get("position_number")
        or row.get("rank")
    )

    try:
        position = int(position)
    except (TypeError, ValueError):
        continue

    if position != 1:
        continue

    team_id = row.get("team_id")
    team_name = row.get("team_name")

    champions_by_tournament[tournament_id] = {
        "teamId": team_id,
        "name": team_name,
        "code": row.get("team_code"),
    }

    year = get_year(tournament_id)

    if team_id in team_master and year:
        team_master[team_id]["titles"].append(year)


# ---------------------------------------------------------
# Historical squads
# ---------------------------------------------------------

squads = defaultdict(
    lambda: defaultdict(
        lambda: {
            "goalkeepers": [],
            "defenders": [],
            "midfielders": [],
            "forwards": [],
            "other": [],
        }
    )
)

for row in squads_source:
    tournament_id = row.get("tournament_id")

    if tournament_id not in mens_tournament_ids:
        continue

    team_id = row.get("team_id")
    player_id = row.get("player_id")

    if not team_id or not player_id:
        continue

    year = get_year(tournament_id)

    if year is None:
        continue

    group = normalize_position(
        row.get("position_code"),
        row.get("position_name"),
    )

    given_name = clean_name_part(
        row.get("given_name")
    )

    family_name = clean_name_part(
        row.get("family_name")
    )

    player = {
        "playerId": player_id,
        "name": clean_name(
            given_name,
            family_name,
        ),
        "givenName": given_name,
        "familyName": family_name,
        "jerseyNumber": row.get("shirt_number"),
        "position": row.get("position_name"),
        "positionCode": row.get("position_code"),
    }

    squads[str(year)][team_id][group].append(player)


for year_data in squads.values():
    for team_data in year_data.values():
        for players in team_data.values():

            players.sort(
                key=lambda player: (
                    player["jerseyNumber"]
                    if isinstance(
                        player.get("jerseyNumber"),
                        int,
                    )
                    else 999
                )
            )


# ---------------------------------------------------------
# Historical player identity/statistics
# ---------------------------------------------------------

player_identity = {}

goals_by_team_player = defaultdict(
    lambda: defaultdict(int)
)

for row in goals_source:
    tournament_id = row.get("tournament_id")

    if tournament_id not in mens_tournament_ids:
        continue

    player_id = row.get("player_id")
    team_id = row.get("team_id")

    if not player_id or not team_id:
        continue

    goals_by_team_player[team_id][player_id] += 1

    player_identity[player_id] = {
        "playerId": player_id,
        "name": clean_name(
            row.get("given_name"),
            row.get("family_name"),
        ),
    }


appearances_by_team_player = defaultdict(
    lambda: defaultdict(set)
)

for row in player_appearances_source:
    tournament_id = row.get("tournament_id")

    if tournament_id not in mens_tournament_ids:
        continue

    player_id = row.get("player_id")
    team_id = row.get("team_id")
    match_id = row.get("match_id")

    if not player_id or not team_id or not match_id:
        continue

    appearances_by_team_player[team_id][player_id].add(
        match_id
    )

    if player_id not in player_identity:
        player_identity[player_id] = {
            "playerId": player_id,
            "name": clean_name(
                row.get("given_name"),
                row.get("family_name"),
            ),
        }


# ---------------------------------------------------------
# Historical team leaders
# ---------------------------------------------------------

for team_id, team in team_master.items():

    scorer_data = goals_by_team_player.get(
        team_id,
        {},
    )

    if scorer_data:
        player_id, goals = max(
            scorer_data.items(),
            key=lambda item: item[1],
        )

        player = player_identity.get(
            player_id,
            {"name": "Unknown"},
        )

        team["allTimeTopScorer"] = {
            "playerId": player_id,
            "name": player["name"],
            "goals": goals,
        }

    else:
        team["allTimeTopScorer"] = None


    appearance_data = appearances_by_team_player.get(
        team_id,
        {},
    )

    if appearance_data:
        player_id, matches = max(
            appearance_data.items(),
            key=lambda item: len(item[1]),
        )

        player = player_identity.get(
            player_id,
            {"name": "Unknown"},
        )

        team["allTimeMostAppearances"] = {
            "playerId": player_id,
            "name": player["name"],
            "appearances": len(matches),
        }

    else:
        team["allTimeMostAppearances"] = None

# ---------------------------------------------------------
# Historical goals by tournament and player
# Used for Golden Boot / Golden Shoe awards
# ---------------------------------------------------------

goals_by_tournament_player = defaultdict(
    lambda: defaultdict(int)
)

for row in goals_source:
    tournament_id = row.get("tournament_id")
    player_id = row.get("player_id")

    if tournament_id not in mens_tournament_ids:
        continue

    if not player_id:
        continue

    # Own goals do not count toward a player's
    # Golden Boot total.
    if row.get("own_goal"):
        continue

    goals_by_tournament_player[
        tournament_id
    ][player_id] += 1

# ---------------------------------------------------------
# Historical awards
# ---------------------------------------------------------

awards_by_tournament = defaultdict(list)

for row in award_winners_source:
    tournament_id = row.get(
        "tournament_id"
    )

    if tournament_id not in mens_tournament_ids:
        continue

    year = get_year(
        tournament_id
    )

    if year is None:
        continue

    award_name = (
        row.get("award_name")
        or ""
    )

    player_id = row.get(
        "player_id"
    )

    award_name_lower = (
        award_name.lower()
    )

    is_top_scorer_award = (
        "golden boot" in award_name_lower
        or "golden shoe" in award_name_lower
    )

    goals = None

    if (
        is_top_scorer_award
        and player_id
    ):
        goals = (
            goals_by_tournament_player[
                tournament_id
            ].get(
                player_id
            )
        )

    awards_by_tournament[
        str(year)
    ].append(
        {
            "awardId": row.get(
                "award_id"
            ),
            "award": award_name,
            "playerId": player_id,
            "player": clean_name(
                row.get(
                    "given_name"
                ),
                row.get(
                    "family_name"
                ),
            ),
            "teamId": row.get(
                "team_id"
            ),
            "team": row.get(
                "team_name"
            ),
            "teamCode": row.get(
                "team_code"
            ),
            "shared": bool(
                row.get("shared")
            ),
            "goals": goals,
        }
    )

# ---------------------------------------------------------
# Historical match / goal totals
# ---------------------------------------------------------

matches_by_tournament = defaultdict(set)

for row in matches_source:
    tournament_id = row.get("tournament_id")

    if tournament_id not in mens_tournament_ids:
        continue

    match_id = row.get("match_id")

    if match_id:
        matches_by_tournament[tournament_id].add(
            match_id
        )


goals_by_tournament = defaultdict(int)

for row in goals_source:
    tournament_id = row.get("tournament_id")

    if tournament_id in mens_tournament_ids:
        goals_by_tournament[tournament_id] += 1


# ---------------------------------------------------------
# Historical tournament output
# ---------------------------------------------------------

tournaments_output = {}

for tournament_id, tournament in mens_tournaments.items():
    year = tournament["year"]
    year_key = str(year)

    tournament_teams = list(
        teams_by_tournament.get(
            tournament_id,
            {},
        ).values()
    )

    tournament_teams.sort(
        key=lambda team: team["name"]
    )

    tournaments_output[year_key] = {
        "tournamentId": tournament_id,
        "year": year,
        "name": tournament["name"],
        "hosts": hosts_by_tournament.get(
            tournament_id,
            [],
        ),
        "champion": champions_by_tournament.get(
            tournament_id
        ),
        "runnerUp": None,
        "thirdPlace": None,
        "teamCount": len(tournament_teams),
        "matchCount": len(
            matches_by_tournament.get(
                tournament_id,
                set(),
            )
        ),
        "goalCount": goals_by_tournament.get(
            tournament_id,
            0,
        ),
        "teams": tournament_teams,
        "awards": awards_by_tournament.get(
            year_key,
            [],
        ),
    }


# ---------------------------------------------------------
# Prepare team name lookup
# ---------------------------------------------------------

team_id_by_name = {
    team["name"]: team_id
    for team_id, team in team_master.items()
}


def get_or_create_team(team_name):
    team_name = normalize_team_name(team_name)

    if team_name in team_id_by_name:
        return team_id_by_name[team_name]

    generated_id = f"T-2026-{slugify(team_name).upper()}"

    team_master[generated_id] = {
        "teamId": generated_id,
        "name": team_name,
        "code": None,
        "tournaments": [],
        "titles": [],
        "titleCount": 0,
        "allTimeTopScorer": None,
        "allTimeMostAppearances": None,
    }

    team_id_by_name[team_name] = generated_id

    return generated_id


# ---------------------------------------------------------
# Merge 2026 tournament
# ---------------------------------------------------------

if stats_2026:

    print("Merging 2026 tournament data...")

    metadata_2026 = stats_2026.get(
        "metadata",
        {},
    )

    team_stats_2026 = stats_2026.get(
        "teamStats",
        [],
    )

    teams_2026 = []

    for row in team_stats_2026:
        team_name = normalize_team_name(
            row.get("team")
        )

        if not team_name:
            continue

        team_id = get_or_create_team(
            team_name
        )

        team = team_master[team_id]

        if 2026 not in team["tournaments"]:
            team["tournaments"].append(2026)

        team["tournaments"] = sorted(
            team["tournaments"],
            reverse=True,
        )

        teams_2026.append(
            {
                "teamId": team_id,
                "name": team_name,
                "code": team.get("code"),
                "matches": row.get("matches", 0),
                "wins": row.get("wins", 0),
                "draws": row.get("draws", 0),
                "losses": row.get("losses", 0),
                "goalsFor": row.get("goalsFor", 0),
                "goalsAgainst": row.get(
                    "goalsAgainst",
                    0,
                ),
                "goalDifference": row.get(
                    "goalDifference",
                    0,
                ),
            }
        )


    teams_2026.sort(
        key=lambda team: team["name"]
    )


    champion_name = normalize_team_name(
        stats_2026.get("champion")
    )

    runner_up_name = normalize_team_name(
        stats_2026.get("runnerUp")
    )

    third_place_name = normalize_team_name(
        stats_2026.get("thirdPlace")
    )


    def tournament_team_result(team_name):
        if not team_name:
            return None

        team_id = get_or_create_team(
            team_name
        )

        team = team_master[team_id]

        return {
            "teamId": team_id,
            "name": team_name,
            "code": team.get("code"),
        }


    champion_2026 = tournament_team_result(
        champion_name
    )

    runner_up_2026 = tournament_team_result(
        runner_up_name
    )

    third_place_2026 = tournament_team_result(
        third_place_name
    )

# ---------------------------------------------------------
# 2026 individual awards
# ---------------------------------------------------------

awards_2026 = []

for row in stats_2026.get("awards", []):
    team_name = normalize_team_name(
        row.get("team")
    )

    team_id = None
    team_code = None

    if team_name:
        team_id = get_or_create_team(
            team_name
        )

        team_code = team_master[
            team_id
        ].get("code")

    awards_2026.append(
        {
            "awardId": None,
            "award": row.get("award"),
            "playerId": row.get("playerId"),
            "player": row.get("player"),
            "teamId": team_id,
            "team": team_name,
            "teamCode": team_code,
            "shared": False,
            "goals": row.get("goals"),
        }
    )    


    if champion_2026:
        champion_team = team_master[
            champion_2026["teamId"]
        ]

        if 2026 not in champion_team["titles"]:
            champion_team["titles"].append(
                2026
            )


    total_2026_goals = sum(
        row.get("goalsFor", 0)
        for row in team_stats_2026
    )


    tournaments_output["2026"] = {
        "tournamentId": "WC-2026",
        "year": 2026,
        "name": metadata_2026.get(
            "competition",
            "2026 FIFA Men's World Cup",
        ),

        "hosts": [
            "Canada",
            "Mexico",
            "United States",
        ],

        "champion": champion_2026,
        "runnerUp": runner_up_2026,
        "thirdPlace": third_place_2026,

        "teamCount": metadata_2026.get(
            "teams",
            len(teams_2026),
        ),

        "matchCount": metadata_2026.get(
            "matches",
            104,
        ),

        "goalCount": total_2026_goals,

        "teams": teams_2026,

        "awards": awards_2026,
    }


# ---------------------------------------------------------
# Merge 2026 player career increments
# ---------------------------------------------------------

PLAYER_TEAM_2026 = {
    "Kylian Mbappé": "France",
    "Lionel Messi": "Argentina",
    "Jude Bellingham": "England",
    "Erling Haaland": "Norway",
    "Ousmane Dembélé": "France",
    "Harry Kane": "England",
    "Mikel Oyarzabal": "Spain",
    "Ismaïla Sarr": "Senegal",
    "Julián Quiñones": "Mexico",
    "Vinícius Júnior": "Brazil",
    "Cristiano Ronaldo": "Portugal",
    "Luka Modrić": "Croatia",
    "Manuel Neuer": "Germany",
}


if player_stats_2026:

    print("Merging 2026 player career statistics...")

    goal_increments = player_stats_2026.get(
        "goalIncrements",
        [],
    )

    appearance_increments = (
        player_stats_2026.get(
            "appearanceIncrements",
            [],
        )
    )


    historical_goal_totals = defaultdict(
        lambda: defaultdict(int)
    )

    historical_appearance_totals = defaultdict(
        lambda: defaultdict(int)
    )


    for team_id, player_data in goals_by_team_player.items():
        for player_id, goals in player_data.items():

            name = player_identity.get(
                player_id,
                {},
            ).get("name")

            if name:
                historical_goal_totals[
                    team_id
                ][name] += goals


    for (
        team_id,
        player_data
    ) in appearances_by_team_player.items():

        for player_id, matches in player_data.items():

            name = player_identity.get(
                player_id,
                {},
            ).get("name")

            if name:
                historical_appearance_totals[
                    team_id
                ][name] += len(matches)


    for row in goal_increments:
        player_name = row.get("name")
        goals = row.get("goals", 0)

        team_name = PLAYER_TEAM_2026.get(
            player_name
        )

        if not team_name:
            continue

        team_name = normalize_team_name(
            team_name
        )

        team_id = get_or_create_team(
            team_name
        )

        historical_goal_totals[
            team_id
        ][player_name] += goals


    for row in appearance_increments:
        player_name = row.get("name")
        appearances = row.get(
            "appearances",
            0,
        )

        team_name = PLAYER_TEAM_2026.get(
            player_name
        )

        if not team_name:
            continue

        team_name = normalize_team_name(
            team_name
        )

        team_id = get_or_create_team(
            team_name
        )

        historical_appearance_totals[
            team_id
        ][player_name] += appearances


    for team_id, team in team_master.items():

        goal_data = historical_goal_totals.get(
            team_id,
            {},
        )

        if goal_data:
            player_name, goals = max(
                goal_data.items(),
                key=lambda item: item[1],
            )

            team["allTimeTopScorer"] = {
                "name": player_name,
                "goals": goals,
            }


        appearance_data = (
            historical_appearance_totals.get(
                team_id,
                {},
            )
        )

        if appearance_data:
            player_name, appearances = max(
                appearance_data.items(),
                key=lambda item: item[1],
            )

            team["allTimeMostAppearances"] = {
                "name": player_name,
                "appearances": appearances,
            }


# ---------------------------------------------------------
# Finalize team values
# ---------------------------------------------------------

for team in team_master.values():

    team["titles"] = sorted(
        set(team.get("titles", []))
    )

    team["titleCount"] = len(
        team["titles"]
    )

    team["tournaments"] = sorted(
        set(team.get("tournaments", [])),
        reverse=True,
    )


# ---------------------------------------------------------
# Homepage totals
# ---------------------------------------------------------

summary = {
    "tournaments": len(
        tournaments_output
    ),

    "matches": sum(
        tournament.get(
            "matchCount",
            0,
        )
        for tournament
        in tournaments_output.values()
    ),

    "goals": sum(
        tournament.get(
            "goalCount",
            0,
        )
        for tournament
        in tournaments_output.values()
    ),

    "nations": len(
        team_master
    ),
}


# ---------------------------------------------------------
# Final output
# ---------------------------------------------------------

output = {
    "summary": summary,

    "tournaments": dict(
        sorted(
            tournaments_output.items(),
            key=lambda item: int(item[0]),
        )
    ),

    "teams": dict(
        sorted(
            team_master.items(),
            key=lambda item: item[1]["name"],
        )
    ),

    "squads": {
        year: dict(team_data)
        for year, team_data in sorted(
            squads.items(),
            key=lambda item: int(item[0]),
        )
    },

    "metadata": {
        "historicalThrough": 2022,
        "includes2026": bool(
            stats_2026
        ),
        "tournamentCount": len(
            tournaments_output
        ),
        "teamIdentityCount": len(
            team_master
        ),
        "source": (
            "worldcup.json + "
            "world_cup_2026_stats.json + "
            "world_cup_2026_player_stats.json"
        ),
    },
}


# ---------------------------------------------------------
# Save
# ---------------------------------------------------------

save_json(
    OUTPUT_FILE,
    output,
)


print()
print(
    "World Cup platform data generated successfully."
)
print(f"Output: {OUTPUT_FILE}")

print()
print("SUMMARY")
print(
    f"Tournaments: {summary['tournaments']}"
)
print(
    f"Matches: {summary['matches']}"
)
print(
    f"Goals: {summary['goals']}"
)
print(
    f"Team identities: {summary['nations']}"
)
print(
    f"Teams in master collection: "
    f"{len(team_master)}"
)
print(
    f"Historical squad tournament years: "
    f"{len(squads)}"
)