import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTeams } from "../services/footballApi";
import worldCupStats from "../data/worldCupStats";

function TeamDetails() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeam() {
      const teams = await getTeams();
      const selectedTeam = teams.find((team) => team.id === Number(id));

      setTeam(selectedTeam);
      setLoading(false);
    }

    loadTeam();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <h1>Loading team details...</h1>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="page-container">
        <h1>Team not found</h1>
      </div>
    );
  }

  const stats = worldCupStats[team.name] || {
    championships: 0,
    appearances: "N/A",
    previousTitles: [],
  };

  return (
    <div className="page-container">
      {team.crest && <img src={team.crest} alt={team.name} width="120" />}

      <h1>{team.name}</h1>

      <p><strong>Code:</strong> {team.tla || "N/A"}</p>
      <p><strong>Founded:</strong> {team.founded || "N/A"}</p>
      <p><strong>Venue:</strong> {team.venue || "N/A"}</p>
      <p><strong>World Cup Championships:</strong> {stats.championships}</p>
      <p><strong>World Cup Appearances:</strong> {stats.appearances}</p>
      <p>
        <strong>Title Years:</strong>{" "}
        {stats.previousTitles.length > 0
          ? stats.previousTitles.join(", ")
          : "None"}
      </p>

      <h2>Squad</h2>

      <div className="card-grid">
        {team.squad?.map((player) => (
          <div className="card" key={player.id}>
            <h3>{player.name}</h3>
            <p><strong>Position:</strong> {player.position || "N/A"}</p>
            <p><strong>Date of Birth:</strong> {player.dateOfBirth || "N/A"}</p>
            <p><strong>Nationality:</strong> {player.nationality || "N/A"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeamDetails;