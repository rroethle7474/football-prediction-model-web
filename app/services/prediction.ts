interface PredictionResponse {
  predictions: {
    away_team: {
      passing_attempts: number;
      passing_yards: number;
      rushing_attempts: number;
      rushing_yards: number;
      team: string;
      time_of_possession: number;
    };
    home_team: {
      passing_attempts: number;
      passing_yards: number;
      rushing_attempts: number;
      rushing_yards: number;
      team: string;
      time_of_possession: number;
    };
  };
  status: string;
}

interface ModelsResponse {
  models: string[];
  status: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getPrediction(homeTeam: string, awayTeam: string, modelName: string): Promise<PredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      homeTeam,
      awayTeam,
      modelName
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch prediction');
  }

  return response.json();
}

export async function getModels(): Promise<ModelsResponse> {
  const response = await fetch(`${API_BASE_URL}/models`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch models');
  }

  return response.json();
}
