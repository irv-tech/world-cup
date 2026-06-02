import { useEffect, useState } from "react";
import {
  getFavoriteTeams,
  deleteFavoriteTeam,
  getFavoritePlayers,
  deleteFavoritePlayer,
} from "../services/favoritesApi";

function Dashboard() {
  const username = localStorage.getItem("username");
  const [favoriteTeams, setFavoriteTeams] = useState([]);
  const [favoritePlayers, setFavoritePlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function handleRemoveFavoriteTeam(favoriteId) {
    try {
      await deleteFavoriteTeam(favoriteId);

      setFavoriteTeams((currentFavorites) =>
        currentFavorites.filter((team) => team.id !== favoriteId)
      );
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleRemoveFavoritePlayer(favoriteId) {
    try {
      await deleteFavoritePlayer(favoriteId);

      setFavoritePlayers((currentPlayers) =>
        currentPlayers.filter((player) => player.id !== favoriteId)
      );
    } catch (error) {
      alert(error.message);
    }
  }

  useEffect(() => {
    async function loadFavorites() {
      try {
        const teams = await getFavoriteTeams();
        const players = await getFavoritePlayers();

        setFavoriteTeams(teams);
        setFavoritePlayers(players);
      } catch (error) {
        console.error("Failed to load favorites:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <h1>Loading dashboard...</h1>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>User Dashboard</h1>

      <p>Welcome, {username}.</p>

      <h2>Favorite Teams</h2>

      {favoriteTeams.length === 0 && (
        <p>You have not added any favorite teams yet.</p>
      )}

      <div className="card-grid">
        {favoriteTeams.map((team) => (
          <div className="card" key={team.id}>
            {team.team_crest && (
              <img src={team.team_crest} alt={team.team_name} width="80" />
            )}

            <h3>{team.team_name}</h3>

            <p>
              <strong>Code:</strong> {team.team_code}
            </p>

            <button onClick={() => handleRemoveFavoriteTeam(team.id)}>
              Remove Favorite
            </button>
          </div>
        ))}
      </div>

      <h2>Favorite Players</h2>

      {favoritePlayers.length === 0 && (
        <p>You have not added any favorite players yet.</p>
      )}

      <div className="card-grid">
        {favoritePlayers.map((player) => (
          <div className="card" key={player.id}>
            <h3>{player.player_name}</h3>

            <p>
              <strong>Team:</strong> {player.team_name}
            </p>

            <p>
              <strong>Position:</strong> {player.position}
            </p>

            <p>
              <strong>Nationality:</strong> {player.nationality}
            </p>

            <button onClick={() => handleRemoveFavoritePlayer(player.id)}>
              Remove Favorite
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;