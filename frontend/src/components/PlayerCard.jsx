function PlayerCard({ player }) {
    return (
        <div className="card">
            <h2>{player.name}</h2>

            <p>Country: {player.country}</p>

            <p>Goals: {player.goals}</p>
        </div>
    );
}

export default PlayerCard;