function MatchCard({ match }) {
  const matchDate = match.utcDate
    ? new Date(match.utcDate).toLocaleString()
    : "Date TBD";

  const homeScore = match.score?.fullTime?.home ?? "-";
  const awayScore = match.score?.fullTime?.away ?? "-";

  return (
    <div className="match-card">
      <div className="match-teams">

        <div className="match-team">
          {match.homeCrest && (
            <img
              src={match.homeCrest}
              alt={`${match.homeTeam} flag`}
              className="match-flag"
            />
          )}

          <strong>{match.homeTeam || "TBD"}</strong>
        </div>

        <div className="match-score">
            {homeScore} - {awayScore}
        </div>

        <div className="match-team">
          {match.awayCrest && (
            <img
              src={match.awayCrest}
              alt={`${match.awayTeam} flag`}
              className="match-flag"
            />
          )}

          <strong>{match.awayTeam || "TBD"}</strong>
        </div>

      </div>

      <p>
        <strong>Date:</strong> {matchDate}
      </p>
    </div>
  );
}

export default MatchCard;