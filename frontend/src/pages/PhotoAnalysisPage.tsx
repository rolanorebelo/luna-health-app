import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeHealthImage, analyzeNailHemoglobin, analyzePatterns } from '../services/healthApi';
import { Camera, Upload, X, CheckCircle, AlertTriangle, Info, Zap, Eye, Microscope, Sparkles, Droplets, Target } from 'lucide-react';

// Mock user profile for demo
const mockProfile = {
  firstName: 'Sarah',
  age: 28,
  reproductiveStage: 'sexually-active'
};

const PhotoAnalysisPage: React.FC = () => {
  const profile = mockProfile;
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<'skin' | 'discharge' | 'symptom' | 'general' | 'hemoglobin' | 'patterns'>('skin');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const analysisTypes = [
    {
      id: 'skin',
      name: 'Skin Analysis',
      icon: <Eye className="w-6 h-6" />,
      description: 'Analyze acne, rashes, discoloration, or other skin concerns',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'discharge',
      name: 'Discharge Check',
      icon: <Microscope className="w-6 h-6" />,
      description: 'Analyze vaginal discharge color, consistency, and potential concerns',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'symptom',
      name: 'Symptom Visual',
      icon: <AlertTriangle className="w-6 h-6" />,
      description: 'Visual analysis of physical symptoms or changes',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'general',
      name: 'General Health',
      icon: <Sparkles className="w-6 h-6" />,
      description: 'Overall health assessment from visual indicators',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'hemoglobin',
      name: 'Nail Hemoglobin',
      icon: <Droplets className="w-6 h-6" />,
      description: 'Analyze hemoglobin levels through nail color analysis',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'patterns',
      name: 'Pattern Detection',
      icon: <Target className="w-6 h-6" />,
      description: 'Detect and count LC droplet patterns (circular vs cross)',
      color: 'from-orange-500 to-amber-500'
    }
  ];

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please upload an image instead.');
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            handleImageSelect(file);
          }
        }, 'image/jpeg', 0.8);
      }
      
      // Stop camera
      const stream = video.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setShowCamera(false);
    }
  }, []);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setAnalysisResult(null);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageSelect(file);
    }
  };

  const performAnalysis = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      let result;
      
      if (analysisType === 'hemoglobin') {
        // Use nail hemoglobin analysis
        result = await analyzeNailHemoglobin(
          selectedImage,
          profile?.age,
          undefined // symptoms can be added later if needed
        );
      } else if (analysisType === 'patterns') {
        // Use pattern detection analysis
        result = await analyzePatterns(
          selectedImage,
          50,   // min_area
          5000, // max_area
          0.5   // confidence_threshold
        );
      } else {
        // Use regular health image analysis
        result = await analyzeHealthImage(
          selectedImage,
          analysisType,
          undefined, // or pass symptoms if you have them
          profile?.age,
          profile?.reproductiveStage
        );
      }
      
      setAnalysisResult(result);
      // console.log(result); // Uncomment to debug API response
    } catch (err) {
      alert('Analysis failed. Please try again.');
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setShowCamera(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Photo Analysis</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {analysisType === 'hemoglobin' 
            ? 'Analyze your hemoglobin levels through nail color analysis. Take a clear photo of your fingernails in good lighting.'
            : 'Get instant insights about your health through advanced AI image analysis. Take a photo or upload an image for personalized health assessment.'
          }
        </p>
      </motion.div>

      {/* Analysis Type Selection */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {analysisTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setAnalysisType(type.id as any)}
            className={`p-4 rounded-2xl border-2 transition-all text-left ${
              analysisType === type.id
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-xl bg-gradient-to-r ${type.color} text-white`}>
                {type.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{type.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{type.description}</p>
              </div>
              {analysisType === type.id && (
                <CheckCircle className="w-5 h-5 text-purple-600" />
              )}
            </div>
          </button>
        ))}
      </motion.div>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Take Photo</h3>
                <button
                  onClick={() => setShowCamera(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-xl mb-4"
              />
              
              <div className="flex space-x-3">
                <button
                  onClick={capturePhoto}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Capture Photo
                </button>
                <button
                  onClick={() => setShowCamera(false)}
                  className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Upload/Capture */}
      {!selectedImage && (
        <motion.div 
          className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={startCamera}
                className="p-6 border-2 border-dashed border-purple-300 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
              >
                <Camera className="w-8 h-8 text-purple-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-gray-900 mb-1">Take Photo</h3>
                <p className="text-sm text-gray-600">Use your camera for instant analysis</p>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-gray-300 rounded-2xl hover:border-gray-500 hover:bg-gray-50 transition-all group"
              >
                <Upload className="w-8 h-8 text-gray-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-gray-900 mb-1">Upload Image</h3>
                <p className="text-sm text-gray-600">Choose from your device</p>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />

            <div className="mt-6 space-y-4">
              {/* Special instructions for nail hemoglobin analysis */}
              {analysisType === 'hemoglobin' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <Droplets className="w-5 h-5 text-red-600 mx-auto mb-2" />
                  <p className="text-sm text-red-800 mb-2">
                    <strong>📸 Nail Photography Tips:</strong>
                  </p>
                  <ul className="text-sm text-red-700 space-y-1 text-left max-w-md mx-auto">
                    <li>• Ensure good, natural lighting</li>
                    <li>• Clean nails without polish</li>
                    <li>• Hold hand steady, nails facing camera</li>
                    <li>• Include all fingernails if possible</li>
                    <li>• Avoid shadows over the nail area</li>
                  </ul>
                </div>
              )}
              
              <div className="p-4 bg-blue-50 rounded-xl">
                <Info className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-800">
                  <strong>Privacy Note:</strong> Images are analyzed locally and securely. 
                  Your photos are never stored or shared.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Selected Image Preview */}
      {selectedImage && imagePreview && !analysisResult && (
        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Ready for Analysis</h3>
            <button
              onClick={resetAnalysis}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <img
                src={imagePreview}
                alt="Selected for analysis"
                className="w-full rounded-xl shadow-sm"
              />
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-medium text-gray-900 mb-2">Analysis Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{analysisTypes.find(t => t.id === analysisType)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">User Age:</span>
                    <span className="font-medium">{profile?.age || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stage:</span>
                    <span className="font-medium capitalize">{profile?.reproductiveStage?.replace('-', ' ') || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={performAnalysis}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 font-medium flex items-center justify-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Start AI Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Overall Assessment */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Analysis Complete</h3>
              <button
                onClick={resetAnalysis}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                New Analysis
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={imagePreview || ''}
                  alt="Analyzed image"
                  className="w-full rounded-xl shadow-sm"
                />
              </div>

              <div className="space-y-4">
                {/* Hemoglobin-specific results */}
                {analysisType === 'hemoglobin' && analysisResult.nail_analysis && (
                  <div className="space-y-4">
                    {/* Hemoglobin Level Display */}
                    <div className={`p-4 rounded-xl ${
                      analysisResult.nail_analysis.average_hemoglobin_g_per_L < 120
                        ? 'bg-red-50 border border-red-200'
                        : analysisResult.nail_analysis.average_hemoglobin_g_per_L < 140
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-green-50 border border-green-200'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <Droplets className={`w-5 h-5 ${
                          analysisResult.nail_analysis.average_hemoglobin_g_per_L < 120
                            ? 'text-red-600'
                            : analysisResult.nail_analysis.average_hemoglobin_g_per_L < 140
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`} />
                        <h4 className={`font-semibold ${
                          analysisResult.nail_analysis.average_hemoglobin_g_per_L < 120
                            ? 'text-red-800'
                            : analysisResult.nail_analysis.average_hemoglobin_g_per_L < 140
                            ? 'text-yellow-800'
                            : 'text-green-800'
                        }`}>
                          Hemoglobin Level: {analysisResult.nail_analysis.average_hemoglobin_g_per_L.toFixed(1)} g/L
                        </h4>
                      </div>
                      <p className={`text-sm ${
                        analysisResult.nail_analysis.average_hemoglobin_g_per_L < 120
                          ? 'text-red-700'
                          : analysisResult.nail_analysis.average_hemoglobin_g_per_L < 140
                          ? 'text-yellow-700'
                          : 'text-green-700'
                      }`}>
                        {analysisResult.nail_analysis.average_hemoglobin_g_per_L < 120
                          ? 'Low hemoglobin detected - possible anemia'
                          : analysisResult.nail_analysis.average_hemoglobin_g_per_L < 140
                          ? 'Borderline hemoglobin levels - monitor closely'
                          : 'Normal hemoglobin levels detected'}
                      </p>
                      <div className="mt-2 text-xs text-gray-600">
                        Normal range for women: 120-160 g/L
                      </div>
                    </div>
                  </div>
                )}

                {/* Pattern Detection Results */}
                {analysisType === 'patterns' && analysisResult.pattern_analysis && (
                  <div className="space-y-4">
                    {/* Pattern Summary */}
                    <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-5 h-5 text-orange-600" />
                        <h4 className="font-semibold text-orange-800">
                          Pattern Detection Results
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="text-center p-3 bg-white rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {analysisResult.pattern_analysis.circular_patterns}
                          </div>
                          <div className="text-sm text-gray-600">Circular Patterns</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg">
                          <div className="text-2xl font-bold text-red-600">
                            {analysisResult.pattern_analysis.cross_patterns}
                          </div>
                          <div className="text-sm text-gray-600">Cross Patterns</div>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-lg font-semibold text-orange-800">
                          Total: {analysisResult.pattern_analysis.total_patterns_detected} patterns detected
                        </div>
                        {analysisResult.pattern_analysis.uncertain_patterns > 0 && (
                          <div className="text-sm text-gray-600 mt-1">
                            ({analysisResult.pattern_analysis.uncertain_patterns} uncertain)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pattern Distribution */}
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <h5 className="font-medium text-gray-800 mb-3">Pattern Distribution</h5>
                      <div className="space-y-2">
                        {analysisResult.pattern_analysis.circular_patterns > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Bipolar-Circle</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{
                                    width: `${(analysisResult.pattern_analysis.circular_patterns / analysisResult.pattern_analysis.total_patterns_detected) * 100}%`
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">
                                {Math.round((analysisResult.pattern_analysis.circular_patterns / analysisResult.pattern_analysis.total_patterns_detected) * 100)}%
                              </span>
                            </div>
                          </div>
                        )}
                        {analysisResult.pattern_analysis.cross_patterns > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Radial-Cross</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-red-500 h-2 rounded-full" 
                                  style={{
                                    width: `${(analysisResult.pattern_analysis.cross_patterns / analysisResult.pattern_analysis.total_patterns_detected) * 100}%`
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">
                                {Math.round((analysisResult.pattern_analysis.cross_patterns / analysisResult.pattern_analysis.total_patterns_detected) * 100)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Regular health assessment results */}
                {analysisResult.health_assessment && (
                  <div className={`p-4 rounded-xl ${
                    analysisResult.health_assessment.severity === 'low'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      {analysisResult.health_assessment.severity === 'low' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      )}
                      <h4 className={`font-semibold ${
                        analysisResult.health_assessment.severity === 'low'
                          ? 'text-green-800'
                          : 'text-yellow-800'
                      }`}>
                        {analysisResult.health_assessment.severity === 'low'
                          ? 'All Clear'
                          : 'Attention Needed'}
                      </h4>
                    </div>
                    <p className={`text-sm ${
                      analysisResult.health_assessment.severity === 'low'
                        ? 'text-green-700'
                        : 'text-yellow-700'
                    }`}>
                      {analysisResult.health_assessment.condition_overview}
                    </p>
                  </div>
                )}

                {/* Doctor visit recommendation */}
                {analysisResult.health_assessment?.seek_care_if?.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <h4 className="font-semibold text-red-800">Doctor Consultation Recommended</h4>
                    </div>
                    <ul className="list-disc pl-6 text-sm text-red-700">
                      {analysisResult.health_assessment.seek_care_if.map((reason: string, idx: number) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Findings */}
          {analysisType !== 'patterns' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Detailed Findings</h4>
              <div className="space-y-4">
                {/* Show image classifications if present */}
                {analysisResult.image_analysis?.classifications?.map((item: any, index: number) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{item.label}</h5>
                      <span className="px-3 py-1 rounded-full text-xs font-medium text-purple-700 bg-purple-50">
                        {(item.score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}

                {/* Show possible causes if present */}
                {analysisResult.health_assessment?.possible_causes?.map((cause: string, index: number) => (
                  <div key={index} className="p-2 text-sm text-gray-700">
                    • {cause}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysisType !== 'patterns' && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Personalized Recommendations</h4>
              <div className="space-y-3">
                {analysisResult.health_assessment?.self_care?.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-purple-600">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700">{rec}</p>
                  </div>
                ))}
                {/* Disclaimers */}
                {analysisResult.health_assessment?.disclaimers?.length > 0 && (
                  <div className="mt-4 text-xs text-gray-500 space-y-1">
                    {analysisResult.health_assessment.disclaimers.map((d: string, i: number) => (
                      <div key={i}>* {d}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-50 transition-all font-medium">
              Save to History
            </button>
            <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium">
              Chat with WIHHMS AI
            </button>
          </div>
        </motion.div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default PhotoAnalysisPage;