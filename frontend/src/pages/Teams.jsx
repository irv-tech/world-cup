import { useEffect, useState } from "react";
import TeamCard from "../components/TeamCard";
import { getTeams } from "../services/footballApi";
import worldCupStats from "../data/worldCupStats";

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [championsOnly, setChampionsOnly] = useState(false);
  const [sortOption, setSortOption] = useState("name");

  useEffect(() => {
    async function loadTeams() {
      const data = await getTeams();
      setTeams(data);
      setLoading(false);
    }

    loadTeams();
  }, []);

  function getStats(teamName) {
    return (
      worldCupStats[teamName] || {
        championships: 0,
        appearances: 0,
        previousTitles: [],
      }
    );
  }

  const filteredTeams = teams
    .filter((team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((team) => {
      if (!championsOnly) return true;
      return getStats(team.name).championships > 0;
    })
    .sort((a, b) => {
      const statsA = getStats(a.name);
      const statsB = getStats(b.name);

      if (sortOption === "championships") {
        return statsB.championships - statsA.championships;
      }

      if (sortOption === "appearances") {
        return statsB.appearances - statsA.appearances;
      }

      return a.name.localeCompare(b.name);
    });

  if (loading) {
    return (
      <div className="page-container">
        <h1>Loading teams...</h1>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>World Cup Teams</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Search teams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="filter-select"
        >
          <option value="name">Sort by Name</option>
          <option value="championships">Sort by Championships</option>
          <option value="appearances">Sort by Appearances</option>
        </select>

        <label className="checkbox-filter">
          <input
            type="checkbox"
            checked={championsOnly}
            onChange={(e) => setChampionsOnly(e.target.checked)}
          />
          Champions only
        </label>
      </div>

      <p>
        Showing {filteredTeams.length} of {teams.length} teams
      </p>

      <div className="card-grid">
        {filteredTeams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  );
}

export default Teams;