import { Link } from "react-router-dom";
import worldCupStats from "../data/worldCupStats";
import { addFavoriteTeam } from "../services/favoritesApi";

function TeamCard({ team }) {
  const stats = worldCupStats[team.name] || {
    championships: 0,
    appearances: "N/A",
    previousTitles: [],
  };

  async function handleAddFavorite() {
    try {
      await addFavoriteTeam(team);
      alert(`${team.name} added to favorites`);
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="card">
      {team.crest && <img src={team.crest} alt={team.name} width="80" />}

      <h2>{team.name}</h2>

      <p><strong>Code:</strong> {team.tla || "N/A"}</p>
      <p><strong>Championships:</strong> {stats.championships}</p>
      <p><strong>Appearances:</strong> {stats.appearances}</p>

      <Link to={`/teams/${team.id}`}>View Team Details</Link>

      <button onClick={handleAddFavorite}>Add to Favorites</button>
    </div>
  );
}

export default TeamCard;