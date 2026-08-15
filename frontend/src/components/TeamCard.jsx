import {
  Link,
} from "react-router-dom";

import {
  addFavoriteTeam,
} from "../services/favoritesApi";


const countryCodes = {
  Algeria: "dz",
  Angola: "ao",
  Argentina: "ar",
  Australia: "au",
  Austria: "at",
  Belgium: "be",
  Bolivia: "bo",
  "Bosnia and Herzegovina": "ba",
  Brazil: "br",
  Bulgaria: "bg",
  Cameroon: "cm",
  Canada: "ca",
  "Cape Verde Islands": "cv",
  Chile: "cl",
  China: "cn",
  Colombia: "co",
  "Congo DR": "cd",
  "Costa Rica": "cr",
  Croatia: "hr",
  Cuba: "cu",
  Curaçao: "cw",
  "Czech Republic": "cz",
  Denmark: "dk",
  Ecuador: "ec",
  Egypt: "eg",
  "El Salvador": "sv",
  England: "gb-eng",
  France: "fr",
  Germany: "de",
  Ghana: "gh",
  Greece: "gr",
  Haiti: "ht",
  Honduras: "hn",
  Hungary: "hu",
  Iceland: "is",
  Indonesia: "id",
  Iran: "ir",
  Iraq: "iq",
  Israel: "il",
  Italy: "it",
  "Ivory Coast": "ci",
  Jamaica: "jm",
  Japan: "jp",
  Jordan: "jo",
  Kuwait: "kw",
  Mexico: "mx",
  Morocco: "ma",
  Netherlands: "nl",
  "New Zealand": "nz",
  Nigeria: "ng",
  "North Korea": "kp",
  "Northern Ireland": "gb-nir",
  Norway: "no",
  Panama: "pa",
  Paraguay: "py",
  Peru: "pe",
  Poland: "pl",
  Portugal: "pt",
  Qatar: "qa",
  "Republic of Ireland": "ie",
  Romania: "ro",
  Russia: "ru",
  "Saudi Arabia": "sa",
  Scotland: "gb-sct",
  Senegal: "sn",
  Serbia: "rs",
  Slovakia: "sk",
  Slovenia: "si",
  "South Africa": "za",
  "South Korea": "kr",
  Spain: "es",
  Sweden: "se",
  Switzerland: "ch",
  Togo: "tg",
  "Trinidad and Tobago": "tt",
  Tunisia: "tn",
  Turkey: "tr",
  Ukraine: "ua",
  "United Arab Emirates": "ae",
  "United States": "us",
  Uruguay: "uy",
  Uzbekistan: "uz",
  Wales: "gb-wls",
};


function getFlagUrl(teamName) {
  const code =
    countryCodes[teamName];

  if (!code) {
    return null;
  }

  return (
    `https://flagcdn.com/` +
    `${code}.svg`
  );
}


function TeamCard({
  team,
  selectedYear,
}) {
  const displayName =
    team.displayName ||
    team.name;

  const flagUrl =
    getFlagUrl(displayName);


  const teamDetailsUrl =
    selectedYear
      ? `/teams/${team.teamId}?year=${selectedYear}`
      : `/teams/${team.teamId}`;


  const championshipStars =
    team.titleCount > 0
      ? "★".repeat(
          team.titleCount
        )
      : "";


  const historicalIdentities =
    selectedYear
      ? (
          team.editionIdentities ||
          []
        ).filter(
          (identity) =>
            identity !==
            displayName
        )
      : [];


  async function handleAddFavorite() {
    try {
      const favoriteTeam = {
        id: team.teamId,
        name: displayName,
        tla: team.code,
        crest: flagUrl,
      };

      await addFavoriteTeam(
        favoriteTeam
      );

      alert(
        `${displayName} added to favorites`
      );
    } catch (error) {
      alert(error.message);
    }
  }


  return (
    <div className="card team-card">
      {flagUrl && (
        <img
          src={flagUrl}
          alt={`${displayName} flag`}
          className="team-card-flag"
        />
      )}


      <h2>
        {displayName}
      </h2>


      {championshipStars && (
        <div
          className="championship-stars"
          title={
            `${team.titleCount} ` +
            "World Cup championships"
          }
          aria-label={
            `${team.titleCount} ` +
            "World Cup championships"
          }
        >
          {championshipStars}
        </div>
      )}


      {historicalIdentities.length >
        0 && (
        <div className="team-card-edition-context">
          <span>
            {selectedYear}
          </span>

          <small>
            {historicalIdentities.join(
              " · "
            )}
          </small>
        </div>
      )}


      <div className="team-card-actions">
        <Link
          to={teamDetailsUrl}
          className="team-details-link"
        >
          View Team Details
        </Link>


        <button
          type="button"
          onClick={
            handleAddFavorite
          }
        >
          Add to Favorites
        </button>
      </div>
    </div>
  );
}


export default TeamCard;