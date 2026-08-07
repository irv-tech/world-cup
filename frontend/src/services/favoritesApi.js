const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

export async function deleteFavoriteTeam(favoriteId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}/favorites/teams/${favoriteId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to remove favorite");
  }

  return data;
}

export async function addFavoritePlayer(player) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}/favorites/players`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(player),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to add favorite player");
  }

  return data;
}

export async function getFavoritePlayers() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}/favorites/players`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load favorite players");
  }

  return await response.json();
}

export async function deleteFavoritePlayer(favoriteId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}/favorites/players/${favoriteId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to remove favorite player");
  }

  return data;
}