const BASE_URL =
  import.meta.env.VITE_API_BASE_URL;


function getAuthToken() {
  return localStorage.getItem(
    "token"
  );
}


function handleUnauthorized() {
  localStorage.removeItem(
    "token"
  );

  localStorage.removeItem(
    "username"
  );

  window.dispatchEvent(
    new Event("authChange")
  );
}


async function handleResponse(
  response,
  fallbackMessage
) {
  let data = null;

  try {
    data =
      await response.json();
  } catch {
    data = null;
  }


  if (
    response.status === 401
  ) {
    handleUnauthorized();

    throw new Error(
      "Your login session has expired. Please log in again."
    );
  }


  if (!response.ok) {
    throw new Error(
      data?.detail ||
        fallbackMessage
    );
  }


  return data;
}


export async function addFavoriteTeam(
  team
) {
  const token =
    getAuthToken();


  const response =
    await fetch(
      `${BASE_URL}/favorites/teams`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify(team),
      }
    );


  return handleResponse(
    response,
    "Failed to add favorite team."
  );
}


export async function getFavoriteTeams() {
  const token =
    getAuthToken();


  const response =
    await fetch(
      `${BASE_URL}/favorites/teams`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );


  return handleResponse(
    response,
    "Failed to load favorite teams."
  );
}


export async function deleteFavoriteTeam(
  favoriteId
) {
  const token =
    getAuthToken();


  const response =
    await fetch(
      `${BASE_URL}/favorites/teams/${favoriteId}`,
      {
        method: "DELETE",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );


  return handleResponse(
    response,
    "Failed to remove favorite team."
  );
}


export async function addFavoritePlayer(
  player
) {
  const token =
    getAuthToken();


  const response =
    await fetch(
      `${BASE_URL}/favorites/players`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify(player),
      }
    );


  return handleResponse(
    response,
    "Failed to add favorite player."
  );
}


export async function getFavoritePlayers() {
  const token =
    getAuthToken();


  const response =
    await fetch(
      `${BASE_URL}/favorites/players`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );


  return handleResponse(
    response,
    "Failed to load favorite players."
  );
}


export async function deleteFavoritePlayer(
  favoriteId
) {
  const token =
    getAuthToken();


  const response =
    await fetch(
      `${BASE_URL}/favorites/players/${favoriteId}`,
      {
        method: "DELETE",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );


  return handleResponse(
    response,
    "Failed to remove favorite player."
  );
}