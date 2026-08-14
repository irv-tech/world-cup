import json
from collections import Counter, defaultdict
from pathlib import Path


BASE_DIR = Path(__file__).parent

SOURCE_FILE = (
    BASE_DIR
    / "data"
    / "world_cup_stats_source.json"
)

OUTPUT_FILE = (
    BASE_DIR
    / "data"
    / "world_cup_stats.json"
)

PLAYER_2026_FILE = (
    BASE_DIR
    / "data"
    / "world_cup_2026_player_stats.json"
)


# --------------------------------------------------
# Load source data
# --------------------------------------------------

with open(
    SOURCE_FILE,
    "r",
    encoding="utf-8"
) as file:
    data = json.load(file)


with open(
    PLAYER_2026_FILE,
    "r",
    encoding="utf-8"
) as file:
    player_2026_data = json.load(file)


# --------------------------------------------------
# Men's World Cup tournaments only
# --------------------------------------------------

mens_tournament_ids = {
    tournament["tournament_id"]
    for tournament in data["tournaments"]
    if "Men's World Cup" in tournament.get(
        "tournament_name",
        ""
    )
}


print(
    f"Men's World Cup tournaments found: "
    f"{len(mens_tournament_ids)}"
)


# --------------------------------------------------
# Canonical team names for aggregate statistics
# --------------------------------------------------

def canonical_team_name(team_name):
    aliases = {
        "West Germany": "Germany",
    }

    return aliases.get(
        team_name,
        team_name
    )


# --------------------------------------------------
# World Cup titles
# Historical data through 2022
# --------------------------------------------------

titles = Counter()

for tournament in data["tournaments"]:
    tournament_id = tournament.get(
        "tournament_id"
    )

    if tournament_id not in mens_tournament_ids:
        continue

    winner = tournament.get("winner")

    if winner:
        winner = canonical_team_name(
            winner
        )

        titles[winner] += 1


# --------------------------------------------------
# Tournament appearances by country
# Historical data through 2022
# --------------------------------------------------

team_tournaments = defaultdict(set)

for appearance in data["team_appearances"]:
    tournament_id = appearance.get(
        "tournament_id"
    )

    if tournament_id not in mens_tournament_ids:
        continue

    team_name = appearance.get(
        "team_name"
    )

    if team_name and tournament_id:
        team_name = canonical_team_name(
            team_name
        )

        team_tournaments[
            team_name
        ].add(
            tournament_id
        )


# --------------------------------------------------
# Goals scored by country
# Historical data through 2022
# --------------------------------------------------

team_goals = Counter()

for appearance in data["team_appearances"]:
    tournament_id = appearance.get(
        "tournament_id"
    )

    if tournament_id not in mens_tournament_ids:
        continue

    team_name = appearance.get(
        "team_name"
    )

    goals_for = appearance.get(
        "goals_for",
        0
    )

    if team_name:
        team_name = canonical_team_name(
            team_name
        )

        team_goals[
            team_name
        ] += goals_for


# --------------------------------------------------
# Player names
# --------------------------------------------------

player_names = {}


PLAYER_NAME_OVERRIDES = {
    "P-08136": "Helmut Rahn",
}


for player in data["players"]:
    player_id = player.get(
        "player_id"
    )

    given_name = player.get(
        "given_name",
        ""
    )

    family_name = player.get(
        "family_name",
        ""
    )

    if given_name == "not applicable":
        given_name = ""

    if family_name == "not applicable":
        family_name = ""

    full_name = (
        f"{given_name} {family_name}"
        .strip()
    )

    if not full_name:
        full_name = player_id

    if player_id in PLAYER_NAME_OVERRIDES:
        full_name = (
            PLAYER_NAME_OVERRIDES[
                player_id
            ]
        )

    player_names[
        player_id
    ] = full_name


# --------------------------------------------------
# Player national teams from appearance data
# --------------------------------------------------

player_countries = {}


for appearance in data["player_appearances"]:
    tournament_id = appearance.get(
        "tournament_id"
    )

    if tournament_id not in mens_tournament_ids:
        continue

    player_id = appearance.get(
        "player_id"
    )

    team_name = appearance.get(
        "team_name"
    )

    if player_id and team_name:
        player_countries[
            player_id
        ] = canonical_team_name(
            team_name
        )


# --------------------------------------------------
# Country overrides
# Used for 2026 players and historical players
# missing from the 1970+ appearance dataset.
# --------------------------------------------------

PLAYER_COUNTRY_OVERRIDES = {
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

    # Historical players not covered by
    # player_appearances before 1970.
    "Just Fontaine": "France",
    "Sándor Kocsis": "Hungary",
    "Gerd Müller": "Germany",
    "Pelé": "Brazil",
    "Helmut Rahn": "Germany",
    "Teófilo Cubillas": "Peru",
    "Jürgen Klinsmann": "Germany",
}


