import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  getPlatformTeams,
  getPlatformTournament,
} from "../services/platformApi";


function WorldCup2026() {
  const [groups, setGroups] =
    useState([]);

  const [matches, setMatches] =
    useState([]);

  const [platformTeams, setPlatformTeams] =
    useState([]);

  const [selectedSection, setSelectedSection] =
    useState("groups");

  const [selectedGroup, setSelectedGroup] =
    useState("GROUP_A");

  const [
    selectedKnockoutStage,
    setSelectedKnockoutStage,
  ] = useState("LAST_32");

  const [loading, setLoading] =
    useState(true);

  const [tournamentData, setTournamentData] =
    useState(null);

  useEffect(() => {
    async function loadTournament() {
      try {
        const [
          groupsResponse,
          matchesResponse,
          teamsData,
          tournament,
        ] = await Promise.all([
          fetch(
            `${import.meta.env.VITE_API_BASE_URL}/world-cup-2026/groups`
          ),

          fetch(
            `${import.meta.env.VITE_API_BASE_URL}/matches`
          ),

          getPlatformTeams(2026),

          getPlatformTournament(2026),
        ]);


        const groupsData =
          await groupsResponse.json();

        const matchesData =
          await matchesResponse.json();


        if (!groupsResponse.ok) {
          throw new Error(
            "Failed to load 2026 groups"
          );
        }


        if (!matchesResponse.ok) {
          throw new Error(
            "Failed to load 2026 matches"
          );
        }


        if (Array.isArray(groupsData)) {
          setGroups(groupsData);
        } else {
          console.error(
            "Unexpected 2026 groups response:",
            groupsData
          );

          setGroups([]);
        }


        if (Array.isArray(matchesData)) {
          setMatches(matchesData);
        } else if (
          Array.isArray(matchesData?.matches)
        ) {
          setMatches(matchesData.matches);
        } else {
          console.error(
            "Unexpected /matches response:",
            matchesData
          );

          setMatches([]);
        }


        setPlatformTeams(
          Array.isArray(teamsData)
            ? teamsData
            : []
        );

        setTournamentData(
          tournament
        );
      } catch (error) {
        console.error(
          "2026 tournament API error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }


    loadTournament();
  }, []);


  const knockoutStages = [
    {
      key: "LAST_32",
      label: "Round of 32",
    },

    {
      key: "LAST_16",
      label: "Round of 16",
    },

    {
      key: "QUARTER_FINALS",
      label: "Quarterfinals",
    },

    {
      key: "SEMI_FINALS",
      label: "Semifinals",
    },

    {
      key: "THIRD_PLACE",
      label: "Third Place",
    },

    {
      key: "FINAL",
      label: "Final",
    },
  ];


  const activeGroup =
    groups.find(
      (group) =>
        group.group === selectedGroup
    );


    const knockoutMatches =
      useMemo(() => {
        if (!Array.isArray(matches)) {
          return [];
        }

        return matches.filter(
          (match) =>
            match.stage ===
            selectedKnockoutStage
        );
      }, [
        matches,
        selectedKnockoutStage,
      ]);
  /*
   * Rank all 12 third-place teams.
   *
   * The first eight advance to the
   * Round of 32.
   */
  const bestThirdPlaceTeams =
    useMemo(() => {
      const thirdPlaceTeams =
        groups
          .map((group) => {
            const team =
              group.standings?.find(
                (standing) =>
                  standing.position === 3
              );

            if (!team) {
              return null;
            }

            return {
              ...team,
              group: group.group,
            };
          })
          .filter(Boolean);


      return [...thirdPlaceTeams]
        .sort((a, b) => {
          /*
           * 1. Points
           */
          if (b.points !== a.points) {
            return b.points - a.points;
          }


          /*
           * 2. Goal difference
           */
          if (
            b.goalDifference !==
            a.goalDifference
          ) {
            return (
              b.goalDifference -
              a.goalDifference
            );
          }


          /*
           * 3. Goals scored
           */
          if (
            b.goalsFor !==
            a.goalsFor
          ) {
            return (
              b.goalsFor -
              a.goalsFor
            );
          }


          /*
           * 4. Wins
           */
          if (b.wins !== a.wins) {
            return b.wins - a.wins;
          }


          /*
           * Stable fallback.
           */
          return a.team.localeCompare(
            b.team
          );
        })
        .slice(0, 8);
    }, [groups]);


  const qualifiedThirdPlaceNames =
    useMemo(() => {
      return new Set(
        bestThirdPlaceTeams.map(
          (team) => team.team
        )
      );
    }, [bestThirdPlaceTeams]);


  function isQualified(team) {
    /*
     * First and second place
     * automatically qualify.
     */
    if (
      team.position === 1 ||
      team.position === 2
    ) {
      return true;
    }


    /*
     * Third place only qualifies
     * if the team is among the
     * eight best third-place teams.
     */
    if (
      team.position === 3 &&
      qualifiedThirdPlaceNames.has(
        team.team
      )
    ) {
      return true;
    }


    return false;
  }


  function normalizeTeamName(teamName) {
    const aliases = {
      Czechia:
        "Czech Republic",

      "Bosnia-Herzegovina":
        "Bosnia and Herzegovina",

      "Bosnia & Herzegovina":
        "Bosnia and Herzegovina",

      "Cape Verde":
        "Cape Verde Islands",

      "DR Congo":
        "Congo DR",

      "Korea Republic":
        "South Korea",

      "Korea DPR":
        "North Korea",

      USA:
        "United States",
    };


    return (
      aliases[teamName] ||
      teamName
    );
  }


  function findPlatformTeam(
    teamName
  ) {
    const normalizedName =
      normalizeTeamName(teamName);


    return platformTeams.find(
      (team) =>
        team.name ===
        normalizedName
    );
  }


  function getTeamDetailsUrl(
    teamName
  ) {
    const team =
      findPlatformTeam(teamName);


    if (!team) {
      return null;
    }


    return (
      `/teams/${team.teamId}` +
      "?year=2026"
    );
  }


  function renderTeamLink(
    teamName,
    className = ""
  ) {
    const url =
      getTeamDetailsUrl(
        teamName
      );


    if (!url) {
      return (
        <span className={className}>
          {teamName}
        </span>
      );
    }


    return (
      <Link
        to={url}
        className={
          `world-cup-team-link ${className}`.trim()
        }
      >
        {teamName}
      </Link>
    );
  }


  function formatGroupName(
    groupName
  ) {
    return groupName.replace(
      "GROUP_",
      "Group "
    );
  }


  function formatDate(date) {
    return new Date(
      date
    ).toLocaleDateString();
  }


  if (loading) {
    return (
      <div className="page-container">
        <h1>
          Loading 2026 World Cup...
        </h1>
      </div>
    );
  }

  function getAwardDisplayName(award) {
    if (
      award.award === "Golden Boot" &&
      award.goals
    ) {
      return `${award.player} · ${award.goals} goals`;
    }

    return award.player;
  }

  return (
    <div className="page-container">
      <section className="tournament-hero">
        <h1>
          2026 FIFA World Cup
        </h1>


        <p className="world-cup-subtitle">
          {tournamentData?.hosts?.length
            ? tournamentData.hosts.join(" • ")
            : "United States • Canada • Mexico"}
        </p>


      <div className="tournament-summary">
        <div>
          <span>
            Champion
          </span>

          <strong>
            {tournamentData?.champion?.name ||
              "Spain"}
          </strong>
        </div>


        <div>
          <span>
            Runner-up
          </span>

          <strong>
            {tournamentData?.runnerUp?.name ||
              "Argentina"}
          </strong>
        </div>


        <div>
          <span>
            Third Place
          </span>

          <strong>
            {tournamentData?.thirdPlace?.name ||
              "England"}
          </strong>
        </div>


        <div>
          <span>
            Matches
          </span>

          <strong>
            {tournamentData?.matchCount ??
              (matches.length > 0
                ? matches.length
                : 104)}
          </strong>
        </div>
      </div>

        <div className="tournament-format">
          <span>
            Tournament Format
          </span>


          <p>
            48 teams were divided into
            12 groups of four. The top
            two teams from each group
            and the eight best
            third-place teams advanced
            to the Round of 32, followed
            by a single-elimination
            knockout stage through the
            final.
          </p>
        </div>

        {tournamentData?.awards?.length > 0 && (
          <div className="tournament-awards-section">
            <span className="tournament-awards-label">
              Individual Awards
            </span>

            <div className="tournament-awards-grid">
              {tournamentData.awards.map(
                (award) => (
                  <div
                    className="tournament-award-card"
                    key={award.award}
                  >
                    <span className="tournament-award-title">
                      {award.award}
                    </span>

                    <strong>
                      {getAwardDisplayName(
                        award
                      )}
                    </strong>

                    <span className="tournament-award-team">
                      {award.team}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </section>


      <div className="stage-tabs">
        <button
          className={
            selectedSection ===
            "groups"
              ? "stage-tab active"
              : "stage-tab"
          }
          onClick={() =>
            setSelectedSection(
              "groups"
            )
          }
        >
          Group Stage
        </button>


        <button
          className={
            selectedSection ===
            "knockout"
              ? "stage-tab active"
              : "stage-tab"
          }
          onClick={() =>
            setSelectedSection(
              "knockout"
            )
          }
        >
          Knockout Stage
        </button>
      </div>


      {selectedSection ===
        "groups" && (
        <>
          <div className="group-tabs">
            {groups.map(
              (group) => (
                <button
                  key={
                    group.group
                  }
                  className={
                    selectedGroup ===
                    group.group
                      ? "group-tab active"
                      : "group-tab"
                  }
                  onClick={() =>
                    setSelectedGroup(
                      group.group
                    )
                  }
                >
                  {formatGroupName(
                    group.group
                  )}
                </button>
              )
            )}
          </div>


          {activeGroup && (
            <div className="group-detail-layout">
              <section className="group-section">
                <h2>
                  {formatGroupName(
                    activeGroup.group
                  )}{" "}
                  Standings
                </h2>


                <div className="standings-wrapper">
                  <table className="standings-table">
                    <thead>
                      <tr>
                        <th>Pos</th>
                        <th>Team</th>
                        <th>P</th>
                        <th>W</th>
                        <th>D</th>
                        <th>L</th>
                        <th>GF</th>
                        <th>GA</th>
                        <th>GD</th>
                        <th>Pts</th>
                      </tr>
                    </thead>


                    <tbody>
                      {activeGroup.standings.map(
                        (team) => (
                          <tr
                            key={
                              team.team
                            }
                            className={
                              isQualified(team)
                                ? "qualified-team-row"
                                : ""
                            }
                          >
                            <td>
                              {
                                team.position
                              }
                            </td>


                            <td className="standings-team">
                              <img
                                src={
                                  team.crest
                                }
                                alt={`${team.team} flag`}
                                className="standings-crest"
                              />


                              {renderTeamLink(
                                team.team
                              )}


                              {isQualified(
                                team
                              ) && (
                                <span
                                  className="qualified-marker"
                                  title="Qualified for the Round of 32"
                                >
                                  Q
                                </span>
                              )}
                            </td>


                            <td>
                              {
                                team.played
                              }
                            </td>

                            <td>
                              {
                                team.wins
                              }
                            </td>

                            <td>
                              {
                                team.draws
                              }
                            </td>

                            <td>
                              {
                                team.losses
                              }
                            </td>

                            <td>
                              {
                                team.goalsFor
                              }
                            </td>

                            <td>
                              {
                                team.goalsAgainst
                              }
                            </td>


                            <td>
                              {team.goalDifference >
                              0
                                ? `+${team.goalDifference}`
                                : team.goalDifference}
                            </td>


                            <td>
                              <strong>
                                {
                                  team.points
                                }
                              </strong>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>


                <div className="qualification-legend">
                  <span className="qualification-legend-box" />

                  <span>
                    Qualified for the
                    Round of 32
                  </span>
                </div>
              </section>


              <section className="group-section">
                <h2>
                  {formatGroupName(
                    activeGroup.group
                  )}{" "}
                  Matches
                </h2>


                <div className="group-match-list">
                  {activeGroup.matches.map(
                    (match) => (
                      <div
                        className="group-match"
                        key={
                          match.id
                        }
                      >
                        {renderTeamLink(
                          match.homeTeam
                        )}


                        <strong>
                          {
                            match.homeScore
                          }{" "}
                          -{" "}
                          {
                            match.awayScore
                          }
                        </strong>


                        {renderTeamLink(
                          match.awayTeam
                        )}
                      </div>
                    )
                  )}
                </div>
              </section>
            </div>
          )}
        </>
      )}


      {selectedSection ===
        "knockout" && (
        <>
          <div className="group-tabs">
            {knockoutStages.map(
              (stage) => (
                <button
                  key={
                    stage.key
                  }
                  className={
                    selectedKnockoutStage ===
                    stage.key
                      ? "group-tab active"
                      : "group-tab"
                  }
                  onClick={() =>
                    setSelectedKnockoutStage(
                      stage.key
                    )
                  }
                >
                  {
                    stage.label
                  }
                </button>
              )
            )}
          </div>


          <section className="tournament-stage">
            <h2>
              {
                knockoutStages.find(
                  (stage) =>
                    stage.key ===
                    selectedKnockoutStage
                )?.label
              }
            </h2>


            <div className="card-grid">
              {knockoutMatches.map(
                (match) => (
                  <div
                    className="match-card"
                    key={
                      match.id
                    }
                  >
                    <div className="match-teams">
                      <div className="match-team">
                        <img
                          src={
                            match.homeCrest
                          }
                          alt={`${match.homeTeam} flag`}
                          className="standings-crest"
                        />


                        <strong>
                          {renderTeamLink(
                            match.homeTeam
                          )}
                        </strong>
                      </div>


                      <div className="match-score">
                        {
                          match.score
                            ?.fullTime
                            ?.home
                        }{" "}
                        -{" "}
                        {
                          match.score
                            ?.fullTime
                            ?.away
                        }
                      </div>


                      <div className="match-team">
                        <img
                          src={
                            match.awayCrest
                          }
                          alt={`${match.awayTeam} flag`}
                          className="standings-crest"
                        />


                        <strong>
                          {renderTeamLink(
                            match.awayTeam
                          )}
                        </strong>
                      </div>
                    </div>


                    <p>
                      <strong>
                        Date:
                      </strong>{" "}
                      {formatDate(
                        match.utcDate
                      )}
                    </p>


                    {match.score
                      ?.duration ===
                      "EXTRA_TIME" && (
                      <p>
                        <strong>
                          After Extra Time
                        </strong>
                      </p>
                    )}


                    {match.score
                      ?.penalties && (
                      <p>
                        <strong>
                          Penalties:
                        </strong>{" "}
                        {
                          match.score
                            .penalties
                            .home
                        }{" "}
                        -{" "}
                        {
                          match.score
                            .penalties
                            .away
                        }
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}


export default WorldCup2026;