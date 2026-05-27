import { useEffect, useState } from "react";
import PlayerCard from "../components/PlayerCard";
import { getPlayers } from "../services/footballApi";

function Players() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");

  useEffect(() => {
    async function loadPlayers() {
      const data = await getPlayers();
      setPlayers(data);
      setLoading(false);
    }

    loadPlayers();
  }, []);

  const positions = [
    "all",
    ...new Set(players.map((player) => player.position).filter(Boolean)),
  ];

  const filteredPlayers = players
    .filter((player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.team.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((player) => {
      if (positionFilter === "all") return true;
      return player.position === positionFilter;
    });

  if (loading) {
    return (
      <div className="page-container">
        <h1>Loading players...</h1>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Player Profiles</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Search players or teams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="filter-select"
        >
          {positions.map((position) => (
            <option key={position} value={position}>
              {position === "all" ? "All Positions" : position}
            </option>
          ))}
        </select>
      </div>

      <p>Showing {filteredPlayers.length} of {players.length} players</p>

      <div className="card-grid">
        {filteredPlayers.map((player) => (
          <PlayerCard key={`${player.id}-${player.team}`} player={player} />
        ))}
      </div>
    </div>
  );
}

export default Players;