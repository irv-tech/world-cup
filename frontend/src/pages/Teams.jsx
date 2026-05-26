import { useEffect, useState } from "react";
import TeamCard from "../components/TeamCard";
import { getTeams } from "../services/footballApi";

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadTeams() {
      const data = await getTeams();

      console.log("Teams in component:", data);

      setTeams(data);
      setLoading(false);
    }

    loadTeams();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <h1>Loading teams...</h1>
      </div>
    );
  }

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <h1>World Cup Teams</h1>

      {teams.length === 0 && <p>No teams found.</p>}

      <input
        type="text"
        placeholder="Search teams..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <div className="card-grid">
        {filteredTeams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  );
}

export default Teams;