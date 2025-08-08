const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";


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
  console.log("API_URL from .env:", process.env.REACT_APP_API_URL);
  const response = await fetch(`${API_URL}/api/v1/health/analyze-image`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Image analysis failed');
  return response.json();
}

export async function analyzeNailHemoglobin(
  file: File,
  userAge?: number,
  symptoms?: string[]
) {
  const formData = new FormData();
  formData.append('file', file);
  if (userAge !== undefined) formData.append('user_age', String(userAge));
  if (symptoms && symptoms.length > 0) formData.append('symptoms', JSON.stringify(symptoms));

  console.log("Analyzing nail hemoglobin with API_URL:", API_URL);
  const response = await fetch(`${API_URL}/api/v1/health/analyze-hemoglobin`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    if (response.status === 503) {
      throw new Error('Nail hemoglobin analysis is currently unavailable. Please check that the model files are installed.');
    }
    const error = await response.text();
    throw new Error(`Nail hemoglobin analysis failed: ${error}`);
  }
  
  return response.json();
}

export async function checkHemoglobinServiceStatus() {
  console.log("Checking hemoglobin service status...");
  const response = await fetch(`${API_URL}/api/v1/health/hemoglobin-status`);
  
  if (!response.ok) {
    throw new Error('Failed to check service status');
  }
  
  return response.json();
}