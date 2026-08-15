export const TEAM_LINEAGES = [
  {
    key: "germany",
    canonicalName: "Germany",
    memberNames: [
      "Germany",
      "West Germany",
      "East Germany",
    ],
  },

  {
    key: "russia",
    canonicalName: "Russia",
    memberNames: [
      "Russia",
      "Soviet Union",
    ],
  },

  {
    key: "serbia",
    canonicalName: "Serbia",
    memberNames: [
      "Serbia",
      "Serbia and Montenegro",
      "Yugoslavia",
    ],
  },

  {
    key: "czech",
    canonicalName: "Czech Republic",
    memberNames: [
      "Czech Republic",
      "Czechoslovakia",
    ],
  },

  {
    key: "indonesia",
    canonicalName: "Indonesia",
    memberNames: [
      "Dutch East Indies",
    ],
  },

  {
    key: "congo-dr",
    canonicalName: "Congo DR",
    memberNames: [
      "Congo DR",
      "Zaire",
    ],
  },
];


export function findTeamLineage(teamName) {
  return TEAM_LINEAGES.find(
    (lineage) =>
      lineage.memberNames.includes(teamName)
  );
}


export function getCanonicalTeamName(teamName) {
  const lineage =
    findTeamLineage(teamName);

  return lineage
    ? lineage.canonicalName
    : teamName;
}


export function getLineageTeams(
  allTeams,
  lineage
) {
  if (!lineage) {
    return [];
  }

  return lineage.memberNames
    .map((name) =>
      allTeams.find(
        (team) => team.name === name
      )
    )
    .filter(Boolean);
}


export function buildCanonicalTeams(
  allTeams,
  selectedYear = null
) {
  const consumedTeamIds =
    new Set();

  const canonicalTeams = [];


  TEAM_LINEAGES.forEach(
    (lineage) => {
      const lineageTeams =
        getLineageTeams(
          allTeams,
          lineage
        );


      if (
        lineageTeams.length === 0
      ) {
        return;
      }


      let participatingTeams =
        lineageTeams;


      if (selectedYear) {
        participatingTeams =
          lineageTeams.filter(
            (team) =>
              team.tournaments?.includes(
                selectedYear
              )
          );


        if (
          participatingTeams.length ===
          0
        ) {
          return;
        }
      }


      const representative =
        participatingTeams[0];


      const allTitles = [
        ...new Set(
          lineageTeams.flatMap(
            (team) =>
              team.titles || []
          )
        ),
      ].sort(
        (a, b) => a - b
      );


      const allTournaments = [
        ...new Set(
          lineageTeams.flatMap(
            (team) =>
              team.tournaments || []
          )
        ),
      ].sort(
        (a, b) => b - a
      );


      canonicalTeams.push({
        ...representative,

        displayName:
          lineage.canonicalName,

        lineageKey:
          lineage.key,

        lineageMemberNames:
          lineage.memberNames,

        titleCount:
          allTitles.length,

        titles:
          allTitles,

        tournaments:
          allTournaments,

        editionIdentities:
          selectedYear
            ? participatingTeams.map(
                (team) =>
                  team.name
              )
            : [],
      });


      lineageTeams.forEach(
        (team) => {
          consumedTeamIds.add(
            team.teamId
          );
        }
      );
    }
  );


  allTeams.forEach((team) => {
    if (
      consumedTeamIds.has(
        team.teamId
      )
    ) {
      return;
    }


    if (
      selectedYear &&
      !team.tournaments?.includes(
        selectedYear
      )
    ) {
      return;
    }


    canonicalTeams.push({
      ...team,

      displayName:
        team.name,

      lineageKey: null,

      lineageMemberNames: [
        team.name,
      ],

      editionIdentities:
        selectedYear
          ? [team.name]
          : [],
    });
  });


  return canonicalTeams;
}


/*
 * Creates one dropdown option for every
 * team identity + tournament combination.
 *
 * This matters for cases like Germany
 * in 1974, when both West Germany and
 * East Germany competed.
 */
export function buildEditionOptions(
  lineageTeams,
  canonicalName
) {
  const rawOptions = [];


  lineageTeams.forEach((team) => {
    const years =
      team.tournaments || [];


    years.forEach((year) => {
      rawOptions.push({
        year,
        teamId:
          team.teamId,

        identityName:
          team.name,
      });
    });
  });


  const identityCountByYear = {};

  rawOptions.forEach((option) => {
    identityCountByYear[
      option.year
    ] =
      (
        identityCountByYear[
          option.year
        ] || 0
      ) + 1;
  });


  const options =
    rawOptions.map(
      (option) => {
        const hasMultipleIdentities =
          identityCountByYear[
            option.year
          ] > 1;


        const isHistoricalName =
          option.identityName !==
          canonicalName;


        let label =
          `${option.year} World Cup`;


        /*
         * Show the historical identity
         * whenever it differs from the
         * modern/canonical name.
         *
         * Examples:
         *
         * 1990 World Cup — West Germany
         * 1990 World Cup — Soviet Union
         * 1938 World Cup — Dutch East Indies
         *
         * For duplicate-year cases such as
         * Germany 1974, both identities will
         * naturally receive separate labels.
         */
        if (
          isHistoricalName ||
          hasMultipleIdentities
        ) {
          label +=
            ` — ${option.identityName}`;
        }


        return {
          ...option,
          label,
          hasMultipleIdentities,
        };
      }
    );


  /*
   * Sort newest year first.
   *
   * If two identities share the same
   * tournament year, preserve lineage
   * team order.
   */
  return options.sort(
    (a, b) => {
      if (b.year !== a.year) {
        return b.year - a.year;
      }


      const aIndex =
        lineageTeams.findIndex(
          (team) =>
            team.teamId ===
            a.teamId
        );


      const bIndex =
        lineageTeams.findIndex(
          (team) =>
            team.teamId ===
            b.teamId
        );


      return aIndex - bIndex;
    }
  );
}


export function resolveEditionOption(
  editionOptions,
  requestedYear = null,
  requestedIdentityId = null
) {
  if (
    editionOptions.length === 0
  ) {
    return null;
  }


  /*
   * Best case:
   * URL specifies both year and identity.
   */
  if (
    requestedYear &&
    requestedIdentityId
  ) {
    const exactMatch =
      editionOptions.find(
        (option) =>
          option.year ===
            requestedYear &&
          option.teamId ===
            requestedIdentityId
      );


    if (exactMatch) {
      return exactMatch;
    }
  }


  /*
   * If only year is supplied,
   * choose the first lineage identity
   * for that year.
   */
  if (requestedYear) {
    const yearMatch =
      editionOptions.find(
        (option) =>
          option.year ===
          requestedYear
      );


    if (yearMatch) {
      return yearMatch;
    }
  }


  /*
   * No valid request:
   * newest available edition.
   */
  return editionOptions[0];
}