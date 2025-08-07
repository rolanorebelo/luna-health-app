const API_URL = process.env.REACT_APP_API_URL;

export async function analyzeHealthImage(
  file: File,
  analysisType: string,
  symptoms?: any,
  userAge?: number,
  userPhase?: string
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('analysis_type', analysisType);
  if (symptoms) formData.append('symptoms', JSON.stringify(symptoms));
  if (userAge !== undefined) formData.append('user_age', String(userAge));
  if (userPhase) formData.append('user_phase', userPhase);

  // 👇 Update the endpoint here:
  const response = await fetch(`${API_URL}/api/v1/health/analyze-image`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Image analysis failed');
  return response.json();
}