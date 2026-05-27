import { useEffect, useState } from "react";
import MatchCard from "../components/MatchCard";
import { getMatches } from "../services/footballApi";

function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    async function loadMatches() {
      const data = await getMatches();
      setMatches(data);
      setLoading(false);
    }

    loadMatches();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <h1>Loading matches...</h1>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>World Cup Matches</h1>

      <div className="filters">
        <button onClick={() => setViewMode("list")}>List View</button>
        <button onClick={() => setViewMode("calendar")}>Calendar View</button>
      </div>

      <p>Showing {matches.length} matches</p>

      {viewMode === "list" ? (
        <div className="card-grid">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <div className="card">
          <h2>Calendar View</h2>
          <p>Calendar layout placeholder. Pending...</p>
        </div>
      )}
    </div>
  );
}

export default Matches;