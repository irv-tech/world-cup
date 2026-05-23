import TeamCard from "../components/TeamCard";
import teams from "../data/teams";

function Teams() {
    return (
        <div className="page-container">
            <h1>Teams</h1>
            <div className="card-grid">
                {teams.map((team) => (
                    <TeamCard key={team.id} team={team} />
                ))}
            </div>
        </div>
    )
}

export default Teams;