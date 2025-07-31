import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, CheckCircle, AlertTriangle, Info, Zap, Eye, Microscope, Sparkles } from 'lucide-react';
// Mock user profile for demo
const mockProfile = {
  firstName: 'Sarah',
  age: 28,
  reproductiveStage: 'sexually-active'
};

interface AnalysisResult {
  type: 'skin' | 'discharge' | 'symptom' | 'general';
  findings: {
    condition: string;
    confidence: number;
    severity: 'normal' | 'mild' | 'moderate' | 'concerning';
    description: string;
  }[];
  recommendations: string[];
  needsAttention: boolean;
  suggestDoctorVisit: boolean;
  overallAssessment: string;
}

const PhotoAnalysisPage: React.FC = () => {
  const profile = mockProfile;
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<'skin' | 'discharge' | 'symptom' | 'general'>('skin');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
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
    
    // Simulate AI analysis with realistic delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock analysis results based on type and user profile
    const mockResults: Record<string, AnalysisResult> = {
      skin: {
        type: 'skin',
        findings: [
          {
            condition: 'Hormonal Acne',
            confidence: 87,
            severity: 'mild',
            description: 'Mild hormonal acne consistent with your cycle phase. Common during luteal phase.'
          },
          {
            condition: 'Skin Texture',
            confidence: 92,
            severity: 'normal',
            description: 'Overall skin texture appears healthy with good hydration levels.'
          }
        ],
        recommendations: [
          'Consider gentle salicylic acid cleanser 2-3 times per week',
          'Increase water intake during luteal phase',
          'Avoid touching face, especially around cycle day 21-28',
          'Consider zinc supplement (consult healthcare provider first)'
        ],
        needsAttention: false,
        suggestDoctorVisit: false,
        overallAssessment: 'Your skin shows typical hormonal fluctuations. The mild acne is likely cycle-related and should improve with consistent skincare routine.'
      },
      discharge: {
        type: 'discharge',
        findings: [
          {
            condition: 'Normal Ovulatory Discharge',
            confidence: 94,
            severity: 'normal',
            description: 'Clear, stretchy discharge consistent with ovulation phase.'
          }
        ],
        recommendations: [
          'This appears to be normal fertile cervical mucus',
          'Great time for conception if trying to get pregnant',
          'Use protection if avoiding pregnancy',
          'Continue monitoring changes throughout cycle'
        ],
        needsAttention: false,
        suggestDoctorVisit: false,
        overallAssessment: 'Healthy ovulatory discharge indicating peak fertility. No concerns detected.'
      },
      symptom: {
        type: 'symptom',
        findings: [
          {
            condition: 'Mild Inflammation',
            confidence: 76,
            severity: 'mild',
            description: 'Slight redness that may indicate minor irritation or sensitivity.'
          }
        ],
        recommendations: [
          'Monitor for changes over 24-48 hours',
          'Avoid harsh soaps or fragranced products',
          'Wear breathable cotton underwear',
          'Consider cooling compress if discomfort persists'
        ],
        needsAttention: true,
        suggestDoctorVisit: false,
        overallAssessment: 'Minor irritation detected. Monitor symptoms and consult healthcare provider if worsening.'
      },
      general: {
        type: 'general',
        findings: [
          {
            condition: 'Overall Health Indicators',
            confidence: 89,
            severity: 'normal',
            description: 'Visual indicators suggest good overall health and wellness.'
          }
        ],
        recommendations: [
          'Continue current health practices',
          'Maintain balanced diet rich in omega-3s',
          'Stay hydrated (8-10 glasses water daily)',
          'Regular exercise supports hormonal balance'
        ],
        needsAttention: false,
        suggestDoctorVisit: false,
        overallAssessment: 'Excellent overall health indicators. Keep up the great work with your wellness routine!'
      }
    };

    setAnalysisResult(mockResults[analysisType]);
    setIsAnalyzing(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'normal': return 'text-green-600 bg-green-50';
      case 'mild': return 'text-yellow-600 bg-yellow-50';
      case 'moderate': return 'text-orange-600 bg-orange-50';
      case 'concerning': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
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
          Get instant insights about your health through advanced AI image analysis. 
          Take a photo or upload an image for personalized health assessment.
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

            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <Info className="w-5 h-5 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-800">
                <strong>Privacy Note:</strong> Images are analyzed locally and securely. 
                Your photos are never stored or shared.
              </p>
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
                <div className={`p-4 rounded-xl ${
                  analysisResult.needsAttention ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {analysisResult.needsAttention ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    <h4 className={`font-semibold ${
                      analysisResult.needsAttention ? 'text-yellow-800' : 'text-green-800'
                    }`}>
                      {analysisResult.needsAttention ? 'Attention Needed' : 'All Clear'}
                    </h4>
                  </div>
                  <p className={`text-sm ${
                    analysisResult.needsAttention ? 'text-yellow-700' : 'text-green-700'
                  }`}>
                    {analysisResult.overallAssessment}
                  </p>
                </div>

                {analysisResult.suggestDoctorVisit && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <h4 className="font-semibold text-red-800">Doctor Consultation Recommended</h4>
                    </div>
                    <p className="text-sm text-red-700">
                      Based on the analysis, we recommend consulting with a healthcare provider for further evaluation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Findings */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Detailed Findings</h4>
            <div className="space-y-4">
              {analysisResult.findings.map((finding, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{finding.condition}</h5>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(finding.severity)}`}>
                      {finding.severity.charAt(0).toUpperCase() + finding.severity.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{finding.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Confidence:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${finding.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700">{finding.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Personalized Recommendations</h4>
            <div className="space-y-3">
              {analysisResult.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-purple-600">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-50 transition-all font-medium">
              Save to History
            </button>
            <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium">
              Chat with Luna AI
            </button>
          </div>
        </motion.div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default PhotoAnalysisPage;