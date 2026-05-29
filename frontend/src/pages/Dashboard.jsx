import { useEffect, useState } from "react";
import { getFavoriteTeams } from "../services/favoritesApi";

function Dashboard() {
  const username = localStorage.getItem("username");
  const [favoriteTeams, setFavoriteTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const data = await getFavoriteTeams();
        setFavoriteTeams(data);
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;