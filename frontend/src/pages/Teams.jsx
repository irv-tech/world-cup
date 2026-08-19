import {
  useEffect,
  useMemo,
  useState,
} from "react";

import TeamCard from "../components/TeamCard";

import {
  getPlatformTeams,
} from "../services/platformApi";

import {
  buildCanonicalTeams,
} from "../data/teamIdentity";


function Teams() {
  const [
    allTeams,
    setAllTeams,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    selectedYear,
    setSelectedYear,
  ] = useState("");

  const [
    championsOnly,
    setChampionsOnly,
  ] = useState(false);

  const [
    sortOption,
    setSortOption,
  ] = useState("name");


  const tournamentYears = [
    2026,
    2022,
    2018,
    2014,
    2010,
    2006,
    2002,
    1998,
    1994,
    1990,
    1986,
    1982,
    1978,
    1974,
    1970,
    1966,
    1962,
    1958,
    1954,
    1950,
    1938,
    1934,
    1930,
  ];


  useEffect(() => {
    async function loadTeams() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getPlatformTeams();

        if (!Array.isArray(data)) {
          throw new Error(
            "Unexpected team data returned by the server."
          );
        }

        setAllTeams(data);
      } catch (err) {
        console.error(
          "Platform teams API error:",
          err
        );

        setError(
          err.message ||
            "Unable to load World Cup teams."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTeams();
  }, []);


  const teams =
    useMemo(() => {
      const year =
        selectedYear
          ? Number(selectedYear)
          : null;

      return buildCanonicalTeams(
        allTeams,
        year
      );
    }, [
      allTeams,
      selectedYear,
    ]);


  const filteredTeams =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return [...teams]
        .filter((team) => {
          if (!search) {
            return true;
          }

          const displayName =
            team.displayName
              ?.toLowerCase() || "";

          const matchesDisplayName =
            displayName.includes(
              search
            );

          const matchesHistoricalIdentity =
            team.editionIdentities
              ?.some(
                (identity) =>
                  identity
                    .toLowerCase()
                    .includes(
                      search
                    )
              );

          return (
            matchesDisplayName ||
            matchesHistoricalIdentity
          );
        })
        .filter((team) => {
          if (!championsOnly) {
            return true;
          }

          return (
            team.titleCount > 0
          );
        })
        .sort((a, b) => {
          if (
            sortOption ===
            "championships"
          ) {
            if (
              b.titleCount !==
              a.titleCount
            ) {
              return (
                b.titleCount -
                a.titleCount
              );
            }
          }

          return (
            a.displayName.localeCompare(
              b.displayName
            )
          );
        });
    }, [
      teams,
      searchTerm,
      championsOnly,
      sortOption,
    ]);


  function handleClearFilters() {
    setSearchTerm("");
    setSelectedYear("");
    setChampionsOnly(false);
    setSortOption("name");
  }


  const hasActiveFilters =
    Boolean(
      searchTerm ||
      selectedYear ||
      championsOnly ||
      sortOption !== "name"
    );


  if (loading) {
    return (
      <div className="page-container">
        <div className="teams-page-header">
          <p className="section-eyebrow">
            National Teams
          </p>

          <h1>
            World Cup Teams
          </h1>

          <p>
            Loading World Cup teams...
          </p>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="page-container">
        <div className="teams-page-header">
          <p className="section-eyebrow">
            National Teams
          </p>

          <h1>
            World Cup Teams
          </h1>

          <p>
            Explore national teams
            across every FIFA Men's
            World Cup.
          </p>
        </div>

        <div className="teams-error">
          <strong>
            Unable to load teams.
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
      <div className="teams-page-header">
        <p className="section-eyebrow">
          National Teams
        </p>

        <h1>
          World Cup Teams
        </h1>

        <p>
          Explore countries across
          every FIFA Men's World Cup,
          including historical
          identities and
          edition-specific squads.
        </p>
      </div>


      <section className="teams-filter-panel">
        <div className="filters">
          <input
            type="text"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            className="search-input"
          />


          <select
            value={selectedYear}
            onChange={(event) =>
              setSelectedYear(
                event.target.value
              )
            }
            className="filter-select"
          >
            <option value="">
              All World Cups
            </option>

            {tournamentYears.map(
              (year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              )
            )}
          </select>


          <select
            value={sortOption}
            onChange={(event) =>
              setSortOption(
                event.target.value
              )
            }
            className="filter-select"
          >
            <option value="name">
              Sort by Name
            </option>

            <option value="championships">
              Sort by Championships
            </option>
          </select>


          <label className="checkbox-filter">
            <input
              type="checkbox"
              checked={
                championsOnly
              }
              onChange={(event) =>
                setChampionsOnly(
                  event.target.checked
                )
              }
            />

            Champions only
          </label>


          {hasActiveFilters && (
            <button
              type="button"
              className="clear-filters-button"
              onClick={
                handleClearFilters
              }
            >
              Clear Filters
            </button>
          )}
        </div>
      </section>


      <div className="teams-results-header">
        <p className="teams-result-count">
          Showing{" "}
          <strong>
            {
              filteredTeams.length
            }
          </strong>{" "}
          {selectedYear
            ? `countries represented at the ${selectedYear} World Cup`
            : "World Cup countries"}
        </p>
      </div>


      {filteredTeams.length ===
      0 ? (
        <div className="teams-empty-state">
          <h2>
            No teams found
          </h2>

          <p>
            No teams match your
            current filters.
          </p>

          <button
            type="button"
            onClick={
              handleClearFilters
            }
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {filteredTeams.map(
            (team) => (
              <TeamCard
                key={
                  team.lineageKey ||
                  team.teamId
                }
                team={team}
                selectedYear={
                  selectedYear
                    ? Number(
                        selectedYear
                      )
                    : null
                }
              />
            )
          )}
        </div>
      )}
    </div>
  );
}


export default Teams;