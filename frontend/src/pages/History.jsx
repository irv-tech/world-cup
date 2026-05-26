import worldCupHistory from "../data/worldCupHistory";

function History() {
  return (
    <div className="page-container">
      <h1>World Cup History</h1>

      <div className="card-grid">
        {worldCupHistory.map((cup) => (
          <div className="card" key={cup.year}>
            <h2>{cup.year}</h2>
            <p><strong>Host:</strong> {cup.host}</p>
            <p><strong>Winner:</strong> {cup.winner}</p>
            <p><strong>Runner-up:</strong> {cup.runnerUp}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;