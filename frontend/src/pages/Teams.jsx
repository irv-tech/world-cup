import { useEffect, useState } from "react";
import TeamCard from "../components/TeamCard";
import { getTeams } from "../services/footballApi";

function Teams() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    async function loadTeams() {
      const data = await getTeams();
      setTeams(data);
    }

    loadTeams();
  }, []);

  return (
    <div className="page-container">
      <h1>World Cup Teams</h1>

      <div className="card-grid">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  );
}

export default Teams;