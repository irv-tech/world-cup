import PlayerCard from "../components/PlayerCard";
import players from "../data/players";

function Players() {
  return (
    <div className="page-container">
      <h1>Players</h1>
        <div className="card-grid">
            {players.map((player) => (
                <PlayerCard key={player.id} player={player} />
            ))}
        </div>

    </div>
  );
}

export default Players;