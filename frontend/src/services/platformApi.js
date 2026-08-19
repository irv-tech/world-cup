const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";


export async function getPlatformSummary() {
  const response = await fetch(
    `${API_BASE_URL}/platform/summary`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load platform summary."
    );
  }

  return response.json();
}


export async function getPlatformTeams(year = null) {
  const url = year
    ? `${API_BASE_URL}/platform/teams?year=${year}`
    : `${API_BASE_URL}/platform/teams`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      "Failed to load World Cup teams."
    );
  }

  return response.json();
}


export async function getPlatformTeam(
  teamId,
  year = null
) {
  const url = year
    ? `${API_BASE_URL}/platform/teams/${teamId}?year=${year}`
    : `${API_BASE_URL}/platform/teams/${teamId}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      "Failed to load team details."
    );
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

export async function getPlatformTournament(year) {
  const response = await fetch(
    `${API_BASE_URL}/platform/tournaments/${year}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load tournament data."
    );
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}