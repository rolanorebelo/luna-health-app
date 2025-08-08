import React, { useState } from 'react';
import imageAnalysisService from '../services/imageAnalysisService';

const ImageAnalysis = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisType, setAnalysisType] = useState('skin');
  const [symptoms, setSymptoms] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleAnalysis = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await imageAnalysisService.analyzeHealthImage(
        selectedFile,
        analysisType,
        {
          symptoms: symptoms,
          userAge: 28, // Get from user profile
          userPhase: 'follicular' // Get from cycle tracking
        }
      );
      
      setResults(result);
    } catch (err) {
      setError('Analysis failed. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const symptomOptions = {
    skin: ['Itching', 'Redness', 'Pain', 'Swelling', 'Dryness'],
    discharge: ['Odor', 'Itching', 'Burning', 'Pain', 'Unusual amount']
  };

  return (
    <div className="image-analysis-container p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">AI Health Analysis</h2>
      
      {/* Analysis Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Analysis Type</label>
        <select 
          value={analysisType} 
          onChange={(e) => setAnalysisType(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="skin">Skin Analysis</option>
          <option value="discharge">Discharge Analysis</option>
        </select>
      </div>

      {/* File Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Upload Image</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileSelect}
          className="w-full p-2 border rounded"
        />
        {selectedFile && (
          <p className="text-sm text-gray-600 mt-1">
            Selected: {selectedFile.name}
          </p>
        )}
      </div>

      {/* Symptoms Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Additional Symptoms (Optional)
        </label>
        <div className="space-y-2">
          {symptomOptions[analysisType].map(symptom => (
            <label key={symptom} className="flex items-center">
              <input
                type="checkbox"
                value={symptom}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSymptoms([...symptoms, symptom]);
                  } else {
                    setSymptoms(symptoms.filter(s => s !== symptom));
                  }
                }}
                className="mr-2"
              />
              {symptom}
            </label>
          ))}
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalysis}
        disabled={isAnalyzing || !selectedFile}
        className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600 disabled:bg-gray-300"
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Analysis Results</h3>
          
          {/* Disclaimers */}
          <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400">
            <p className="text-sm text-gray-700">
              ⚠️ This is educational information only, not a medical diagnosis.
            </p>
          </div>

          {/* Image Analysis Results */}
          <div className="mb-4">
            <h4 className="font-medium mb-2">Visual Analysis</h4>
            <p className="text-sm text-gray-600">
              {results.image_analysis?.description}
            </p>
            <p className="text-sm mt-1">
              Confidence: {(results.image_analysis?.confidence * 100).toFixed(0)}%
            </p>
          </div>

          {/* Health Assessment */}
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">Condition Overview</h4>
              <p className="text-sm text-gray-600">
                {results.health_assessment?.condition_overview}
              </p>
            </div>

            <div>
              <h4 className="font-medium">Severity</h4>
              <span className={`inline-block px-2 py-1 text-xs rounded ${
                results.health_assessment?.severity === 'low' ? 'bg-green-100 text-green-800' :
                results.health_assessment?.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {results.health_assessment?.severity}
              </span>
            </div>

            <div>
              <h4 className="font-medium">Self-Care Recommendations</h4>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {results.health_assessment?.self_care?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium">See a Healthcare Provider If:</h4>
              <ul className="list-disc list-inside text-sm text-red-600">
                {results.health_assessment?.seek_care_if?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalysis;