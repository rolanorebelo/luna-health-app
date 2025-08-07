import base64
import io
import cv2
import numpy as np
from PIL import Image
import torch
import torch.nn as nn
from torchvision import transforms, models
from typing import Dict, Any, List, Optional, Tuple
import openai
from openai import OpenAI
import logging
import os
from app.core.config import settings

logger = logging.getLogger(__name__)

class MedicalResNet(nn.Module):
    """Custom ResNet model for medical image classification"""
    
    def __init__(self, num_classes: int = 13):
        super(MedicalResNet, self).__init__()
        # Load pre-trained ResNet-50
        self.backbone = models.resnet50(pretrained=True)
        
        # Freeze early layers for transfer learning
        for param in list(self.backbone.parameters())[:-20]:
            param.requires_grad = False
            
        # Replace final layer for medical classification
        num_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(num_features, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, num_classes)
        )
        
    def forward(self, x):
        return self.backbone(x)

class ImagePreprocessor:
    """Advanced image preprocessing pipeline for medical images"""
    
    def __init__(self):
        self.transform = transforms.Compose([
            transforms.Resize(settings.IMAGE_SIZE),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    
    def enhance_image(self, image: np.ndarray) -> np.ndarray:
        """Apply CLAHE and denoising to enhance medical image quality"""
        # Convert to LAB color space for better processing
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        
        # Apply CLAHE to L channel
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        lab[:, :, 0] = clahe.apply(lab[:, :, 0])
        
        # Convert back to RGB
        enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
        
        # Apply Gaussian denoising
        enhanced = cv2.bilateralFilter(enhanced, 9, 75, 75)
        
        return enhanced
    
    def adjust_contrast_brightness(self, image: np.ndarray, 
                                 contrast: float = 1.2, 
                                 brightness: float = 10) -> np.ndarray:
        """Adjust contrast and brightness for better analysis"""
        adjusted = cv2.convertScaleAbs(image, alpha=contrast, beta=brightness)
        return adjusted
    
    def preprocess_for_analysis(self, pil_image: Image.Image) -> Tuple[Image.Image, np.ndarray]:
        """Complete preprocessing pipeline for medical image analysis"""
        # Convert PIL to numpy array
        image_array = np.array(pil_image)
        if len(image_array.shape) == 3 and image_array.shape[2] == 4:
            # Remove alpha channel if present
            image_array = image_array[:, :, :3]
        
        # Apply enhancements
        enhanced = self.enhance_image(image_array)
        enhanced = self.adjust_contrast_brightness(enhanced)
        
        # Convert back to PIL for compatibility
        enhanced_pil = Image.fromarray(enhanced)
        
        return enhanced_pil, enhanced

class ImageQualityValidator:
    """Validates image quality for medical analysis"""
    
    def __init__(self):
        self.min_size = settings.MIN_IMAGE_SIZE
        self.max_dimension = settings.MAX_IMAGE_DIMENSION
        self.blur_threshold = settings.BLUR_THRESHOLD
    
    def calculate_blur_score(self, image: np.ndarray) -> float:
        """Calculate image blur score using Laplacian variance"""
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        else:
            gray = image
        
        return cv2.Laplacian(gray, cv2.CV_64F).var()
    
    def validate_resolution(self, image: Image.Image) -> Dict[str, Any]:
        """Validate image resolution and aspect ratio"""
        width, height = image.size
        
        return {
            "width": width,
            "height": height,
            "meets_min_size": width >= self.min_size[0] and height >= self.min_size[1],
            "within_max_dimension": width <= self.max_dimension and height <= self.max_dimension,
            "aspect_ratio": width / height,
            "is_square_like": 0.75 <= (width / height) <= 1.33
        }
    
    def assess_quality(self, pil_image: Image.Image, 
                      image_array: np.ndarray) -> Dict[str, Any]:
        """Comprehensive image quality assessment"""
        blur_score = self.calculate_blur_score(image_array)
        resolution_info = self.validate_resolution(pil_image)
        
        # Calculate overall quality score
        quality_factors = {
            "sharpness": min(blur_score / self.blur_threshold, 1.0),
            "resolution": 1.0 if resolution_info["meets_min_size"] else 0.5,
            "aspect_ratio": 1.0 if resolution_info["is_square_like"] else 0.8
        }
        
        overall_quality = np.mean(list(quality_factors.values()))
        
        return {
            "blur_score": blur_score,
            "is_sharp": blur_score > self.blur_threshold,
            "resolution_info": resolution_info,
            "quality_factors": quality_factors,
            "overall_quality": overall_quality,
            "suitable_for_analysis": overall_quality >= settings.QUALITY_THRESHOLD
        }

class VisionAnalysisService:
    """Enhanced medical image analysis service using GPT-4 Vision and ResNet"""
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.preprocessor = ImagePreprocessor()
        self.quality_validator = ImageQualityValidator()
        
        # Initialize ResNet model
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.medical_classes = settings.SKIN_CONDITIONS + settings.DISCHARGE_CONDITIONS
        self.resnet_model = MedicalResNet(num_classes=len(self.medical_classes))
        
        # Load trained model if available
        if os.path.exists(settings.RESNET_MODEL_PATH):
            try:
                self.resnet_model.load_state_dict(
                    torch.load(settings.RESNET_MODEL_PATH, map_location=self.device)
                )
                self.resnet_model.eval()
                logger.info("Loaded trained ResNet model")
            except Exception as e:
                logger.warning(f"Could not load ResNet model: {e}")
        else:
            logger.info("Using untrained ResNet model - training recommended")
        
        self.resnet_model.to(self.device)
    
    def encode_image_for_openai(self, image: Image.Image) -> str:
        """Encode image as base64 for OpenAI API"""
        buffered = io.BytesIO()
        image.save(buffered, format="JPEG", quality=95)
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return f"data:image/jpeg;base64,{img_str}"
    
    def get_gpt4_vision_analysis(self, image: Image.Image, analysis_type: str) -> Dict[str, Any]:
        """Get analysis from GPT-4 Vision with medical prompts"""
        
        # Specialized prompts for medical analysis
        prompts = {
            "skin": """
            As a medical AI assistant, analyze this skin image and provide:
            1. Detailed visual description of the skin condition
            2. Identification of any visible abnormalities, lesions, or conditions
            3. Color variations, texture changes, and patterns
            4. Size and distribution of any lesions
            5. Potential differential diagnoses (educational purposes only)
            6. Recommendations for medical consultation if concerning features are present
            
            Important: This is for educational purposes only and should not replace professional medical advice.
            """,
            
            "discharge": """
            As a medical AI assistant, analyze this vaginal discharge image and provide:
            1. Color characteristics and consistency description
            2. Volume and texture assessment
            3. Any visible abnormalities or concerning features
            4. Comparison to normal discharge variations
            5. Potential causes based on visual characteristics
            6. Recommendations for medical evaluation if abnormal features are present
            
            Important: This analysis is for educational purposes only and should not replace professional medical evaluation.
            """
        }
        
        try:
            encoded_image = self.encode_image_for_openai(image)
            
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompts.get(analysis_type, prompts["skin"])
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": encoded_image,
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=500
            )
            
            analysis = response.choices[0].message.content
            
            return {
                "gpt4_analysis": analysis,
                "model_used": settings.OPENAI_MODEL,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"GPT-4 Vision analysis failed: {e}")
            return {
                "gpt4_analysis": "GPT-4 Vision analysis unavailable",
                "error": str(e),
                "success": False
            }
    
    def get_resnet_prediction(self, image: Image.Image) -> Dict[str, Any]:
        """Get prediction from trained ResNet model"""
        try:
            # Preprocess image for ResNet
            input_tensor = self.preprocessor.transform(image).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                outputs = self.resnet_model(input_tensor)
                probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
                
                # Get top 3 predictions
                top_probs, top_indices = torch.topk(probabilities, 3)
                
                predictions = []
                for i, (prob, idx) in enumerate(zip(top_probs, top_indices)):
                    predictions.append({
                        "class": self.medical_classes[idx.item()],
                        "confidence": prob.item(),
                        "rank": i + 1
                    })
                
                return {
                    "predictions": predictions,
                    "top_prediction": predictions[0] if predictions else None,
                    "all_probabilities": probabilities.cpu().numpy().tolist(),
                    "success": True
                }
                
        except Exception as e:
            logger.error(f"ResNet prediction failed: {e}")
            return {
                "predictions": [],
                "top_prediction": None,
                "error": str(e),
                "success": False
            }
    
    def calculate_ensemble_confidence(self, gpt4_result: Dict, resnet_result: Dict) -> float:
        """Calculate ensemble confidence score from multiple models"""
        confidence_factors = []
        
        # GPT-4 Vision confidence (based on success and response quality)
        if gpt4_result.get("success", False):
            gpt4_confidence = 0.8  # Base confidence for successful GPT-4 analysis
            if len(gpt4_result.get("gpt4_analysis", "")) > 100:
                gpt4_confidence = 0.9
            confidence_factors.append(gpt4_confidence)
        
        # ResNet confidence
        if resnet_result.get("success", False) and resnet_result.get("top_prediction"):
            resnet_confidence = resnet_result["top_prediction"]["confidence"]
            confidence_factors.append(resnet_confidence)
        
        # Return average if we have any confidence factors
        if confidence_factors:
            return np.mean(confidence_factors)
        else:
            return 0.3  # Low confidence when both models fail
    
    async def analyze_skin_condition(self, image: Image.Image) -> Dict[str, Any]:
        """Enhanced skin condition analysis"""
        try:
            # Preprocess image
            enhanced_image, enhanced_array = self.preprocessor.preprocess_for_analysis(image)
            
            # Validate image quality
            quality_assessment = self.quality_validator.assess_quality(image, enhanced_array)
            
            # Get GPT-4 Vision analysis
            gpt4_result = self.get_gpt4_vision_analysis(enhanced_image, "skin")
            
            # Get ResNet prediction
            resnet_result = self.get_resnet_prediction(enhanced_image)
            
            # Calculate ensemble confidence
            ensemble_confidence = self.calculate_ensemble_confidence(gpt4_result, resnet_result)
            
            # Extract skin concerns from ResNet predictions
            skin_concerns = []
            if resnet_result.get("predictions"):
                for pred in resnet_result["predictions"]:
                    if pred["confidence"] > 0.3:  # Only include reasonably confident predictions
                        skin_concerns.append({
                            "condition": pred["class"],
                            "confidence": pred["confidence"]
                        })
            
            return {
                "analysis_type": "skin_condition",
                "gpt4_vision": gpt4_result,
                "resnet_classification": resnet_result,
                "skin_concerns": skin_concerns,
                "quality_assessment": quality_assessment,
                "ensemble_confidence": ensemble_confidence,
                "recommendations": self._get_skin_recommendations(resnet_result, quality_assessment),
                "timestamp": "2024-01-15T10:30:00Z",
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Skin condition analysis failed: {e}")
            return {
                "analysis_type": "skin_condition",
                "error": str(e),
                "success": False,
                "ensemble_confidence": 0.0
            }
    
    async def analyze_discharge(self, image: Image.Image) -> Dict[str, Any]:
        """Enhanced discharge analysis"""
        try:
            # Preprocess image
            enhanced_image, enhanced_array = self.preprocessor.preprocess_for_analysis(image)
            
            # Validate image quality
            quality_assessment = self.quality_validator.assess_quality(image, enhanced_array)
            
            # Get GPT-4 Vision analysis
            gpt4_result = self.get_gpt4_vision_analysis(enhanced_image, "discharge")
            
            # Get ResNet prediction
            resnet_result = self.get_resnet_prediction(enhanced_image)
            
            # Calculate ensemble confidence
            ensemble_confidence = self.calculate_ensemble_confidence(gpt4_result, resnet_result)
            
            # Advanced color analysis
            color_analysis = self._advanced_color_analysis(enhanced_array)
            
            # Health indicators based on discharge characteristics
            health_indicators = self._get_discharge_health_indicators(resnet_result, color_analysis)
            
            return {
                "analysis_type": "discharge",
                "gpt4_vision": gpt4_result,
                "resnet_classification": resnet_result,
                "color_analysis": color_analysis,
                "health_indicators": health_indicators,
                "quality_assessment": quality_assessment,
                "ensemble_confidence": ensemble_confidence,
                "recommendations": self._get_discharge_recommendations(resnet_result, quality_assessment),
                "timestamp": "2024-01-15T10:30:00Z",
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Discharge analysis failed: {e}")
            return {
                "analysis_type": "discharge",
                "error": str(e),
                "success": False,
                "ensemble_confidence": 0.0
            }
    
    def _advanced_color_analysis(self, image_array: np.ndarray) -> Dict[str, Any]:
        """Advanced color analysis for discharge characteristics"""
        # Convert to different color spaces for analysis
        hsv = cv2.cvtColor(image_array, cv2.COLOR_RGB2HSV)
        lab = cv2.cvtColor(image_array, cv2.COLOR_RGB2LAB)
        
        # Calculate color statistics
        rgb_mean = np.mean(image_array, axis=(0, 1))
        hsv_mean = np.mean(hsv, axis=(0, 1))
        lab_mean = np.mean(lab, axis=(0, 1))
        
        # Determine dominant color category
        color_category = self._categorize_discharge_color(rgb_mean)
        
        return {
            "dominant_color": color_category,
            "rgb_values": rgb_mean.tolist(),
            "hsv_values": hsv_mean.tolist(),
            "lab_values": lab_mean.tolist(),
            "brightness": np.mean(rgb_mean),
            "saturation": hsv_mean[1],
            "consistency_score": self._calculate_consistency_score(image_array)
        }
    
    def _categorize_discharge_color(self, rgb: np.ndarray) -> str:
        """Categorize discharge color with medical relevance"""
        r, g, b = rgb
        
        if r > 240 and g > 240 and b > 240:
            return "clear/transparent"
        elif r > 200 and g > 200 and b > 180:
            return "white/off-white"
        elif r > 180 and g > 180 and b < 130:
            return "yellow/cream"
        elif r > 100 and g > 150 and b < 100:
            return "green/gray"
        elif r > 150 and g < 120 and b < 120:
            return "pink/red"
        elif r < 130 and g < 100 and b < 90:
            return "brown/dark"
        else:
            return "mixed/unclear"
    
    def _calculate_consistency_score(self, image_array: np.ndarray) -> float:
        """Calculate consistency/texture score of discharge"""
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        
        # Calculate texture using local standard deviation
        kernel = np.ones((9, 9), np.float32) / 81
        mean = cv2.filter2D(gray.astype(np.float32), -1, kernel)
        sqr_diff = (gray.astype(np.float32) - mean) ** 2
        texture_score = np.mean(cv2.filter2D(sqr_diff, -1, kernel))
        
        # Normalize to 0-1 range
        return min(texture_score / 1000, 1.0)
    
    def _get_skin_recommendations(self, resnet_result: Dict, quality_assessment: Dict) -> List[str]:
        """Generate skin condition recommendations"""
        recommendations = []
        
        if not quality_assessment.get("suitable_for_analysis", False):
            recommendations.append("Image quality may affect analysis accuracy - consider retaking with better lighting")
        
        if resnet_result.get("success", False) and resnet_result.get("predictions"):
            top_pred = resnet_result["predictions"][0]
            
            if top_pred["confidence"] > 0.8:
                if "melanoma" in top_pred["class"] or "carcinoma" in top_pred["class"]:
                    recommendations.append("⚠️ Potentially concerning features detected - seek immediate dermatological evaluation")
                elif "acne" in top_pred["class"]:
                    recommendations.append("Consider gentle skincare routine and avoid harsh products")
                elif "eczema" in top_pred["class"]:
                    recommendations.append("Keep skin moisturized and identify potential triggers")
            else:
                recommendations.append("Analysis confidence is moderate - consult healthcare provider for accurate diagnosis")
        else:
            recommendations.append("Unable to provide specific recommendations - consult a dermatologist for proper evaluation")
        
        recommendations.append("This analysis is for educational purposes only and not a substitute for professional medical advice")
        
        return recommendations
    
    def _get_discharge_recommendations(self, resnet_result: Dict, quality_assessment: Dict) -> List[str]:
        """Generate discharge analysis recommendations"""
        recommendations = []
        
        if not quality_assessment.get("suitable_for_analysis", False):
            recommendations.append("Image quality may affect analysis accuracy - consider retaking with better lighting")
        
        if resnet_result.get("success", False) and resnet_result.get("predictions"):
            top_pred = resnet_result["predictions"][0]
            
            if top_pred["confidence"] > 0.7:
                if "normal" in top_pred["class"]:
                    recommendations.append("Discharge appears within normal variation")
                elif "yeast" in top_pred["class"]:
                    recommendations.append("Possible yeast infection - consider consulting healthcare provider")
                elif "bacterial" in top_pred["class"]:
                    recommendations.append("Possible bacterial infection - recommend medical evaluation")
                elif "trichomoniasis" in top_pred["class"]:
                    recommendations.append("⚠️ Possible STI detected - seek immediate medical attention")
            else:
                recommendations.append("Analysis confidence is moderate - monitor symptoms and consult healthcare provider")
        else:
            recommendations.append("Unable to provide specific recommendations - consult healthcare provider for proper evaluation")
        
        recommendations.append("Track symptoms, odor, and associated discomfort")
        recommendations.append("This analysis is for educational purposes only and not a substitute for professional medical advice")
        
        return recommendations
    
    def _get_discharge_health_indicators(self, resnet_result: Dict, color_analysis: Dict) -> List[str]:
        """Generate health indicators based on discharge analysis"""
        indicators = []
        
        color = color_analysis.get("dominant_color", "")
        
        # Basic color-based indicators
        color_indicators = {
            "clear/transparent": ["Normal discharge", "Healthy vaginal environment likely"],
            "white/off-white": ["Normal variation", "Monitor for any odor or itching"],
            "yellow/cream": ["May indicate infection", "Consider medical evaluation if symptomatic"],
            "green/gray": ["Possible bacterial infection", "Recommend medical consultation"],
            "pink/red": ["Blood present", "May be normal depending on cycle timing"],
            "brown/dark": ["Old blood likely", "Monitor if outside expected menstrual period"]
        }
        
        indicators.extend(color_indicators.get(color, ["Color characteristics unclear - monitor symptoms"]))
        
        # Add ResNet-based indicators if available
        if resnet_result.get("success", False) and resnet_result.get("predictions"):
            for pred in resnet_result["predictions"][:2]:  # Top 2 predictions
                if pred["confidence"] > 0.5:
                    indicators.append(f"AI Analysis: {pred['class']} (confidence: {pred['confidence']:.1%})")
        
        return indicators