import { useEffect, useState } from "react";
import TeamCard from "../components/TeamCard";
import { getTeams } from "../services/footballApi";

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="page-container">
      <h1>World Cup Teams</h1>

      {teams.length === 0 && <p>No teams found.</p>}

      <div className="card-grid">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  );
}

export default Teams;