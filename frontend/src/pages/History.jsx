import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";


function History() {
  const [
    worldCupHistory,
    setWorldCupHistory,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/history`
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            "Failed to load World Cup history."
          );
        }

        if (!Array.isArray(data)) {
          throw new Error(
            "Unexpected history data returned by the server."
          );
        }

        setWorldCupHistory(data);
      } catch (error) {
        console.error(
          "History API error:",
          error
        );

        setError(
          error.message ||
            "Unable to load World Cup history."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);


  if (loading) {
    return (
      <div className="page-container">
        <div className="history-page-header">
          <p className="section-eyebrow">
            Tournament Archive
          </p>

          <h1>
            World Cup History
          </h1>

          <p>
            Loading tournament history...
          </p>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="page-container">
        <div className="history-page-header">
          <p className="section-eyebrow">
            Tournament Archive
          </p>

          <h1>
            World Cup History
          </h1>

          <p>
            Explore FIFA Men's World Cup
            tournaments across history.
          </p>
        </div>

        <div className="history-error">
          <strong>
            Unable to load tournament history.
          </strong>

          <p>
            {error}
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="page-container">
      <div className="history-page-header">
        <p className="section-eyebrow">
          Tournament Archive
        </p>

        <h1>
          World Cup History
        </h1>

        <p>
          Explore FIFA Men's World Cup
          tournaments from 1930 through 2026,
          including hosts, champions,
          runners-up, third-place finishers,
          group stages, knockout rounds, and
          individual awards.
        </p>
      </div>


      <div className="history-summary-bar">
        <div>
          <span>
            Tournaments
          </span>

          <strong>
            {
              worldCupHistory.length
            }
          </strong>
        </div>

        <div>
          <span>
            Coverage
          </span>

          <strong>
            1930–2026
          </strong>
        </div>
      </div>


      {worldCupHistory.length === 0 ? (
        <div className="history-empty-state">
          <h2>
            No tournaments found
          </h2>

          <p>
            World Cup history data is
            currently unavailable.
          </p>
        </div>
      ) : (
        <div className="history-card-grid">
          {worldCupHistory.map(
            (cup) => (
              <article
                className="history-card"
                key={cup.year}
              >
                <div className="history-card-header">
                  <span className="history-year">
                    {cup.year}
                  </span>

                  <h2>
                    {cup.host}
                  </h2>
                </div>


                <div className="history-podium">
                  <div>
                    <span>
                      Champion
                    </span>

                    <strong>
                      {cup.champion}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Runner-up
                    </span>

                    <strong>
                      {cup.runnerUp}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Third Place
                    </span>

                    <strong>
                      {cup.thirdPlace}
                    </strong>
                  </div>
                </div>


                <Link
                  to={`/history/${cup.year}`}
                  className="history-card-link"
                >
                  Explore {cup.year} →
                </Link>
              </article>
            )
          )}
        </div>
      )}
    </div>
  );
}


export default History;