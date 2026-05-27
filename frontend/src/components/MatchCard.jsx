function MatchCard({ match }) {
  const matchDate = match.utcDate
    ? new Date(match.utcDate).toLocaleString()
    : "Date TBD";

  return (
    <div className="card">
      <h2>{match.homeTeam || "TBD"} vs {match.awayTeam || "TBD"}</h2>

      <p><strong>Date:</strong> {matchDate}</p>
      <p><strong>Status:</strong> {match.status || "N/A"}</p>
      <p><strong>Stage:</strong> {match.stage || "N/A"}</p>
    </div>
  );
}

export default MatchCard;