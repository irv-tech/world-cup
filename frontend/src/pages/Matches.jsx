import MatchCard from "../components/MatchCard";
import matches from "../data/matches";

function Matches() {
    return (
        <div className="page-container">
            <h1>Matches | Highlights</h1>
            <div className="card-grid">
                {matches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                ))}
            </div>
        </div>
    );
}

export default Matches;