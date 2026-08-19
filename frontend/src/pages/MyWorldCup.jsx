import {
  useEffect,
  useState,
} from "react";

import {
  getFavoriteTeams,
  deleteFavoriteTeam,
  getFavoritePlayers,
  deleteFavoritePlayer,
} from "../services/favoritesApi";


function Dashboard() {
  const username =
    localStorage.getItem(
      "username"
    );

  const [
    favoriteTeams,
    setFavoriteTeams,
  ] = useState([]);

  const [
    favoritePlayers,
    setFavoritePlayers,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  async function handleRemoveFavoriteTeam(
    favoriteId
  ) {
    try {
      await deleteFavoriteTeam(
        favoriteId
      );

      setFavoriteTeams(
        (currentFavorites) =>
          currentFavorites.filter(
            (team) =>
              team.id !==
              favoriteId
          )
      );
    } catch (error) {
      alert(
        error.message
      );
    }
  }


  async function handleRemoveFavoritePlayer(
    favoriteId
  ) {
    try {
      await deleteFavoritePlayer(
        favoriteId
      );

      setFavoritePlayers(
        (currentPlayers) =>
          currentPlayers.filter(
            (player) =>
              player.id !==
              favoriteId
          )
      );
    } catch (error) {
      alert(
        error.message
      );
    }
  }


  useEffect(() => {
    async function loadFavorites() {
      try {
        setLoading(true);
        setError("");

        const [
          teams,
          players,
        ] = await Promise.all([
          getFavoriteTeams(),
          getFavoritePlayers(),
        ]);

        setFavoriteTeams(
          Array.isArray(teams)
            ? teams
            : []
        );

        setFavoritePlayers(
          Array.isArray(players)
            ? players
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load favorites:",
          error
        );

        setError(
          error.message ||
            "Unable to load your favorites."
        );
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, []);


  if (loading) {
    return (
      <div className="page-container">
        <h1>
          Loading My World Cup...
        </h1>
      </div>
    );
  }


  return (
    <div className="page-container">
      <section className="my-world-cup-header">
        <div>
          <p className="section-eyebrow">
            Your Tournament Space
          </p>

          <h1>
            My World Cup
          </h1>

          <p className="my-world-cup-intro">
            Welcome
            {username
              ? `, ${username}`
              : ""}
            . Keep track of your
            favorite national teams
            and World Cup players.
          </p>
        </div>
      </section>


      {error && (
        <div className="my-world-cup-error">
          <strong>
            Unable to load favorites.
          </strong>

          <p>
            {error}
          </p>
        </div>
      )}


      <section className="my-world-cup-summary">
        <div className="my-world-cup-summary-card">
          <span>
            Favorite Teams
          </span>

          <strong>
            {
              favoriteTeams.length
            }
          </strong>
        </div>

        <div className="my-world-cup-summary-card">
          <span>
            Favorite Players
          </span>

          <strong>
            {
              favoritePlayers.length
            }
          </strong>
        </div>
      </section>


      <section className="my-world-cup-section">
        <div className="my-world-cup-section-header">
          <div>
            <p className="section-eyebrow">
              National Teams
            </p>

            <h2>
              Favorite Teams
            </h2>
          </div>
        </div>


        {favoriteTeams.length ===
        0 ? (
          <div className="my-world-cup-empty">
            <h3>
              No favorite teams yet
            </h3>

            <p>
              Add teams from the
              Teams section and they
              will appear here.
            </p>
          </div>
        ) : (
          <div className="card-grid">
            {favoriteTeams.map(
              (team) => (
                <article
                  className="card my-world-cup-card"
                  key={
                    team.id
                  }
                >
                  {team.team_crest && (
                    <div className="favorite-team-crest-wrapper">
                      <img
                        src={
                          team.team_crest
                        }
                        alt={
                          `${team.team_name} crest`
                        }
                        className="favorite-team-crest"
                      />
                    </div>
                  )}


                  <h3>
                    {
                      team.team_name
                    }
                  </h3>


                  {team.team_code && (
                    <p>
                      <strong>
                        Code:
                      </strong>{" "}
                      {
                        team.team_code
                      }
                    </p>
                  )}


                  <button
                    type="button"
                    className="remove-favorite-button"
                    onClick={() =>
                      handleRemoveFavoriteTeam(
                        team.id
                      )
                    }
                  >
                    Remove Favorite
                  </button>
                </article>
              )
            )}
          </div>
        )}
      </section>


      <section className="my-world-cup-section">
        <div className="my-world-cup-section-header">
          <div>
            <p className="section-eyebrow">
              Players
            </p>

            <h2>
              Favorite Players
            </h2>
          </div>
        </div>


        {favoritePlayers.length ===
        0 ? (
          <div className="my-world-cup-empty">
            <h3>
              No favorite players yet
            </h3>

            <p>
              Add players from a team
              squad and they will
              appear here.
            </p>
          </div>
        ) : (
          <div className="card-grid">
            {favoritePlayers.map(
              (player) => (
                <article
                  className="card my-world-cup-card"
                  key={
                    player.id
                  }
                >
                  <h3>
                    {
                      player.player_name
                    }
                  </h3>


                  {player.team_name && (
                    <p>
                      <strong>
                        Team:
                      </strong>{" "}
                      {
                        player.team_name
                      }
                    </p>
                  )}


                  {player.position && (
                    <p>
                      <strong>
                        Position:
                      </strong>{" "}
                      {
                        player.position
                      }
                    </p>
                  )}


                  {player.nationality && (
                    <p>
                      <strong>
                        Nationality:
                      </strong>{" "}
                      {
                        player.nationality
                      }
                    </p>
                  )}


                  {player.jersey_number !=
                    null &&
                    player.jersey_number !==
                      0 && (
                      <p>
                        <strong>
                          Jersey:
                        </strong>{" "}
                        #
                        {
                          player.jersey_number
                        }
                      </p>
                    )}


                  <button
                    type="button"
                    className="remove-favorite-button"
                    onClick={() =>
                      handleRemoveFavoritePlayer(
                        player.id
                      )
                    }
                  >
                    Remove Favorite
                  </button>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}


export default Dashboard;