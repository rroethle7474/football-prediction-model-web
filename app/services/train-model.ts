const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function deleteModel(modelName: string, password: string): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/deleteModel`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            modelName: modelName,
            password: password
        })
    });
    
    if (!response.ok) {
        throw new Error('Failed to delete model');
    }
  
    return response.json();
}

export async function trainModel(modelName: string, trainingSplit: number, modelDescription: string, password: string): Promise<{ status: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/trainModel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      modelName: modelName,
      trainingSplit: 1 - trainingSplit/100, // Convert from percentage to decimal
      modelDescription: modelDescription, // Add the new field
      password: password,
    }),
  });

  if (!response.ok) {
    console.log("ERROR IN TRAIN MODEL")
    throw new Error('Failed to train model');
  }

  return response.json();
}