import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="page-container">
      <section className="home-hero">
        <div className="home-hero-content">
          <p className="home-eyebrow">World Cup Cloud Platform</p>

          <h1>Explore the World Cup in one place.</h1>

          <p className="home-subtitle">
            Browse national teams, player profiles, historic match results,
            and save your favorite teams and players to a personalized dashboard.
          </p>

          <div className="home-actions">
            <Link to="/teams" className="home-button primary">
              Explore Teams
            </Link>

            <Link to="/matches" className="home-button secondary">
              View Matches
            </Link>
          </div>
        </div>
      </section>

      <section className="home-features">
        <div className="home-feature-card">
          <h2>Teams</h2>
          <p>
            Explore World Cup nations, team information, and country details.
          </p>
          <Link to="/teams">Browse teams →</Link>
        </div>

        <div className="home-feature-card">
          <h2>Players</h2>
          <p>
            View player profiles, positions, nationalities, and team information.
          </p>
          <Link to="/players">Browse players →</Link>
        </div>

        <div className="home-feature-card">
          <h2>Match Results</h2>
          <p>
            Review completed World Cup matches, scores, dates, and national flags.
          </p>
          <Link to="/matches">View results →</Link>
        </div>

        <div className="home-feature-card">
          <h2>Your Dashboard</h2>
          <p>
            Sign in to save favorite teams and players to your personal dashboard.
          </p>
          <Link to="/dashboard">Open dashboard →</Link>
        </div>
      </section>
    </div>
  );
}

export default Home;