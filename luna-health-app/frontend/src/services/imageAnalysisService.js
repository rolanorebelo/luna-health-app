// Create this file in your existing React app

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

class ImageAnalysisService {
  async analyzeHealthImage(imageFile, analysisType, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('analysis_type', analysisType);
    
    // Add symptoms if provided
    if (additionalData.symptoms && additionalData.symptoms.length > 0) {
      formData.append('symptoms', JSON.stringify(additionalData.symptoms));
    }
    
    // Add user context
    if (additionalData.userAge) {
      formData.append('user_age', additionalData.userAge);
    }
    
    if (additionalData.userPhase) {
      formData.append('user_phase', additionalData.userPhase);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/health/analyze-image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Image analysis error:', error);
      throw error;
    }
  }
}

export default new ImageAnalysisService();