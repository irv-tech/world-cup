import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getPlatformTournament,
} from "../services/platformApi";


function TournamentHistory() {
  const { year } = useParams();

  const [matches, setMatches] =
    useState([]);

  const [standings, setStandings] =
    useState([]);

  const [tournament, setTournament] =
    useState(null);

  const [
    platformTournament,
    setPlatformTournament,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  /*
   * Primary navigation:
   *
   * group
   * knockout
   */
  const [
    selectedSection,
    setSelectedSection,
  ] = useState("group");

  /*
   * Historical tournaments can contain
   * more than one standings-based stage.
   *
   * Examples:
   * - First Round
   * - Second Group Stage
   * - Final Round
   */
  const [
    selectedStandingStage,
    setSelectedStandingStage,
  ] = useState("");

  const [
    selectedKnockoutStage,
    setSelectedKnockoutStage,
  ] = useState("");

  const [
    selectedGroup,
    setSelectedGroup,
  ] = useState("");


  useEffect(() => {
    async function loadTournament() {
      setLoading(true);

      try {
        const [
          matchesResponse,
          historyResponse,
          standingsResponse,
          platformData,
        ] = await Promise.all([
          fetch(
            `${import.meta.env.VITE_API_BASE_URL}/history/${year}/matches`
          ),

          fetch(
            `${import.meta.env.VITE_API_BASE_URL}/history`
          ),

          fetch(
            `${import.meta.env.VITE_API_BASE_URL}/history/${year}/groups`
          ),

          getPlatformTournament(year),
        ]);


        const matchesData =
          await matchesResponse.json();

        const historyData =
          await historyResponse.json();

        const standingsData =
          await standingsResponse.json();


        if (!matchesResponse.ok) {
          throw new Error(
            `Failed to load ${year} World Cup matches`
          );
        }


        if (!historyResponse.ok) {
          throw new Error(
            "Failed to load World Cup history"
          );
        }


        if (!standingsResponse.ok) {
          throw new Error(
            `Failed to load ${year} group standings`
          );
        }


        const selectedTournament =
          historyData.find(
            (cup) =>
              String(cup.year) ===
              String(year)
          );


        setMatches(matchesData);
        setStandings(standingsData);

        setTournament(
          selectedTournament ||
          null
        );

        setPlatformTournament(
          platformData ||
          null
        );
      } catch (error) {
        console.error(
          "Tournament history API error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }


    loadTournament();
  }, [year]);


  function formatStageName(
    stageName
  ) {
    if (!stageName) {
      return "Other";
    }


    const knownNames = {
      groupstage:
        "Group Stage",

      "group stage":
        "Group Stage",

      "first group stage":
        "First Group Stage",

      "second group stage":
        "Second Group Stage",

      "first round":
        "First Round",

      "second round":
        "Second Round",

      "final round":
        "Final Round",

      "round of 32":
        "Round of 32",

      "round of 16":
        "Round of 16",

      quarterfinals:
        "Quarterfinals",

      quarterfinal:
        "Quarterfinals",

      semifinals:
        "Semifinals",

      semifinal:
        "Semifinals",

      "third place":
        "Third Place",

      "third-place":
        "Third Place",

      final:
        "Final",
    };


    const normalized =
      stageName.toLowerCase();


    if (knownNames[normalized]) {
      return knownNames[
        normalized
      ];
    }


    return stageName
      .split(" ")
      .map(
        (word) =>
          word
            .charAt(0)
            .toUpperCase() +
          word
            .slice(1)
            .toLowerCase()
      )
      .join(" ");
  }


  /*
   * Build every standings-based stage.
   *
   * This preserves special historical
   * formats instead of assuming one
   * modern group stage.
   */
  const standingsStages =
    useMemo(() => {
      const stages = {};


      standings.forEach(
        (row) => {
          const stageNumber =
            row.stage_number ??
            1;

          const stageName =
            row.stage_name ||
            "Group Stage";

          const stageLabel =
            formatStageName(
              stageName
            );

          const key =
            `${stageNumber}-${stageLabel}`;


          if (!stages[key]) {
            stages[key] = {
              key,
              stageNumber,
              stageName,
              stageLabel,
              groups: {},
            };
          }


          const groupName =
            row.group_name ||
            "Standings";


          if (
            !stages[key]
              .groups[groupName]
          ) {
            stages[key]
              .groups[groupName] = [];
          }


          stages[key]
            .groups[groupName]
            .push(row);
        }
      );


      Object.values(
        stages
      ).forEach(
        (stage) => {
          Object.values(
            stage.groups
          ).forEach(
            (rows) => {
              rows.sort(
                (a, b) =>
                  a.position -
                  b.position
              );
            }
          );
        }
      );


      return Object.values(
        stages
      ).sort(
        (a, b) =>
          a.stageNumber -
          b.stageNumber
      );
    }, [standings]);


  function normalizeMatchStageForStandings(
    matchStage,
    standingStage
  ) {
    if (
      standingStage ===
        "first group stage" &&
      matchStage ===
        "group stage"
    ) {
      return true;
    }


    return (
      matchStage ===
      standingStage
    );
  }


  /*
   * Some historical datasets use
   * different group labels between
   * standings and matches.
   */
  function mapHistoricalGroupName(
    stageName,
    groupName
  ) {
    if (
      String(year) ===
        "1982" &&
      stageName ===
        "second group stage"
    ) {
      const groupMap = {
        "Group 1":
          "Group A",

        "Group 2":
          "Group B",

        "Group 3":
          "Group C",

        "Group 4":
          "Group D",
      };


      return (
        groupMap[groupName] ||
        groupName
      );
    }


    return groupName;
  }


  /*
   * Matches that are NOT represented
   * by a standings stage become
   * knockout-stage tabs.
   */
  const nonStandingStages =
    useMemo(() => {
      const stages = {};


      matches.forEach(
        (match) => {
          const rawStage =
            match.stage_name
              ?.toLowerCase() ||
            "";

          const label =
            formatStageName(
              match.stage_name
            );


          const belongsToStandingStage =
            standingsStages.some(
              (stage) => {
                const standingName =
                  stage.stageName
                    .toLowerCase();


                if (
                  standingName ===
                    "group stage" ||
                  standingName ===
                    "first round"
                ) {
                  return [
                    "groupstage",
                    "group stage",
                    "first round",
                  ].includes(
                    rawStage
                  );
                }


                return (
                  normalizeMatchStageForStandings(
                    rawStage,
                    standingName
                  )
                );
              }
            );


          if (
            belongsToStandingStage
          ) {
            return;
          }


          if (!stages[label]) {
            stages[label] = [];
          }


          stages[label].push(
            match
          );
        }
      );


      return stages;
    }, [
      matches,
      standingsStages,
    ]);


  const knockoutStageLabels =
    useMemo(() => {
      const order = [
        "Round of 32",
        "Round of 16",
        "Quarterfinals",
        "Semifinals",
        "Third Place",
        "Final",
      ];


      return Object.keys(
        nonStandingStages
      ).sort(
        (a, b) => {
          const aIndex =
            order.indexOf(a);

          const bIndex =
            order.indexOf(b);


          if (
            aIndex !== -1 &&
            bIndex !== -1
          ) {
            return (
              aIndex -
              bIndex
            );
          }


          if (aIndex !== -1) {
            return -1;
          }


          if (bIndex !== -1) {
            return 1;
          }


          return a.localeCompare(
            b
          );
        }
      );
    }, [nonStandingStages]);


  const hasGroupSection =
    standingsStages.length > 0;

  const hasKnockoutSection =
    knockoutStageLabels.length >
    0;


  /*
   * Reset navigation whenever the
   * tournament changes.
   */
  useEffect(() => {
    if (hasGroupSection) {
      setSelectedSection(
        "group"
      );
    } else if (
      hasKnockoutSection
    ) {
      setSelectedSection(
        "knockout"
      );
    }
  }, [
    year,
    hasGroupSection,
    hasKnockoutSection,
  ]);


  useEffect(() => {
    if (
      standingsStages.length ===
      0
    ) {
      setSelectedStandingStage(
        ""
      );

      return;
    }


    const stillExists =
      standingsStages.some(
        (stage) =>
          stage.key ===
          selectedStandingStage
      );


    if (!stillExists) {
      setSelectedStandingStage(
        standingsStages[0].key
      );
    }
  }, [
    standingsStages,
    selectedStandingStage,
  ]);


  const activeStandingStage =
    standingsStages.find(
      (stage) =>
        stage.key ===
        selectedStandingStage
    );


  useEffect(() => {
    if (!activeStandingStage) {
      setSelectedGroup("");
      return;
    }


    const groups =
      Object.keys(
        activeStandingStage.groups
      );


    if (
      !groups.includes(
        selectedGroup
      )
    ) {
      setSelectedGroup(
        groups[0] ||
        ""
      );
    }
  }, [
    activeStandingStage,
    selectedGroup,
  ]);


  useEffect(() => {
    if (
      knockoutStageLabels
        .length === 0
    ) {
      setSelectedKnockoutStage(
        ""
      );

      return;
    }


    if (
      !knockoutStageLabels.includes(
        selectedKnockoutStage
      )
    ) {
      setSelectedKnockoutStage(
        knockoutStageLabels[0]
      );
    }
  }, [
    knockoutStageLabels,
    selectedKnockoutStage,
  ]);


  function getMatchesForSelectedGroup() {
    if (
      !activeStandingStage ||
      !selectedGroup
    ) {
      return [];
    }


    const standingStage =
      activeStandingStage
        .stageName
        .toLowerCase();


    return matches.filter(
      (match) => {
        const matchStage =
          match.stage_name
            ?.toLowerCase() ||
          "";

        const rawMatchGroup =
          match.group_name ||
          "";

        const mappedMatchGroup =
          mapHistoricalGroupName(
            standingStage,
            rawMatchGroup
          );


        if (
          standingStage ===
            "group stage" ||
          standingStage ===
            "first round"
        ) {
          return (
            [
              "groupstage",
              "group stage",
              "first round",
            ].includes(
              matchStage
            ) &&
            mappedMatchGroup ===
              selectedGroup
          );
        }


        if (
          standingStage ===
          "first group stage"
        ) {
          return (
            matchStage ===
              "group stage" &&
            mappedMatchGroup ===
              selectedGroup
          );
        }


        if (
          standingStage ===
          "second group stage"
        ) {
          return (
            matchStage ===
              "second group stage" &&
            mappedMatchGroup ===
              selectedGroup
          );
        }


        if (
          standingStage ===
          "final round"
        ) {
          return (
            matchStage ===
            "final round"
          );
        }


        return (
          matchStage ===
            standingStage &&
          (
            mappedMatchGroup ===
              selectedGroup ||
            rawMatchGroup ===
              "not applicable" ||
            !rawMatchGroup
          )
        );
      }
    );
  }


  /*
   * Resolve a historical team to its
   * exact tournament identity in the
   * unified platform data.
   */
  function findTournamentTeam(
    teamName
  ) {
    if (
      !teamName ||
      !platformTournament
        ?.teams
    ) {
      return null;
    }


    const exactMatch =
      platformTournament
        .teams
        .find(
          (team) =>
            team.name ===
            teamName
        );


    if (exactMatch) {
      return exactMatch;
    }


    /*
     * Only normalize naming differences.
     * Historical identities such as
     * West Germany and Soviet Union are
     * intentionally NOT canonicalized.
     */
    const aliases = {
      USA:
        "United States",

      Czechia:
        "Czech Republic",

      "Bosnia-Herzegovina":
        "Bosnia and Herzegovina",
    };


    const normalizedName =
      aliases[teamName] ||
      teamName;


    return (
      platformTournament
        .teams
        .find(
          (team) =>
            team.name ===
            normalizedName
        ) ||
      null
    );
  }


  function getHistoricalTeamUrl(
    teamName
  ) {
    const team =
      findTournamentTeam(
        teamName
      );


    if (!team) {
      return null;
    }


    return (
      `/teams/${team.teamId}` +
      `?year=${year}` +
      `&identity=${team.teamId}`
    );
  }


  function renderHistoricalTeamLink(
    teamName
  ) {
    const url =
      getHistoricalTeamUrl(
        teamName
      );


    if (!url) {
      return (
        <span>
          {teamName}
        </span>
      );
    }


    return (
      <Link
        to={url}
        className="world-cup-team-link"
      >
        {teamName}
      </Link>
    );
  }


  function getHistoricalFlagUrl(
    teamName
  ) {
    const countryCodes = {
      Algeria: "dz",
      Angola: "ao",
      Argentina: "ar",
      Australia: "au",
      Austria: "at",
      Belgium: "be",
      Bolivia: "bo",
      Brazil: "br",
      Bulgaria: "bg",
      Cameroon: "cm",
      Canada: "ca",
      Chile: "cl",
      China: "cn",
      Colombia: "co",
      "Costa Rica": "cr",
      Croatia: "hr",
      Cuba: "cu",
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
      Jamaica: "jm",
      Japan: "jp",
      Kuwait: "kw",
      Mexico: "mx",
      Morocco: "ma",
      Netherlands: "nl",
      "New Zealand": "nz",
      Nigeria: "ng",
      "North Korea": "kp",
      Norway: "no",
      Panama: "pa",
      Paraguay: "py",
      Peru: "pe",
      Poland: "pl",
      Portugal: "pt",
      Qatar: "qa",
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
      Tunisia: "tn",
      Turkey: "tr",
      Ukraine: "ua",
      Uruguay: "uy",
      "United States": "us",
      USA: "us",
      Wales: "gb-wls",
      "Ivory Coast": "ci",
      "Bosnia and Herzegovina": "ba",
      "Trinidad and Tobago": "tt",
      "Serbia and Montenegro": "rs",
      "Czech Republic": "cz",
      "Republic of Ireland": "ie",
      "United Arab Emirates": "ae",
      "Northern Ireland": "gb-nir",
      Zaire: "cd",

      /*
       * Historical visual fallbacks.
       */
      "West Germany": "de",
      "East Germany": "de",
      Czechoslovakia: "cz",
      Yugoslavia: "rs",
      "Soviet Union": "ru",
      "Dutch East Indies": "id",
    };


    const code =
      countryCodes[
        teamName
      ];


    if (!code) {
      return null;
    }


    return (
      `https://flagcdn.com/${code}.svg`
    );
  }


  /*
   * Keep the historical award name as
   * stored by the source, but surface
   * the major individual awards in the
   * tournament summary.
   */
  const featuredAwards =
    useMemo(() => {
      const awards =
        platformTournament
          ?.awards ||
        [];


      function awardPriority(
        award
      ) {
        const name =
          (
            award.award ||
            ""
          ).toLowerCase();


        if (
          name.includes(
            "golden ball"
          )
        ) {
          return 1;
        }


        if (
          name.includes(
            "golden boot"
          ) ||
          name.includes(
            "golden shoe"
          )
        ) {
          return 2;
        }


        if (
          name.includes(
            "golden glove"
          ) ||
          name.includes(
            "yashin"
          ) ||
          name.includes(
            "goalkeeper"
          )
        ) {
          return 3;
        }


        if (
          name.includes(
            "young player"
          )
        ) {
          return 4;
        }


        return 99;
      }


      return awards
        .filter(
          (award) =>
            awardPriority(
              award
            ) < 99
        )
        .sort(
          (a, b) =>
            awardPriority(a) -
            awardPriority(b)
        );
    }, [platformTournament]);


  if (loading) {
    return (
      <div className="page-container">
        <h1>
          Loading {year} World Cup...
        </h1>
      </div>
    );
  }


  const selectedGroupRows =
    activeStandingStage &&
    selectedGroup
      ? activeStandingStage
          .groups[
            selectedGroup
          ] || []
      : [];


  const selectedGroupMatches =
    getMatchesForSelectedGroup();


  const selectedKnockoutMatches =
    selectedKnockoutStage
      ? nonStandingStages[
          selectedKnockoutStage
        ] || []
      : [];


  return (
    <div className="page-container">
      <Link
        to="/history"
        className="history-back-link"
      >
        ← Back to World Cup History
      </Link>


      <section className="tournament-hero">
        <h1>
          {tournament
            ? `${tournament.host} ${year}`
            : `${year} FIFA World Cup`}
        </h1>


        <p>
          FIFA World Cup
        </p>


        {tournament && (
          <>
            <div className="tournament-summary">
              <div>
                <span>
                  Champion
                </span>

                <strong>
                  {
                    tournament.champion
                  }
                </strong>
              </div>


              <div>
                <span>
                  Runner-up
                </span>

                <strong>
                  {
                    tournament.runnerUp
                  }
                </strong>
              </div>


              <div>
                <span>
                  Third Place
                </span>

                <strong>
                  {
                    tournament.thirdPlace
                  }
                </strong>
              </div>


              <div>
                <span>
                  Matches
                </span>

                <strong>
                  {matches.length}
                </strong>
              </div>
            </div>


            {tournament.format && (
              <div className="tournament-format">
                <span>
                  Tournament Format
                </span>

                <p>
                  {
                    tournament.format
                  }
                </p>
              </div>
            )}


            {featuredAwards.length >
              0 && (
              <div className="tournament-awards-section">
                <span className="tournament-awards-label">
                  Individual Awards
                </span>


                <div className="tournament-awards-grid">
                  {featuredAwards.map(
                    (
                      award,
                      index
                    ) => (
                      <div
                        className="tournament-award-card"
                        key={
                          `${award.award}-${award.player}-${index}`
                        }
                      >
                        <span className="tournament-award-title">
                          {
                            award.award
                          }
                        </span>


                        <strong>
                          {award.player}

                          {award.goals != null &&
                            ` · ${award.goals} goals`}
                        </strong>


                        {award.team && (
                          <span className="tournament-award-team">
                            {
                              award.team
                            }
                          </span>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </section>


      {(hasGroupSection ||
        hasKnockoutSection) && (
        <div className="stage-tabs">
          {hasGroupSection && (
            <button
              className={
                selectedSection ===
                "group"
                  ? "stage-tab active"
                  : "stage-tab"
              }
              onClick={() =>
                setSelectedSection(
                  "group"
                )
              }
            >
              Group Stage
            </button>
          )}


          {hasKnockoutSection && (
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
          )}
        </div>
      )}


      {selectedSection ===
        "group" &&
        activeStandingStage && (
          <>
            {standingsStages.length >
              1 && (
              <div className="group-tabs">
                {standingsStages.map(
                  (stage) => (
                    <button
                      key={
                        stage.key
                      }
                      className={
                        selectedStandingStage ===
                        stage.key
                          ? "group-tab active"
                          : "group-tab"
                      }
                      onClick={() =>
                        setSelectedStandingStage(
                          stage.key
                        )
                      }
                    >
                      {
                        stage.stageLabel
                      }
                    </button>
                  )
                )}
              </div>
            )}


            <div className="group-tabs">
              {Object.keys(
                activeStandingStage
                  .groups
              ).map(
                (groupName) => (
                  <button
                    key={
                      groupName
                    }
                    className={
                      selectedGroup ===
                      groupName
                        ? "group-tab active"
                        : "group-tab"
                    }
                    onClick={() =>
                      setSelectedGroup(
                        groupName
                      )
                    }
                  >
                    {groupName}
                  </button>
                )
              )}
            </div>


            <div className="group-detail-layout">
              <section className="group-section">
                <h2>
                  {selectedGroup} Standings
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
                      {selectedGroupRows.map(
                        (team) => (
                          <tr
                            key={
                              `${activeStandingStage.key}-${team.team_id}`
                            }
                            className={
                              team.advanced ===
                              1
                                ? "advanced-team"
                                : ""
                            }
                          >
                            <td>
                              {
                                team.position
                              }
                            </td>


                            <td className="standings-team">
                              {getHistoricalFlagUrl(
                                team.team_name
                              ) && (
                                <img
                                  src={getHistoricalFlagUrl(
                                    team.team_name
                                  )}
                                  alt={`${team.team_name} flag`}
                                  className="standings-crest"
                                />
                              )}


                              {renderHistoricalTeamLink(
                                team.team_name
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
                                team.goals_for
                              }
                            </td>

                            <td>
                              {
                                team.goals_against
                              }
                            </td>


                            <td>
                              {team.goal_difference >
                              0
                                ? `+${team.goal_difference}`
                                : team.goal_difference}
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
              </section>


              <section className="group-section">
                <h2>
                  {selectedGroup} Matches
                </h2>


                <div className="group-match-list">
                  {selectedGroupMatches.map(
                    (match) => (
                      <div
                        className="group-match"
                        key={
                          match.match_id
                        }
                      >
                        {renderHistoricalTeamLink(
                          match.home_team_name
                        )}


                        <strong>
                          {
                            match.home_team_score
                          }{" "}
                          -{" "}
                          {
                            match.away_team_score
                          }
                        </strong>


                        {renderHistoricalTeamLink(
                          match.away_team_name
                        )}
                      </div>
                    )
                  )}
                </div>
              </section>
            </div>
          </>
        )}


      {selectedSection ===
        "knockout" &&
        hasKnockoutSection && (
          <>
            <div className="group-tabs">
              {knockoutStageLabels.map(
                (stageLabel) => (
                  <button
                    key={
                      stageLabel
                    }
                    className={
                      selectedKnockoutStage ===
                      stageLabel
                        ? "group-tab active"
                        : "group-tab"
                    }
                    onClick={() =>
                      setSelectedKnockoutStage(
                        stageLabel
                      )
                    }
                  >
                    {stageLabel}
                  </button>
                )
              )}
            </div>


            <section className="tournament-stage">
              <h2>
                {
                  selectedKnockoutStage
                }
              </h2>


              <div className="card-grid">
                {selectedKnockoutMatches.map(
                  (match) => (
                    <div
                      className="match-card"
                      key={
                        match.match_id
                      }
                    >
                      <div className="match-teams">
                        <div className="match-team">
                          {getHistoricalFlagUrl(
                            match.home_team_name
                          ) && (
                            <img
                              src={getHistoricalFlagUrl(
                                match.home_team_name
                              )}
                              alt={`${match.home_team_name} flag`}
                              className="standings-crest"
                            />
                          )}


                          <strong>
                            {renderHistoricalTeamLink(
                              match.home_team_name
                            )}
                          </strong>
                        </div>


                        <div className="match-score">
                          {
                            match.home_team_score
                          }{" "}
                          -{" "}
                          {
                            match.away_team_score
                          }
                        </div>


                        <div className="match-team">
                          {getHistoricalFlagUrl(
                            match.away_team_name
                          ) && (
                            <img
                              src={getHistoricalFlagUrl(
                                match.away_team_name
                              )}
                              alt={`${match.away_team_name} flag`}
                              className="standings-crest"
                            />
                          )}


                          <strong>
                            {renderHistoricalTeamLink(
                              match.away_team_name
                            )}
                          </strong>
                        </div>
                      </div>


                      <p>
                        <strong>
                          Date:
                        </strong>{" "}
                        {
                          match.match_date
                        }
                      </p>


                      <p>
                        <strong>
                          Location:
                        </strong>{" "}
                        {
                          match.stadium_name
                        }
                        ,{" "}
                        {
                          match.city_name
                        }
                      </p>


                      {match.extra_time ===
                        1 && (
                        <p>
                          <strong>
                            Extra Time
                          </strong>
                        </p>
                      )}


                      {match.penalty_shootout ===
                        1 && (
                        <p>
                          <strong>
                            Penalties:
                          </strong>{" "}
                          {
                            match.score_penalties
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


export default TournamentHistory;