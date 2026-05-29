const BASE_URL = "http://127.0.0.1:8000";

export async function addFavoriteTeam(team) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}/favorites/teams`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(team),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to add favorite");
  }

  return data;
}

export async function getFavoriteTeams() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}/favorites/teams`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load favorites");
  }

  return await response.json();
}