# --------------------------------------------------
# Men's World Cup goals by player
# Historical coverage: 1930-2022
# --------------------------------------------------

player_goals = Counter()


for goal in data["goals"]:
    tournament_id = goal.get(
        "tournament_id"
    )

    if tournament_id not in mens_tournament_ids:
        continue

    if goal.get("own_goal"):
        continue

    player_id = goal.get(
        "player_id"
    )

    if player_id:
        player_goals[
            player_id
        ] += 1


# --------------------------------------------------
# Merge 2026 World Cup player goals
# --------------------------------------------------

player_2026_goals = Counter()


for player in player_2026_data.get(
    "goalIncrements",
    []
):
    name = player.get(
        "name"
    )

    goals = player.get(
        "goals",
        0
    )

    if name:
        player_2026_goals[
            name
        ] += goals


# --------------------------------------------------
# Men's World Cup match appearances
# Historical source coverage: 1970-2022
# --------------------------------------------------

player_appearances = Counter()


for appearance in data["player_appearances"]:
    tournament_id = appearance.get(
        "tournament_id"
    )

    if tournament_id not in mens_tournament_ids:
        continue

    player_id = appearance.get(
        "player_id"
    )

    if player_id:
        player_appearances[
            player_id
        ] += 1


# --------------------------------------------------
# Merge 2026 World Cup player appearances
# --------------------------------------------------

player_2026_appearances = Counter()


for player in player_2026_data.get(
    "appearanceIncrements",
    []
):
    name = player.get(
        "name"
    )

    appearances = player.get(
        "appearances",
        0
    )

    if name:
        player_2026_appearances[
            name
        ] += appearances


# --------------------------------------------------
# All-time player goals through 2026
# --------------------------------------------------

all_time_player_goals = Counter()

player_ids_by_name = {}

player_countries_by_name = {}


for player_id, goals in player_goals.items():
    name = player_names.get(
        player_id,
        player_id
    )

    all_time_player_goals[
        name
    ] += goals

    player_ids_by_name[
        name
    ] = player_id

    country = player_countries.get(
        player_id
    )

    if country:
        player_countries_by_name[
            name
        ] = country


all_time_player_goals.update(
    player_2026_goals
)


player_countries_by_name.update(
    PLAYER_COUNTRY_OVERRIDES
)


# --------------------------------------------------
# All-time player appearances through 2026
# --------------------------------------------------

all_time_player_appearances = Counter()

appearance_player_ids_by_name = {}

appearance_countries_by_name = {}


for (
    player_id,
    appearances
) in player_appearances.items():

    name = player_names.get(
        player_id,
        player_id
    )

    all_time_player_appearances[
        name
    ] += appearances

    appearance_player_ids_by_name[
        name
    ] = player_id

    country = player_countries.get(
        player_id
    )

    if country:
        appearance_countries_by_name[
            name
        ] = country


all_time_player_appearances.update(
    player_2026_appearances
)


appearance_countries_by_name.update(
    PLAYER_COUNTRY_OVERRIDES
)


# --------------------------------------------------
# Build compact output
# --------------------------------------------------

stats = {
    "metadata": {
        "competition": "FIFA Men's World Cup",
        "historicalThrough": 2022,
        "goalCoverage": "1930-2026",
        "playerAppearanceCoverage": "1970-2026",
        "tournamentsIncluded": len(
            mens_tournament_ids
        ),
        "teamNameNormalization": {
            "West Germany": "Germany",
        },
    },

    "titles": [
        {
            "team": team,
            "count": count,
        }
        for team, count
        in titles.most_common()
    ],

    "teamAppearances": sorted(
        [
            {
                "team": team,
                "count": len(
                    tournaments
                ),
            }
            for (
                team,
                tournaments
            ) in team_tournaments.items()
        ],
        key=lambda item: (
            item["count"],
            item["team"]
        ),
        reverse=True,
    ),

    "teamGoals": [
        {
            "team": team,
            "count": count,
        }
        for team, count
        in team_goals.most_common()
    ],

    "topScorers": [
        {
            "playerId": (
                player_ids_by_name.get(
                    name
                )
            ),
            "name": name,
            "country": (
                player_countries_by_name.get(
                    name
                )
            ),
            "goals": goals,
        }
        for name, goals
        in all_time_player_goals.most_common()
    ],

    "playerAppearances": [
        {
            "playerId": (
                appearance_player_ids_by_name.get(
                    name
                )
            ),
            "name": name,
            "country": (
                appearance_countries_by_name.get(
                    name
                )
            ),
            "appearances": appearances,
        }
        for name, appearances
        in all_time_player_appearances.most_common()
    ],
}


# --------------------------------------------------
# Write output
# --------------------------------------------------

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as file:
    json.dump(
        stats,
        file,
        ensure_ascii=False,
        indent=2,
    )


print(
    "World Cup stats generated successfully."
)

print(
    f"Output: {OUTPUT_FILE}"
)