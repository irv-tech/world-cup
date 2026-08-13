import { useEffect, useMemo, useState } from "react";

function WorldCup2026() {
  const [groups, setGroups] = useState([]);
  const [matches, setMatches] = useState([]);

  const [selectedSection, setSelectedSection] =
    useState("groups");

  const [selectedGroup, setSelectedGroup] =
    useState("GROUP_A");

  const [selectedKnockoutStage, setSelectedKnockoutStage] =
    useState("LAST_32");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTournament() {
      try {
        const [groupsResponse, matchesResponse] =
          await Promise.all([
            fetch(
              `${import.meta.env.VITE_API_BASE_URL}/world-cup-2026/groups`
            ),
            fetch(
              `${import.meta.env.VITE_API_BASE_URL}/matches`
            ),
          ]);

        const groupsData = await groupsResponse.json();
        const matchesData = await matchesResponse.json();

        if (!groupsResponse.ok) {
          throw new Error("Failed to load 2026 groups");
        }

        if (!matchesResponse.ok) {
          throw new Error("Failed to load 2026 matches");
        }

        setGroups(groupsData);
        setMatches(matchesData);
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

  const activeGroup = groups.find(
    (group) => group.group === selectedGroup
  );

  const knockoutMatches = useMemo(() => {
    return matches.filter(
      (match) =>
        match.stage === selectedKnockoutStage
    );
  }, [matches, selectedKnockoutStage]);

  function formatGroupName(groupName) {
    return groupName.replace("GROUP_", "Group ");
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString();
  }

  if (loading) {
    return (
      <div className="page-container">
        <h1>Loading 2026 World Cup...</h1>
      </div>
    );
  }

  return (
    <div className="page-container">
      <section className="tournament-hero">
        <h1>2026 FIFA World Cup</h1>

        <p className="world-cup-subtitle">
          United States • Canada • Mexico
        </p>

        <div className="tournament-summary">
          <div>
            <span>Champion</span>
            <strong>Spain</strong>
          </div>

          <div>
            <span>Runner-up</span>
            <strong>Argentina</strong>
          </div>

          <div>
            <span>Third Place</span>
            <strong>England</strong>
          </div>

          <div>
            <span>Matches</span>
            <strong>104</strong>
          </div>
        </div>

        <div className="tournament-format">
          <span>Tournament Format</span>

          <p>
            48 teams were divided into 12 groups of four.
            The top two teams from each group and the eight
            best third-place teams advanced to the Round of 32,
            followed by a single-elimination knockout stage
            through the final.
          </p>
        </div>
      </section>

      <div className="stage-tabs">
        <button
          className={
            selectedSection === "groups"
              ? "stage-tab active"
              : "stage-tab"
          }
          onClick={() => setSelectedSection("groups")}
        >
          Group Stage
        </button>

        <button
          className={
            selectedSection === "knockout"
              ? "stage-tab active"
              : "stage-tab"
          }
          onClick={() => setSelectedSection("knockout")}
        >
          Knockout Stage
        </button>
      </div>

      {selectedSection === "groups" && (
        <>
          <div className="group-tabs">
            {groups.map((group) => (
              <button
                key={group.group}
                className={
                  selectedGroup === group.group
                    ? "group-tab active"
                    : "group-tab"
                }
                onClick={() =>
                  setSelectedGroup(group.group)
                }
              >
                {formatGroupName(group.group)}
              </button>
            ))}
          </div>

          {activeGroup && (
            <div className="group-detail-layout">
              <section className="group-section">
                <h2>
                  {formatGroupName(activeGroup.group)} Standings
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
                          <tr key={team.team}>
                            <td>{team.position}</td>

                            <td className="standings-team">
                              <img
                                src={team.crest}
                                alt={`${team.team} flag`}
                                className="standings-crest"
                              />

                              {team.team}
                            </td>

                            <td>{team.played}</td>
                            <td>{team.wins}</td>
                            <td>{team.draws}</td>
                            <td>{team.losses}</td>
                            <td>{team.goalsFor}</td>
                            <td>{team.goalsAgainst}</td>

                            <td>
                              {team.goalDifference > 0
                                ? `+${team.goalDifference}`
                                : team.goalDifference}
                            </td>

                            <td>
                              <strong>
                                {team.points}
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
                  {formatGroupName(activeGroup.group)} Matches
                </h2>

                <div className="group-match-list">
                  {activeGroup.matches.map(
                    (match) => (
                      <div
                        className="group-match"
                        key={match.id}
                      >
                        <span>
                          {match.homeTeam}
                        </span>

                        <strong>
                          {match.homeScore} -{" "}
                          {match.awayScore}
                        </strong>

                        <span>
                          {match.awayTeam}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </section>
            </div>
          )}
        </>
      )}

      {selectedSection === "knockout" && (
        <>
          <div className="group-tabs">
            {knockoutStages.map((stage) => (
              <button
                key={stage.key}
                className={
                  selectedKnockoutStage === stage.key
                    ? "group-tab active"
                    : "group-tab"
                }
                onClick={() =>
                  setSelectedKnockoutStage(stage.key)
                }
              >
                {stage.label}
              </button>
            ))}
          </div>

          <section className="tournament-stage">
            <h2>
              {
                knockoutStages.find(
                  (stage) =>
                    stage.key === selectedKnockoutStage
                )?.label
              }
            </h2>

            <div className="card-grid">
              {knockoutMatches.map((match) => (
                <div
                  className="match-card"
                  key={match.id}
                >
                  <div className="match-teams">
                    <div className="match-team">
                      <img
                        src={match.homeCrest}
                        alt={`${match.homeTeam} flag`}
                        className="standings-crest"
                      />

                      <strong>
                        {match.homeTeam}
                      </strong>
                    </div>

                    <div className="match-score">
                      {match.score?.fullTime?.home} -{" "}
                      {match.score?.fullTime?.away}
                    </div>

                    <div className="match-team">
                      <img
                        src={match.awayCrest}
                        alt={`${match.awayTeam} flag`}
                        className="standings-crest"
                      />

                      <strong>
                        {match.awayTeam}
                      </strong>
                    </div>
                  </div>

                  <p>
                    <strong>Date:</strong>{" "}
                    {formatDate(match.utcDate)}
                  </p>

                  {match.score?.duration ===
                    "EXTRA_TIME" && (
                    <p>
                      <strong>
                        After Extra Time
                      </strong>
                    </p>
                  )}

                  {match.score?.penalties && (
                    <p>
                      <strong>
                        Penalties:
                      </strong>{" "}
                      {match.score.penalties.home} -{" "}
                      {match.score.penalties.away}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default WorldCup2026;