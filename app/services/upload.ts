interface UploadResponse {
    status: 'success' | 'error';
    message: string;
  }
  
  const ENDPOINT_MAP: Record<string, string> = {
    offensePassingYards: 'savePassingOffenseYards',
    offenseRushingYards: 'saveRushingOffenseYards',
    defensePassingYards: 'savePassingDefense',
    defenseRushingYards: 'saveRushingDefense',
    offensePassingAttempts: 'savePassingOffenseAttempts',
    offenseRushingAttempts: 'saveRushingOffenseAttempts',
    timeOfPossession: 'saveTimeOfPossession',
    actualResults: 'saveActualResults'
  };
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  export async function uploadFile(file: File, fileType: string, password: string): Promise<UploadResponse> {
    const endpoint = ENDPOINT_MAP[fileType];
    if (!endpoint) {
      throw new Error(`Unknown file type: ${fileType}`);
    }
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);
  
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      body: formData,
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload file');
    }
  
    return {
      status: data.status,
      message: data.message
    };
  }