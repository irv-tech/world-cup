import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  getPlatformTeam,
  getPlatformTeams,
} from "../services/platformApi";

import {
  addFavoritePlayer,
} from "../services/favoritesApi";

import {
  findTeamLineage,
  getLineageTeams,
  buildEditionOptions,
  resolveEditionOption,
} from "../data/teamIdentity";


const countryCodes = {
  Algeria: "dz",
  Angola: "ao",
  Argentina: "ar",
  Australia: "au",
  Austria: "at",
  Belgium: "be",
  Bolivia: "bo",
  "Bosnia and Herzegovina": "ba",
  Brazil: "br",
  Bulgaria: "bg",
  Cameroon: "cm",
  Canada: "ca",
  "Cape Verde Islands": "cv",
  Chile: "cl",
  China: "cn",
  Colombia: "co",
  "Congo DR": "cd",
  "Costa Rica": "cr",
  Croatia: "hr",
  Cuba: "cu",
  Curaçao: "cw",
  "Czech Republic": "cz",
  Denmark: "dk",
  Ecuador: "ec",
  Egypt: "eg",
  "El Salvador": "sv",
  England: "gb-eng",
  France: "fr",
  Germany: "de",
  Ghana: "gh",
  Greece: "gr",
  Haiti: "ht",
  Honduras: "hn",
  Hungary: "hu",
  Iceland: "is",
  Indonesia: "id",
  Iran: "ir",
  Iraq: "iq",
  Israel: "il",
  Italy: "it",
  "Ivory Coast": "ci",
  Jamaica: "jm",
  Japan: "jp",
  Jordan: "jo",
  Kuwait: "kw",
  Mexico: "mx",
  Morocco: "ma",
  Netherlands: "nl",
  "New Zealand": "nz",
  Nigeria: "ng",
  "North Korea": "kp",
  "Northern Ireland": "gb-nir",
  Norway: "no",
  Panama: "pa",
  Paraguay: "py",
  Peru: "pe",
  Poland: "pl",
  Portugal: "pt",
  Qatar: "qa",
  "Republic of Ireland": "ie",
  Romania: "ro",
  Russia: "ru",
  "Saudi Arabia": "sa",
  Scotland: "gb-sct",
  Senegal: "sn",
  Serbia: "rs",
  Slovakia: "sk",
  Slovenia: "si",
  "South Africa": "za",
  "South Korea": "kr",
  Spain: "es",
  Sweden: "se",
  Switzerland: "ch",
  Togo: "tg",
  "Trinidad and Tobago": "tt",
  Tunisia: "tn",
  Turkey: "tr",
  Ukraine: "ua",
  "United Arab Emirates": "ae",
  "United States": "us",
  Uruguay: "uy",
  Uzbekistan: "uz",
  Wales: "gb-wls",
};


function getFlagUrl(teamName) {
  const code = countryCodes[teamName];

  if (!code) {
    return null;
  }

  return `https://flagcdn.com/${code}.svg`;
}


function formatJerseyNumber(jerseyNumber) {
  if (
    jerseyNumber === null ||
    jerseyNumber === undefined ||
    jerseyNumber === 0
  ) {
    return "—";
  }

  return `#${jerseyNumber}`;
}


function getBestTopScorer(teams) {
  const candidates = teams
    .map((team) => team.allTimeTopScorer)
    .filter(Boolean);

  if (candidates.length === 0) {
    return null;
  }

  return candidates.reduce(
    (best, current) =>
      current.goals > best.goals
        ? current
        : best
  );
}


function getBestAppearanceLeader(teams) {
  const candidates = teams
    .map(
      (team) =>
        team.allTimeMostAppearances
    )
    .filter(Boolean);

  if (candidates.length === 0) {
    return null;
  }

  return candidates.reduce(
    (best, current) =>
      current.appearances >
      best.appearances
        ? current
        : best
  );
}


function normalize2026TeamName(teamName) {
  const aliases = {
    "Bosnia and Herzegovina":
      "Bosnia-Herzegovina",

    "Czech Republic":
      "Czechia",

    "Cape Verde Islands":
      "Cape Verde",

    "Congo DR":
      "DR Congo",
  };

  return aliases[teamName] || teamName;
}


