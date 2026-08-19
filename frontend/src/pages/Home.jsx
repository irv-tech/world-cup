import {
  Link,
} from "react-router-dom";


function Home() {
  return (
    <div className="page-container">
      <section className="home-hero">
        <div className="home-hero-content">
          <p className="home-eyebrow">
            World Cup Cloud Platform
          </p>

          <h1>
            Explore World Cup history,
            teams, records, and 2026
            tournament data in one place.
          </h1>

          <p className="home-subtitle">
            A full-stack World Cup platform
            combining historical tournament
            data, 2026 results, team squads,
            player records, authentication,
            favorites, and cloud-hosted
            services.
          </p>

          <div className="home-actions">
            <Link
              to="/world-cup-2026"
              className="home-button primary"
            >
              Explore World Cup 2026
            </Link>

            <Link
              to="/history"
              className="home-button secondary"
            >
              Explore World Cup History
            </Link>
          </div>
        </div>
      </section>


      <section className="home-features">
        <div className="home-feature-card">
          <h2>
            World Cup 2026
          </h2>

          <p>
            Follow the 48-team tournament
            through all 12 groups, complete
            standings, match results,
            knockout rounds, tournament
            awards, and final placements.
          </p>

          <Link to="/world-cup-2026">
            Open World Cup 2026 →
          </Link>
        </div>


        <div className="home-feature-card">
          <h2>
            Teams
          </h2>

          <p>
            Browse national teams across
            World Cup history, explore
            tournament appearances, view
            historical identities, and open
            edition-specific squad data.
          </p>

          <Link to="/teams">
            Browse teams →
          </Link>
        </div>


        <div className="home-feature-card">
          <h2>
            World Cup History
          </h2>

          <p>
            Explore every Men's World Cup
            from 1930 through 2026 with
            tournament summaries, group
            stages, knockout rounds,
            champions, and individual
            awards.
          </p>

          <Link to="/history">
            Explore history →
          </Link>
        </div>


        <div className="home-feature-card">
          <h2>
            All-Time Statistics
          </h2>

          <p>
            Compare championship totals,
            tournament appearances, team
            scoring records, leading World
            Cup scorers, and player
            appearance leaders.
          </p>

          <Link to="/stats">
            View statistics →
          </Link>
        </div>


        <div className="home-feature-card">
          <h2>
            My World Cup
          </h2>

          <p>
            Sign in to build a personal
            World Cup collection by saving
            favorite national teams and
            players from tournament squads.
          </p>

          <Link to="/my-world-cup">
            Open My World Cup →
          </Link>
        </div>


        <div className="home-feature-card">
          <h2>
            Cloud Architecture
          </h2>

          <p>
            Built with React, FastAPI,
            Docker, Azure Container Apps,
            Azure SQL, Azure Container
            Registry, and Azure Static Web
            Apps.
          </p>

          <span className="home-tech-label">
            Full-stack cloud project
          </span>
        </div>
      </section>
    </div>
  );
}


export default Home;