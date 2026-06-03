const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getTeams() {
  try {
    const response = await fetch(`${BASE_URL}/teams`);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    console.log("Teams from backend:", data);

    return data;
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
}

export async function getPlayers() {
  try {
    const response = await fetch(`${BASE_URL}/players`);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
}

export async function getMatches() {
  try {
    const response = await fetch(`${BASE_URL}/matches`);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
}