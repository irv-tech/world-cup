import {
  useEffect,
  useMemo,
  useState,
} from "react";


function Stats() {
  const [
    stats,
    setStats,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/stats`
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            "Failed to load World Cup statistics."
          );
        }

        if (
          !data ||
          typeof data !== "object"
        ) {
          throw new Error(
            "Unexpected statistics data returned by the server."
          );
        }

        setStats(data);
      } catch (error) {
        console.error(
          "Stats API error:",
          error
        );

        setError(
          error.message ||
            "Unable to load World Cup statistics."
        );
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);


  const topTitles =
    useMemo(
      () =>
        stats?.titles?.slice(
          0,
          10
        ) || [],
      [stats]
    );


  const topAppearances =
    useMemo(
      () =>
        stats?.teamAppearances?.slice(
          0,
          10
        ) || [],
      [stats]
    );


  const topTeamGoals =
    useMemo(
      () =>
        stats?.teamGoals?.slice(
          0,
          10
        ) || [],
      [stats]
    );


  const topScorers =
    useMemo(
      () =>
        stats?.topScorers?.slice(
          0,
          10
        ) || [],
      [stats]
    );


  const topPlayerAppearances =
    useMemo(
      () =>
        stats?.playerAppearances?.slice(
          0,
          10
        ) || [],
      [stats]
    );


  function getFlagUrl(
    teamName
  ) {
    const countryCodes = {
      Algeria: "dz",
      Argentina: "ar",
      Australia: "au",
      Austria: "at",
      Belgium: "be",
      Brazil: "br",
      Canada: "ca",
      Chile: "cl",
      Colombia: "co",
      Croatia: "hr",
      Czechia: "cz",
      Denmark: "dk",
      Ecuador: "ec",
      Egypt: "eg",
      England: "gb-eng",
      France: "fr",
      Germany: "de",
      Ghana: "gh",
      Hungary: "hu",
      Iran: "ir",
      Italy: "it",
      Japan: "jp",
      Mexico: "mx",
      Morocco: "ma",
      Netherlands: "nl",
      Norway: "no",
      Paraguay: "py",
      Peru: "pe",
      Poland: "pl",
      Portugal: "pt",
      Romania: "ro",
      Senegal: "sn",
      Spain: "es",
      Sweden: "se",
      Switzerland: "ch",
      Tunisia: "tn",
      Turkey: "tr",
      Uruguay: "uy",
      "United States": "us",
      "South Africa": "za",
      "South Korea": "kr",
      "Saudi Arabia": "sa",
      "New Zealand": "nz",
      "Ivory Coast": "ci",
      "Bosnia-Herzegovina": "ba",
      "Cape Verde Islands": "cv",
      Curaçao: "cw",
      "Congo DR": "cd",
      Iraq: "iq",
      Jordan: "jo",
      Uzbekistan: "uz",
      Qatar: "qa",

      Yugoslavia: "rs",
      Czechoslovakia: "cz",
      "Soviet Union": "ru",
      Scotland: "gb-sct",
      Wales: "gb-wls",
      "Northern Ireland":
        "gb-nir",
      "Republic of Ireland":
        "ie",
      "West Germany": "de",
    };


    const code =
      countryCodes[
        teamName
      ];


    if (!code) {
      return null;
    }


    return (
      `https://flagcdn.com/` +
      `${code}.svg`
    );
  }


  function RankingList({
    title,
    items,
    valueKey,
    valueLabel,
    teamMode = false,
    playerMode = false,
  }) {
    const maxValue =
      items.length > 0
        ? Math.max(
            ...items.map(
              (item) =>
                Number(
                  item[
                    valueKey
                  ]
                ) || 0
            )
          )
        : 1;


    return (
      <section className="stats-panel">
        <h2>
          {title}
        </h2>


        {items.length === 0 ? (
          <p className="stats-empty">
            No ranking data available.
          </p>
        ) : (
          <div className="stats-ranking-list">
            {items.map(
              (
                item,
                index
              ) => {
                const label =
                  teamMode
                    ? item.team
                    : item.name;


                let flagLookup =
                  null;


                if (teamMode) {
                  flagLookup =
                    item.team;
                }


                if (playerMode) {
                  flagLookup =
                    item.country;
                }


                const flagUrl =
                  flagLookup
                    ? getFlagUrl(
                        flagLookup
                      )
                    : null;


                const value =
                  Number(
                    item[
                      valueKey
                    ]
                  ) || 0;


                const barWidth =
                  maxValue > 0
                    ? (
                        value /
                        maxValue
                      ) *
                      100
                    : 0;


                return (
                  <div
                    className="stats-ranking-row"
                    key={
                      `${label}-${index}`
                    }
                  >
                    <div className="stats-rank">
                      {
                        index +
                        1
                      }
                    </div>


                    <div className="stats-ranking-content">
                      <div className="stats-ranking-header">
                        <div className="stats-ranking-name">
                          {flagUrl && (
                            <img
                              src={
                                flagUrl
                              }
                              alt=""
                              className="standings-crest"
                            />
                          )}

                          <span>
                            {
                              label
                            }
                          </span>
                        </div>


                        <strong>
                          {
                            value
                          }{" "}
                          {
                            valueLabel
                          }
                        </strong>
                      </div>


                      <div className="stats-bar-track">
                        <div
                          className="stats-bar-fill"
                          style={{
                            width:
                              `${barWidth}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>
    );
  }


  if (loading) {
    return (
      <div className="page-container">
        <div className="stats-page-header">
          <p className="section-eyebrow">
            All-Time Records
          </p>

          <h1>
            World Cup Statistics
          </h1>

          <p>
            Loading World Cup
            statistics...
          </p>
        </div>
      </div>
    );
  }


  if (
    error ||
    !stats
  ) {
    return (
      <div className="page-container">
        <div className="stats-page-header">
          <p className="section-eyebrow">
            All-Time Records
          </p>

          <h1>
            World Cup Statistics
          </h1>

          <p>
            FIFA Men's World Cup
            records and rankings.
          </p>
        </div>


        <div className="stats-error">
          <strong>
            Unable to load
            statistics.
          </strong>

          <p>
            {error ||
              "Statistics data is unavailable."}
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="page-container">
      <div className="stats-page-header">
        <p className="section-eyebrow">
          All-Time Records
        </p>

        <h1>
          World Cup Statistics
        </h1>

        <p>
          All-time FIFA Men's
          World Cup team and player
          records.
        </p>
      </div>


      <h2 className="stats-section-title">
        All-Time Team Records
      </h2>


      <div className="stats-grid">
        <RankingList
          title="Most World Cup Titles"
          items={topTitles}
          valueKey="count"
          valueLabel="titles"
          teamMode
        />


        <RankingList
          title="Most World Cup Appearances"
          items={topAppearances}
          valueKey="count"
          valueLabel="appearances"
          teamMode
        />


        <RankingList
          title="Most World Cup Goals"
          items={topTeamGoals}
          valueKey="count"
          valueLabel="goals"
          teamMode
        />
      </div>


      <h2 className="stats-section-title">
        All-Time Player Records
      </h2>


      <div className="stats-grid stats-grid-two">
        <RankingList
          title="All-Time Top Scorers"
          items={topScorers}
          valueKey="goals"
          valueLabel="goals"
          playerMode
        />


        <RankingList
          title="Most Match Appearances"
          items={
            topPlayerAppearances
          }
          valueKey="appearances"
          valueLabel="matches"
          playerMode
        />
      </div>
    </div>
  );
}


export default Stats;