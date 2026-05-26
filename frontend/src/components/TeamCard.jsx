import worldCupStats from "../data/worldCupStats";

function TeamCard({ team }) {
  const stats = worldCupStats[team.name] || {
    championships: 0,
    appearances: "N/A",
    previousTitles: [],
  };

  return (
    <div className="card">
      {team.crest && <img src={team.crest} alt={team.name} width="80" />}

      <h2>{team.name}</h2>

      <p><strong>Code:</strong> {team.tla || "N/A"}</p>
      <p><strong>World Cup Championships:</strong> {stats.championships}</p>
      <p><strong>World Cup Appearances:</strong> {stats.appearances}</p>
      <p>
        <strong>Title Years:</strong>{" "}
        {stats.previousTitles.length > 0 ? stats.previousTitles.join(", ") : "None"}
      </p>
    </div>
  );
}

export default TeamCard;