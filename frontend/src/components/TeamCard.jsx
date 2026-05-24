function TeamCard({ team }) {
  return (
    <div className="card">
      <h2>{team.name}</h2>

      <p>Country Code: {team.tla}</p>

      <p>Founded: {team.founded}</p>
    </div>
  );
}

export default TeamCard;