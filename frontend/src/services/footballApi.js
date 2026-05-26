const BASE_URL = "http://127.0.0.1:8000";

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