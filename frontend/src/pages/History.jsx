import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function History() {
  const [worldCupHistory, setWorldCupHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/history`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error("Failed to load World Cup history");
        }

        setWorldCupHistory(data);
      } catch (error) {
        console.error("History API error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <h1>Loading World Cup history...</h1>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>World Cup History</h1>

      <div className="card-grid">
        {worldCupHistory.map((cup) => (
          <div className="card" key={cup.year}>
            <h2>{cup.year}</h2>

            <p>
              <strong>Host:</strong> {cup.host}
            </p>

            <p>
              <strong>Champion:</strong> {cup.champion}
            </p>

            <p>
              <strong>Runner-up:</strong> {cup.runnerUp}
            </p>

            <p>
              <strong>Final Score:</strong> {cup.finalScore}
            </p>

            <p>
              <strong>Third Place:</strong> {cup.thirdPlace}
            </p>

            <Link
              to={`/history/${cup.year}`}
              className="home-button primary"
            >
              Explore {cup.year}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;