import { addFavoritePlayer } from "../services/favoritesApi";

function PlayerCard({ player }) {
  return (
    <div className="card">
      {player.teamCrest && (
        <img src={player.teamCrest} alt={player.team} width="60" />
      )}

      <h2>{player.name}</h2>

      <p><strong>Team:</strong> {player.team || "N/A"}</p>
      <p><strong>Position:</strong> {player.position || "N/A"}</p>
      <p><strong>Nationality:</strong> {player.nationality || "N/A"}</p>
      <p><strong>Date of Birth:</strong> {player.dateOfBirth || "N/A"}</p>
      <button onClick={handleAddFavorite}>Add to Favorites</button>
    </div>
  );

  async function handleAddFavorite() {
    try {
      await addFavoritePlayer(player);
      alert(`${player.name} added to favorites`);
    } catch (error) {
      alert(error.message);
    }
  }
}

export default PlayerCard;