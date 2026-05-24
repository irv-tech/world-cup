const API_KEY = import.meta.env.VITE_API_KEY;

const BASE_URL = "https://api.football-data.org/v4";

export async function getTeams() {
  try {
    const response = await fetch(
      `${BASE_URL}/competitions/WC/teams`,
      {
        headers: {
          "X-Auth-Token": API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    console.log(data);

    return data.teams || [];
  } catch (error) {
    console.error("API Error:", error);

    return [];
  }
}