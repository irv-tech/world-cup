function MatchCard({match}) {
    return (
        <div className="card">
            <h2>
                {match.home} vs {match.away}
            </h2>

            <p>Date: {match.date}</p>
        </div>
    );
}

export default MatchCard;