function build2026Squad(squadData) {
  const groupedSquad = {
    goalkeepers: [],
    defenders: [],
    midfielders: [],
    forwards: [],
    other: [],
  };

  const players =
    squadData?.squad || [];

  players.forEach((player) => {
    let group = "other";

    const position =
      (
        player.position ||
        ""
      ).toLowerCase();

    if (
      position.includes(
        "goalkeeper"
      )
    ) {
      group = "goalkeepers";
    } else if (
      position.includes("defence") ||
      position.includes("defender")
    ) {
      group = "defenders";
    } else if (
      position.includes("midfield")
    ) {
      group = "midfielders";
    } else if (
      position.includes("offence") ||
      position.includes("forward") ||
      position.includes("striker")
    ) {
      group = "forwards";
    }

    groupedSquad[group].push({
      playerId:
        `FD-${player.externalPlayerId}`,

      externalPlayerId:
        player.externalPlayerId,

      name:
        player.name,

      position:
        player.position,

      dateOfBirth:
        player.dateOfBirth,

      nationality:
        player.nationality,

      jerseyNumber:
        null,
    });
  });

  return groupedSquad;
}


function TeamDetails() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [searchParams] =
    useSearchParams();

  const yearFromUrl =
    searchParams.get("year");

  const identityFromUrl =
    searchParams.get(
      "identity"
    );

  const [
    team,
    setTeam,
  ] = useState(null);

  const [
    canonicalName,
    setCanonicalName,
  ] = useState("");

  const [
    selectedIdentityName,
    setSelectedIdentityName,
  ] = useState("");

  const [
    lineageTeams,
    setLineageTeams,
  ] = useState([]);

  const [
    selectedEdition,
    setSelectedEdition,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    async function loadTeam() {
      try {
        setLoading(true);
        setError("");

        const allTeams =
          await getPlatformTeams();

        const routeTeam =
          allTeams.find(
            (item) =>
              item.teamId === id
          );

        if (!routeTeam) {
          throw new Error(
            "Team not found."
          );
        }

        const lineage =
          findTeamLineage(
            routeTeam.name
          );

        const resolvedLineageTeams =
          lineage
            ? getLineageTeams(
                allTeams,
                lineage
              )
            : [routeTeam];

        const resolvedCanonicalName =
          lineage
            ? lineage.canonicalName
            : routeTeam.name;

        const editionOptions =
          buildEditionOptions(
            resolvedLineageTeams,
            resolvedCanonicalName
          );

        if (
          editionOptions.length === 0
        ) {
          throw new Error(
            "No World Cup editions found for this team."
          );
        }

        const requestedYear =
          yearFromUrl
            ? Number(yearFromUrl)
            : null;

        const edition =
          resolveEditionOption(
            editionOptions,
            requestedYear,
            identityFromUrl
          );

        if (!edition) {
          throw new Error(
            "Unable to resolve tournament edition."
          );
        }

        let detailedTeam =
          await getPlatformTeam(
            edition.teamId,
            edition.year
          );

        /*
         * Historical squads already come
         * from world_cup_platform.json.
         *
         * For 2026, bridge the platform
         * identity to football-data.org.
         */
        if (
          edition.year === 2026
        ) {
          try {
            const teamsResponse =
              await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/teams`
              );

            if (
              !teamsResponse.ok
            ) {
              throw new Error(
                "Failed to load 2026 team list."
              );
            }

            const externalTeams =
              await teamsResponse.json();

            const externalTeamName =
              normalize2026TeamName(
                edition.identityName
              );

            const externalTeam =
              externalTeams.find(
                (item) =>
                  item.name ===
                  externalTeamName
              );

            if (!externalTeam) {
              throw new Error(
                `No 2026 squad mapping found for ${edition.identityName}.`
              );
            }

            const squadResponse =
              await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/teams/${externalTeam.id}/squad`
              );

            if (
              !squadResponse.ok
            ) {
              throw new Error(
                "Failed to load 2026 squad."
              );
            }

            const squadData =
              await squadResponse.json();

            if (
              squadData.error
            ) {
              throw new Error(
                squadData.error
              );
            }

            detailedTeam = {
              ...detailedTeam,

              squad:
                build2026Squad(
                  squadData
                ),

              squadSource:
                "football-data.org",

              externalTeamId:
                squadData.externalTeamId,

              squadCrest:
                squadData.crest,

              coach:
                squadData.coach,
            };
          } catch (
            squadError
          ) {
            console.error(
              "2026 squad API error:",
              squadError
            );
          }
        }

        setTeam(
          detailedTeam
        );

        setCanonicalName(
          resolvedCanonicalName
        );

        setSelectedIdentityName(
          edition.identityName
        );

        setLineageTeams(
          resolvedLineageTeams
        );

        setSelectedEdition(
          edition
        );
      } catch (err) {
        console.error(
          "Platform team details API error:",
          err
        );

        setError(
          err.message ||
            "Unable to load team details."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
  }, [
    id,
    yearFromUrl,
    identityFromUrl,
  ]);


  const editionOptions =
    useMemo(() => {
      if (
        lineageTeams.length === 0
      ) {
        return [];
      }

      return buildEditionOptions(
        lineageTeams,
        canonicalName
      );
    }, [
      lineageTeams,
      canonicalName,
    ]);


  const titleYears =
    useMemo(() => {
      return [
        ...new Set(
          lineageTeams.flatMap(
            (item) =>
              item.titles || []
          )
        ),
      ].sort(
        (a, b) => a - b
      );
    }, [
      lineageTeams,
    ]);


  const allTimeTopScorer =
    useMemo(
      () =>
        getBestTopScorer(
          lineageTeams
        ),
      [lineageTeams]
    );


  const allTimeAppearanceLeader =
    useMemo(
      () =>
        getBestAppearanceLeader(
          lineageTeams
        ),
      [lineageTeams]
    );


  function handleTournamentChange(
    event
  ) {
    const selectedValue =
      event.target.value;

    const [
      yearValue,
      identityId,
    ] =
      selectedValue.split("|");

    navigate(
      `/teams/${id}` +
        `?year=${yearValue}` +
        `&identity=${encodeURIComponent(
          identityId
        )}`
    );
  }


  async function handleAddPlayerFavorite(
    player
  ) {
    try {
      const favoritePlayer = {
        id:
          player.playerId,

        name:
          player.name,

        position:
          player.position,

        nationality:
          selectedIdentityName,

        teamName:
          selectedIdentityName,

        teamId:
          team.teamId,

        jerseyNumber:
          player.jerseyNumber ??
          null,
      };

      await addFavoritePlayer(
        favoritePlayer
      );

      alert(
        `${player.name} added to favorites`
      );
    } catch (error) {
      alert(error.message);
    }
  }


  if (loading) {
    return (
      <div className="page-container">
        <h1>
          Loading team details...
        </h1>
      </div>
    );
  }


  if (error) {
    return (
      <div className="page-container">
        <h1>
          Team Details
        </h1>

        <p>
          {error}
        </p>
      </div>
    );
  }


  if (
    !team ||
    !selectedEdition
  ) {
    return (
      <div className="page-container">
        <h1>
          Team not found
        </h1>
      </div>
    );
  }


  const flagUrl =
    getFlagUrl(
      canonicalName
    );


  const championshipStars =
    titleYears.length > 0
      ? "★".repeat(
          titleYears.length
        )
      : "";


  const squad =
    team.squad || {};


  const squadGroups = [
    {
      key: "goalkeepers",
      title: "Goalkeepers",
    },
    {
      key: "defenders",
      title: "Defenders",
    },
    {
      key: "midfielders",
      title: "Midfielders",
    },
    {
      key: "forwards",
      title: "Forwards",
    },
  ];


  const showingHistoricalIdentity =
    selectedIdentityName &&
    selectedIdentityName !==
      canonicalName;


  return (
    <div className="page-container">
      <Link
        to="/teams"
        className="team-details-back-link"
      >
        ← Back to Teams
      </Link>


      <section className="team-details-header">
        {flagUrl && (
          <img
            src={flagUrl}
            alt={`${canonicalName} flag`}
            className="team-details-flag"
          />
        )}


        <div>
          <h1>
            {canonicalName}
          </h1>


          {showingHistoricalIdentity && (
            <p className="historical-identity-note">
              Competed as{" "}
              <strong>
                {selectedIdentityName}
              </strong>{" "}
              in{" "}
              {
                selectedEdition.year
              }
            </p>
          )}


          {championshipStars && (
            <div
              className="championship-stars team-details-stars"
              title={
                `${titleYears.length} ` +
                "World Cup championships"
              }
              aria-label={
                `${titleYears.length} ` +
                "World Cup championships"
              }
            >
              {
                championshipStars
              }
            </div>
          )}


          <p className="team-title-years">
            <strong>
              World Cup titles:
            </strong>{" "}

            {titleYears.length > 0
              ? titleYears.join(", ")
              : "None"}
          </p>
        </div>
      </section>


      <section className="team-records-grid">
        <div className="team-record-card">
          <span>
            All-Time Top Scorer
          </span>

          <strong>
            {allTimeTopScorer
              ?.name ||
              "Not available"}
          </strong>

          {allTimeTopScorer && (
            <p>
              {
                allTimeTopScorer
                  .goals
              }{" "}
              {allTimeTopScorer
                .goals === 1
                ? "goal"
                : "goals"}
            </p>
          )}
        </div>


        <div className="team-record-card">
          <span>
            Most World Cup
            Appearances
          </span>

          <strong>
            {allTimeAppearanceLeader
              ?.name ||
              "Not available"}
          </strong>

          {allTimeAppearanceLeader && (
            <p>
              {
                allTimeAppearanceLeader
                  .appearances
              }{" "}
              appearances
            </p>
          )}
        </div>
      </section>


      <section className="team-edition-section">
        <div className="team-edition-header">
          <div>
            <h2>
              World Cup Squad
            </h2>

            <p>
              Select a tournament
              and historical identity
              to view the squad for
              that edition.
            </p>
          </div>


          <select
            value={
              `${selectedEdition.year}` +
              `|${selectedEdition.teamId}`
            }
            onChange={
              handleTournamentChange
            }
            className="filter-select"
          >
            {editionOptions.map(
              (option) => (
                <option
                  key={
                    `${option.year}-` +
                    `${option.teamId}`
                  }
                  value={
                    `${option.year}|` +
                    `${option.teamId}`
                  }
                >
                  {
                    option.label
                  }
                </option>
              )
            )}
          </select>
        </div>


        {!team.squad ? (
          <div className="team-squad-empty">
            <h3>
              Squad data not
              available
            </h3>

            <p>
              We do not currently
              have squad data for
              the{" "}
              {
                selectedEdition.year
              }{" "}
              World Cup.
            </p>
          </div>
        ) : (
          <div className="team-squad-sections">
            {squadGroups.map(
              (group) => {
                const players =
                  squad[
                    group.key
                  ] || [];

                if (
                  players.length ===
                  0
                ) {
                  return null;
                }

                return (
                  <section
                    key={
                      group.key
                    }
                    className="team-squad-group"
                  >
                    <h3>
                      {
                        group.title
                      }
                    </h3>


                    <div className="card-grid">
                      {players.map(
                        (player) => (
                          <div
                            className="card player-squad-card"
                            key={
                              player.playerId
                            }
                          >
                            <div className="player-squad-number">
                              {formatJerseyNumber(
                                player.jerseyNumber
                              )}
                            </div>


                            <h4>
                              {
                                player.name
                              }
                            </h4>


                            {player.position && (
                              <p className="player-squad-position">
                                {
                                  player.position
                                }
                              </p>
                            )}


                            {player.dateOfBirth && (
                              <p className="player-squad-dob">
                                <strong>
                                  Born:
                                </strong>{" "}
                                {new Date(
                                  `${player.dateOfBirth}T00:00:00`
                                ).toLocaleDateString(
                                  undefined,
                                  {
                                    year:
                                      "numeric",
                                    month:
                                      "short",
                                    day:
                                      "numeric",
                                  }
                                )}
                              </p>
                            )}


                            <button
                              type="button"
                              onClick={() =>
                                handleAddPlayerFavorite(
                                  player
                                )
                              }
                            >
                              Add Player to Favorites
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </section>
                );
              }
            )}
          </div>
        )}
      </section>
    </div>
  );
}


export default TeamDetails;