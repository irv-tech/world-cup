import { useEffect, useState } from "react";
import MatchCard from "../components/MatchCard";
import { getMatches } from "../services/footballApi";

function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadMatches() {
      const data = await getMatches();
      setMatches(data);
      setLoading(false);
    }

    loadMatches();
  }, []);

  const filteredMatches = matches.filter((match) => {
    if (statusFilter === "all") return true;
    return match.status === statusFilter;
  });

  const groupedMatches = filteredMatches.reduce((groups, match) => {
    const date = match.utcDate
      ? new Date(match.utcDate).toLocaleDateString()
      : "Date TBD";

    if (!groups[date]) groups[date] = [];
    groups[date].push(match);

    return groups;
  }, {});

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

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Matches</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="FINISHED">Finished</option>
          <option value="IN_PLAY">Live</option>
          <option value="PAUSED">Paused</option>
        </select>
      </div>

      <p>Showing {filteredMatches.length} of {matches.length} matches</p>

      {viewMode === "list" ? (
        <div className="card-grid">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <div>
          {Object.entries(groupedMatches).map(([date, matchesForDate]) => (
            <div key={date} className="calendar-section">
              <h2>{date}</h2>

              <div className="card-grid">
                {matchesForDate.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Matches;