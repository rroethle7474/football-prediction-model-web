interface UpdateStatsResponse {
  message: string;
  status: string;
}

interface ClearCacheResponse {
  message: string;
  status: string;
}

interface GetStatsStatusResponse {
  message: string;
  status: string;
  teams: string[];
  last_updated: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function updateStats(password: string): Promise<UpdateStatsResponse> {
  const response = await fetch(`${API_BASE_URL}/updateStats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ password })
  });
  
  if (!response.ok) {
    throw new Error('Failed to update stats');
  }

  return response.json();
}

export async function clearCache(password: string): Promise<ClearCacheResponse> {
  const response = await fetch(`${API_BASE_URL}/clearCache`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ password })
  });
  if(!response.ok) {
    throw new Error('Failed to clear cache');
  }
  return response.json();
}

export async function getStatsStatus(): Promise<GetStatsStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/statsStatus`);
  if(!response.ok) {
    throw new Error('Failed to get stats status');
  }
  return response.json();
}

