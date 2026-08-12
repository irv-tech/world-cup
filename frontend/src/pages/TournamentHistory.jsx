import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

function TournamentHistory() {
  const { year } = useParams();

  const [matches, setMatches] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTournament() {
      try {
        const [matchesResponse, historyResponse] = await Promise.all([
          fetch(
            `${import.meta.env.VITE_API_BASE_URL}/history/${year}/matches`
          ),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/history`),
        ]);

        const matchesData = await matchesResponse.json();
        const historyData = await historyResponse.json();

        if (!matchesResponse.ok) {
          throw new Error(`Failed to load ${year} World Cup matches`);
        }

        if (!historyResponse.ok) {
          throw new Error("Failed to load World Cup history");
        }

        setMatches(matchesData);

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

  const groupedMatches = useMemo(() => {
    const groups = {
      "Group Stage": [],
      "Round of 16": [],
      "Quarterfinals": [],
      "Semifinals": [],
      "Third Place": [],
      "Final": [],
      Other: [],
    };

    matches.forEach((match) => {
      const stage = match.stage_name?.toLowerCase() || "";

      if (stage === "groupstage") {
        groups["Group Stage"].push(match);
      } else if (stage.includes("round of 16")) {
        groups["Round of 16"].push(match);
      } else if (stage.includes("quarter")) {
        groups["Quarterfinals"].push(match);
      } else if (stage.includes("semi")) {
        groups["Semifinals"].push(match);
      } else if (
        stage.includes("third") ||
        stage.includes("third-place") ||
        stage.includes("third place")
      ) {
        groups["Third Place"].push(match);
      } else if (stage === "final") {
        groups["Final"].push(match);
      } else {
        groups.Other.push(match);
      }
    });

    return groups;
  }, [matches]);

  if (loading) {
    return (
      <div className="page-container">
        <h1>Loading {year} World Cup...</h1>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Link to="/history" className="history-back-link">
        ← Back to World Cup History
      </Link>

      <section className="tournament-hero">
        <h1>{year} FIFA World Cup</h1>

        {tournament && (
          <div className="tournament-summary">
            <div>
              <span>Host</span>
              <strong>{tournament.host}</strong>
            </div>

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
              <span>Final Score</span>
              <strong>{tournament.finalScore}</strong>
            </div>

            <div>
              <span>Matches</span>
              <strong>{matches.length}</strong>
            </div>
          </div>
        )}
      </section>

      {Object.entries(groupedMatches).map(([stage, stageMatches]) => {
        if (stageMatches.length === 0) {
          return null;
        }

        return (
          <section className="tournament-stage" key={stage}>
            <h2>{stage}</h2>

            <div className="card-grid">
              {stageMatches.map((match) => (
                <div className="match-card" key={match.match_id}>
                  <div className="match-teams">
                    <div className="match-team">
                      <strong>{match.home_team_name}</strong>
                    </div>

                    <div className="match-score">
                      {match.home_team_score} - {match.away_team_score}
                    </div>

                    <div className="match-team">
                      <strong>{match.away_team_name}</strong>
                    </div>
                  </div>

                  <p>
                    <strong>Date:</strong> {match.match_date}
                  </p>

                  {match.group_name && (
                    <p>
                      <strong>Group:</strong> {match.group_name}
                    </p>
                  )}

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
                      <strong>Penalties:</strong> {match.score_penalties}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default TournamentHistory;