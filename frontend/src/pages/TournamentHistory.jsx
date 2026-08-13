import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

function TournamentHistory() {
  const { year } = useParams();

  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedStage, setSelectedStage] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");

  useEffect(() => {
    async function loadTournament() {
      try {
        const [matchesResponse, historyResponse, standingsResponse] =
          await Promise.all([
            fetch(
              `${import.meta.env.VITE_API_BASE_URL}/history/${year}/matches`
            ),
            fetch(`${import.meta.env.VITE_API_BASE_URL}/history`),
            fetch(
              `${import.meta.env.VITE_API_BASE_URL}/history/${year}/groups`
            ),
          ]);

        const matchesData = await matchesResponse.json();
        const historyData = await historyResponse.json();
        const standingsData = await standingsResponse.json();

        if (!matchesResponse.ok) {
          throw new Error(`Failed to load ${year} World Cup matches`);
        }

        if (!historyResponse.ok) {
          throw new Error("Failed to load World Cup history");
        }

        if (!standingsResponse.ok) {
          throw new Error(`Failed to load ${year} group standings`);
        }

        setMatches(matchesData);
        setStandings(standingsData);

        const selectedTournament = historyData.find(
          (cup) => String(cup.year) === String(year)
        );

        setTournament(selectedTournament || null);
      } catch (error) {
        console.error("Tournament history API error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTournament();
  }, [year]);

  function formatStageName(stageName) {
    if (!stageName) return "Other";

    const knownNames = {
      groupstage: "Group Stage",
      "group stage": "Group Stage",
      "first round": "First Round",
      "second round": "Second Round",
      "final round": "Final Round",
      "round of 16": "Round of 16",
      quarterfinals: "Quarterfinals",
      quarterfinal: "Quarterfinals",
      semifinals: "Semifinals",
      semifinal: "Semifinals",
      "third place": "Third Place",
      "third-place": "Third Place",
      final: "Final",
    };

    const normalized = stageName.toLowerCase();

    if (knownNames[normalized]) {
      return knownNames[normalized];
    }

    return stageName
      .split(" ")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join(" ");
  }

  const standingsStages = useMemo(() => {
    const stages = {};

    standings.forEach((row) => {
      const stageNumber = row.stage_number ?? 1;
      const stageName = row.stage_name || "Group Stage";
      const stageLabel = formatStageName(stageName);

      const key = `${stageNumber}-${stageLabel}`;

      if (!stages[key]) {
        stages[key] = {
          key,
          stageNumber,
          stageName,
          stageLabel,
          groups: {},
        };
      }

      const groupName = row.group_name || "Standings";

      if (!stages[key].groups[groupName]) {
        stages[key].groups[groupName] = [];
      }

      stages[key].groups[groupName].push(row);
    });

    Object.values(stages).forEach((stage) => {
      Object.values(stage.groups).forEach((rows) => {
        rows.sort((a, b) => a.position - b.position);
      });
    });

    return Object.values(stages).sort(
      (a, b) => a.stageNumber - b.stageNumber
    );
  }, [standings]);

  function normalizeMatchStageForStandings(matchStage, standingStage) {
    if (
      standingStage === "first group stage" &&
      matchStage === "group stage"
    ) {
      return true;
    }

    return matchStage === standingStage;
  }

  function mapHistoricalGroupName(stageName, groupName) {
    if (
      String(year) === "1982" &&
      stageName === "second group stage"
    ) {
      const groupMap = {
        "Group 1": "Group A",
        "Group 2": "Group B",
        "Group 3": "Group C",
        "Group 4": "Group D",
      };

      return groupMap[groupName] || groupName;
    }

    return groupName;
  }

  const nonStandingStages = useMemo(() => {
    const stages = {};

    matches.forEach((match) => {
      const rawStage = match.stage_name?.toLowerCase() || "";
      const label = formatStageName(match.stage_name);

      const belongsToStandingStage = standingsStages.some((stage) => {
        const standingName = stage.stageName.toLowerCase();

        if (
          standingName === "group stage" ||
          standingName === "first round"
        ) {
          return ["groupstage", "group stage", "first round"].includes(
            rawStage
          );
        }

        return normalizeMatchStageForStandings(
          rawStage,
          standingName
        );
      });

      if (belongsToStandingStage) {
        return;
      }

      if (!stages[label]) {
        stages[label] = [];
      }

      stages[label].push(match);
    });

    return stages;
  }, [matches, standingsStages]);

  const stageOptions = useMemo(() => {
    const options = [];

    standingsStages.forEach((stage) => {
      options.push({
        type: "standings",
        key: stage.key,
        label: stage.stageLabel,
      });
    });

    Object.keys(nonStandingStages).forEach((stageLabel) => {
      options.push({
        type: "matches",
        key: `matches-${stageLabel}`,
        label: stageLabel,
      });
    });

    return options;
  }, [standingsStages, nonStandingStages]);

  useEffect(() => {
    if (stageOptions.length > 0 && !selectedStage) {
      setSelectedStage(stageOptions[0].key);
    }
  }, [stageOptions, selectedStage]);

  const activeStandingStage = standingsStages.find(
    (stage) => stage.key === selectedStage
  );

  const activeMatchStage = stageOptions.find(
    (stage) =>
      stage.key === selectedStage &&
      stage.type === "matches"
  );

  useEffect(() => {
    if (!activeStandingStage) {
      setSelectedGroup("");
      return;
    }

    const groups = Object.keys(activeStandingStage.groups);

    if (groups.length > 0) {
      setSelectedGroup(groups[0]);
    }
  }, [selectedStage, activeStandingStage]);

  function getMatchesForSelectedGroup() {
    if (!activeStandingStage || !selectedGroup) {
      return [];
    }

    const standingStage =
      activeStandingStage.stageName.toLowerCase();

    return matches.filter((match) => {
      const matchStage = match.stage_name?.toLowerCase() || "";
      const rawMatchGroup = match.group_name || "";

      const mappedMatchGroup = mapHistoricalGroupName(
        standingStage,
        rawMatchGroup
      );

      if (
        standingStage === "group stage" ||
        standingStage === "first round"
      ) {
        return (
          ["groupstage", "group stage", "first round"].includes(
            matchStage
          ) && mappedMatchGroup === selectedGroup
        );
      }

      if (standingStage === "first group stage") {
        return (
          matchStage === "group stage" &&
          mappedMatchGroup === selectedGroup
        );
      }

      if (standingStage === "second group stage") {
        return (
          matchStage === "second group stage" &&
          mappedMatchGroup === selectedGroup
        );
      }

      if (standingStage === "final round") {
        return matchStage === "final round";
      }

      return (
        matchStage === standingStage &&
        (mappedMatchGroup === selectedGroup ||
          rawMatchGroup === "not applicable" ||
          !rawMatchGroup)
      );
    });
  }

  function getHistoricalFlagUrl(teamName) {
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

      // Historical visual fallbacks
      "West Germany": "de",
      "East Germany": "de",
      Czechoslovakia: "cz",
      Yugoslavia: "rs",
      "Soviet Union": "ru",
    };

    const code = countryCodes[teamName];

    if (!code) {
      return null;
    }

    return `https://flagcdn.com/${code}.svg`;
  }

  if (loading) {
    return (
      <div className="page-container">
        <h1>Loading {year} World Cup...</h1>
      </div>
    );
  }

  const selectedGroupRows =
    activeStandingStage && selectedGroup
      ? activeStandingStage.groups[selectedGroup] || []
      : [];

  const selectedGroupMatches = getMatchesForSelectedGroup();

  const selectedKnockoutMatches =
    activeMatchStage
      ? nonStandingStages[activeMatchStage.label] || []
      : [];

  return (
    <div className="page-container">
      <Link to="/history" className="history-back-link">
        ← Back to World Cup History
      </Link>

      <section className="tournament-hero">
        <h1>
          {tournament
            ? `${tournament.host} ${year}`
            : `${year} FIFA World Cup`}
        </h1>

        <p>FIFA World Cup</p>

        {tournament && (
          <>
            <div className="tournament-summary">
              <div>
                <span>Champion</span>
                <strong>{tournament.champion}</strong>
              </div>

              <div>
                <span>Runner-up</span>
                <strong>{tournament.runnerUp}</strong>
              </div>

              <div>
                <span>Third Place</span>
                <strong>{tournament.thirdPlace}</strong>
              </div>

              <div>
                <span>Matches</span>
                <strong>{matches.length}</strong>
              </div>
            </div>

            {tournament.format && (
              <div className="tournament-format">
                <span>Tournament Format</span>
                <p>{tournament.format}</p>
              </div>
            )}
          </>
        )}
      </section>

      <div className="stage-tabs">
        {stageOptions.map((stage) => (
          <button
            key={stage.key}
            className={
              selectedStage === stage.key
                ? "stage-tab active"
                : "stage-tab"
            }
            onClick={() => setSelectedStage(stage.key)}
          >
            {stage.label}
          </button>
        ))}
      </div>

      {activeStandingStage && (
        <>
          <div className="group-tabs">
            {Object.keys(activeStandingStage.groups).map(
              (groupName) => (
                <button
                  key={groupName}
                  className={
                    selectedGroup === groupName
                      ? "group-tab active"
                      : "group-tab"
                  }
                  onClick={() => setSelectedGroup(groupName)}
                >
                  {groupName}
                </button>
              )
            )}
          </div>

          <div className="group-detail-layout">
            <section className="group-section">
              <h2>{selectedGroup} Standings</h2>

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
                    {selectedGroupRows.map((team) => (
                      <tr
                        key={`${activeStandingStage.key}-${team.team_id}`}
                        className={
                          team.advanced === 1
                            ? "advanced-team"
                            : ""
                        }
                      >
                        <td>{team.position}</td>

                        <td className="standings-team">
                          {getHistoricalFlagUrl(team.team_name) && (
                            <img
                              src={getHistoricalFlagUrl(team.team_name)}
                              alt={`${team.team_name} flag`}
                              className="standings-crest"
                            />
                          )}

                          <span>{team.team_name}</span>
                        </td>

                        <td>{team.played}</td>
                        <td>{team.wins}</td>
                        <td>{team.draws}</td>
                        <td>{team.losses}</td>
                        <td>{team.goals_for}</td>
                        <td>{team.goals_against}</td>

                        <td>
                          {team.goal_difference > 0
                            ? `+${team.goal_difference}`
                            : team.goal_difference}
                        </td>

                        <td>
                          <strong>{team.points}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="group-section">
              <h2>{selectedGroup} Matches</h2>

              <div className="group-match-list">
                {selectedGroupMatches.map((match) => (
                  <div
                    className="group-match"
                    key={match.match_id}
                  >
                    <span>{match.home_team_name}</span>

                    <strong>
                      {match.home_team_score} -{" "}
                      {match.away_team_score}
                    </strong>

                    <span>{match.away_team_name}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}

      {activeMatchStage && (
        <section className="tournament-stage">
          <h2>{activeMatchStage.label}</h2>

          <div className="card-grid">
            {selectedKnockoutMatches.map((match) => (
              <div className="match-card" key={match.match_id}>
                <div className="match-teams">
                  <div className="match-team">
                    {getHistoricalFlagUrl(match.home_team_name) && (
                      <img
                        src={getHistoricalFlagUrl(match.home_team_name)}
                        alt={`${match.home_team_name} flag`}
                        className="standings-crest"
                      />
                    )}

                    <strong>{match.home_team_name}</strong>
                  </div>

                  <div className="match-score">
                    {match.home_team_score} -{" "}
                    {match.away_team_score}
                  </div>

                  <div className="match-team">
                    {getHistoricalFlagUrl(match.away_team_name) && (
                      <img
                        src={getHistoricalFlagUrl(match.away_team_name)}
                        alt={`${match.away_team_name} flag`}
                        className="standings-crest"
                      />
                    )}

                    <strong>{match.away_team_name}</strong>
                  </div>
                </div>

                <p>
                  <strong>Date:</strong> {match.match_date}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {match.stadium_name}, {match.city_name}
                </p>

                {match.extra_time === 1 && (
                  <p>
                    <strong>Extra Time</strong>
                  </p>
                )}

                {match.penalty_shootout === 1 && (
                  <p>
                    <strong>Penalties:</strong>{" "}
                    {match.score_penalties}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default TournamentHistory;