function TeamCard({ team }) {
    return (
        <div className="card">
            <h2>{team.name}</h2>

            <p>Wins: {team.wins}</p>

            <p>Losses: {team.losses}</p>
        </div>
    )
}

export default TeamCard;