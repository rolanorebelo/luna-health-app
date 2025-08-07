# NAIL HEMOGLOBIN ANALYSIS SERVICE
# Standalone service for nail detection and hemoglobin prediction

import torch
import torch.nn as nn
from torchvision import transforms, models
from torchvision.models.detection import fasterrcnn_resnet50_fpn
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor
from PIL import Image
import numpy as np
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class NailDetector:
    """Nail detection model wrapper"""
    
    def __init__(self, model_path: str, device: str = 'cpu'):
        self.device = torch.device(device)
        self.model = self._load_model(model_path)
        
    def _load_model(self, model_path: str):
        """Load the trained nail detection model"""
        # Create model architecture
        model = fasterrcnn_resnet50_fpn(weights=None)
        in_features = model.roi_heads.box_predictor.cls_score.in_features
        model.roi_heads.box_predictor = FastRCNNPredictor(in_features, 2)  # 2 classes
        
        # Load trained weights
        checkpoint = torch.load(model_path, map_location=self.device, weights_only=False)
        if 'model_state_dict' in checkpoint:
            model.load_state_dict(checkpoint['model_state_dict'])
        else:
            model.load_state_dict(checkpoint)
        
        model.to(self.device)
        model.eval()
        return model
    
    def detect_nails(self, image: Image.Image, confidence_threshold: float = 0.5) -> Dict[str, Any]:
        """
        Detect nails in an image and return bounding boxes
        
        Args:
            image: PIL Image object
            confidence_threshold: Minimum confidence for detections
            
        Returns:
            dict: Dictionary containing detection results
        """
        # Ensure RGB format
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Preprocess image
        image_tensor = transforms.ToTensor()(image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            predictions = self.model(image_tensor)
        
        # Extract predictions
        pred = predictions[0]
        boxes = pred['boxes'].cpu().numpy()
        scores = pred['scores'].cpu().numpy()
        labels = pred['labels'].cpu().numpy()
        
        # Filter by confidence and nail class (label == 1)
        nail_mask = (scores >= confidence_threshold) & (labels == 1)
        nail_boxes = boxes[nail_mask].tolist()
        nail_scores = scores[nail_mask].tolist()
        
        return {
            'boxes': nail_boxes,
            'scores': nail_scores,
            'image': image,
            'num_nails': len(nail_boxes),
            'image_size': image.size
        }

class ScaleCorrectedHemoglobinModel(nn.Module):
    """Scale-corrected hemoglobin prediction model"""
    
    def __init__(self, base_model, scale_factor: float, shift_factor: float):
        super().__init__()
        self.base_model = base_model
        self.scale_factor = scale_factor
        self.shift_factor = shift_factor
        
    def forward(self, x):
        raw_output = self.base_model(x)
        corrected_output = raw_output * self.scale_factor + self.shift_factor
        return corrected_output

class HemoglobinPredictor:
    """Hemoglobin prediction model wrapper"""
    
    def __init__(self, model_path: str, device: str = 'cpu'):
        self.device = torch.device(device)
        self.model = self._load_model(model_path)
        self.transform = self._get_transform()
        
    def _load_model(self, model_path: str):
        """Load the trained hemoglobin prediction model"""
        checkpoint = torch.load(model_path, map_location=self.device, weights_only=False)
        
        # Create base ResNet model
        base_model = models.resnet18(weights=None)
        base_model.fc = nn.Linear(base_model.fc.in_features, 1)
        
        # Load scale correction parameters
        if 'scale_factor' in checkpoint and 'shift_factor' in checkpoint:
            # Scale-corrected model
            base_model.load_state_dict(checkpoint['base_model_state_dict'])
            model = ScaleCorrectedHemoglobinModel(
                base_model=base_model,
                scale_factor=checkpoint['scale_factor'],
                shift_factor=checkpoint['shift_factor']
            )
        else:
            # Regular model (apply default scale correction)
            base_model.load_state_dict(checkpoint['model_state_dict'] if 'model_state_dict' in checkpoint else checkpoint)
            # Default scale correction values
            model = ScaleCorrectedHemoglobinModel(
                base_model=base_model,
                scale_factor=5.5185,  # Update with your actual values
                shift_factor=35.9938   # Update with your actual values
            )
        
        model.to(self.device)
        model.eval()
        return model
    
    def _get_transform(self):
        """Get preprocessing transform for nail images"""
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    
    def predict_hemoglobin(self, nail_image: Image.Image) -> float:
        """
        Predict hemoglobin level from nail image
        
        Args:
            nail_image: PIL Image of nail region
            
        Returns:
            float: Predicted hemoglobin level in g/L
        """
        # Preprocess image
        image_tensor = self.transform(nail_image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            prediction = self.model(image_tensor)
            return prediction.item()

class NailHemoglobinService:
    """Complete service for nail detection and hemoglobin prediction"""
    
    def __init__(self):
        # Auto-detect device
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {self.device}")
        
        # Model paths - go up to backend directory then to models
        models_dir = Path(__file__).parent.parent.parent / "models"
        self.nail_model_path = models_dir / "nail_detection_model_final.pth"
        self.hemoglobin_model_path = models_dir / "hemoglobin_model_scale_corrected_FINAL.pth"
        
        # Initialize models as None - they'll be loaded on first use
        self.nail_detector = None
        self.hemoglobin_predictor = None
        self._models_initialized = False
        
    def _initialize_models(self):
        """Initialize both models - called only when needed"""
        if self._models_initialized:
            return
            
        try:
            if not self.nail_model_path.exists():
                raise FileNotFoundError(f"Nail detection model not found: {self.nail_model_path}")
            
            if not self.hemoglobin_model_path.exists():
                raise FileNotFoundError(f"Hemoglobin model not found: {self.hemoglobin_model_path}")
            
            logger.info("Loading nail detection model...")
            self.nail_detector = NailDetector(str(self.nail_model_path), self.device)
            
            logger.info("Loading hemoglobin prediction model...")
            self.hemoglobin_predictor = HemoglobinPredictor(str(self.hemoglobin_model_path), self.device)
            
            self._models_initialized = True
            logger.info("Nail hemoglobin service initialized successfully!")
            
        except Exception as e:
            logger.error(f"Error initializing models: {str(e)}")
            raise
    
    async def analyze_hemoglobin(
        self, 
        image: Image.Image, 
        user_age: Optional[int] = None,
        symptoms: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Complete pipeline: detect nails and predict hemoglobin
        
        Args:
            image: PIL Image of finger/nail
            user_age: User's age for context
            symptoms: List of user-reported symptoms
            
        Returns:
            dict: Complete analysis results
        """
        try:
            # Initialize models if not already done
            if not self._models_initialized:
                self._initialize_models()
            
            logger.info("Starting nail hemoglobin analysis...")
            
            # Step 1: Detect nails
            logger.info("Detecting nails...")
            nail_results = self.nail_detector.detect_nails(image, confidence_threshold=0.5)
            
            if nail_results['num_nails'] == 0:
                logger.warning("No nails detected in image")
                return {
                    'success': False,
                    'message': 'No nails detected in the image. Please ensure nails are clearly visible.',
                    'nail_analysis': {
                        'num_nails_detected': 0,
                        'individual_predictions': [],
                        'average_hemoglobin_g_per_L': 0
                    }
                }
            
            logger.info(f"Detected {nail_results['num_nails']} nail(s)")
            
            # Step 2: Predict hemoglobin for each nail
            logger.info("Predicting hemoglobin levels...")
            hemoglobin_predictions = []
            
            for i, (box, score) in enumerate(zip(nail_results['boxes'], nail_results['scores'])):
                x1, y1, x2, y2 = [int(coord) for coord in box]
                
                # Crop nail region
                nail_crop = image.crop((x1, y1, x2, y2))
                
                # Predict hemoglobin
                hb_level = self.hemoglobin_predictor.predict_hemoglobin(nail_crop)
                
                hemoglobin_predictions.append({
                    'nail_id': i + 1,
                    'bounding_box': box,
                    'confidence': score,
                    'hemoglobin_g_per_L': hb_level,
                    'nail_size': nail_crop.size
                })
                
                logger.info(f"Nail {i+1}: {hb_level:.1f} g/L (confidence: {score:.3f})")
            
            # Calculate average hemoglobin
            avg_hemoglobin = np.mean([pred['hemoglobin_g_per_L'] for pred in hemoglobin_predictions])
            
            # Determine risk level
            anemia_risk = self._assess_anemia_risk(avg_hemoglobin)
            severity = self._assess_severity(avg_hemoglobin)
            
            # Create structured response
            analysis_result = {
                'success': True,
                'nail_analysis': {
                    'num_nails_detected': nail_results['num_nails'],
                    'individual_predictions': hemoglobin_predictions,
                    'average_hemoglobin_g_per_L': float(avg_hemoglobin)
                },
                'anemia_risk': anemia_risk,
                'severity': severity,
                'timestamp': datetime.now().isoformat()
            }
            
            logger.info(f"Analysis complete - Average Hb: {avg_hemoglobin:.1f} g/L")
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error in hemoglobin analysis: {str(e)}")
            return {
                'success': False,
                'message': f'Analysis failed: {str(e)}',
                'nail_analysis': {
                    'num_nails_detected': 0,
                    'individual_predictions': [],
                    'average_hemoglobin_g_per_L': 0
                }
            }
    
    def _assess_anemia_risk(self, hemoglobin_level: float) -> str:
        """Assess anemia risk based on hemoglobin level"""
        if hemoglobin_level < 120:
            return 'high'
        elif hemoglobin_level < 140:
            return 'moderate'
        else:
            return 'low'
    
    def _assess_severity(self, hemoglobin_level: float) -> str:
        """Assess severity based on hemoglobin level"""
        if hemoglobin_level < 120:
            return 'high'
        elif hemoglobin_level < 140:
            return 'moderate'
        else:
            return 'low'
    
    def get_interpretation(self, hemoglobin_level: float) -> Dict[str, str]:
        """Get interpretation of hemoglobin level"""
        if hemoglobin_level < 120:
            return {
                'status': 'Low',
                'interpretation': 'Possible anemia - consult healthcare provider',
                'color': 'red'
            }
        elif hemoglobin_level < 140:
            return {
                'status': 'Borderline',
                'interpretation': 'Monitor levels and consider dietary improvements',
                'color': 'yellow'
            }
        else:
            return {
                'status': 'Normal',
                'interpretation': 'Healthy hemoglobin levels',
                'color': 'green'
            }
    
    def check_models_available(self) -> Dict[str, Any]:
        """Check if model files are available"""
        nail_model_exists = self.nail_model_path.exists()
        hemoglobin_model_exists = self.hemoglobin_model_path.exists()
        
        return {
            'nail_detection_model': {
                'path': str(self.nail_model_path),
                'available': nail_model_exists
            },
            'hemoglobin_model': {
                'path': str(self.hemoglobin_model_path),
                'available': hemoglobin_model_exists
            },
            'models_ready': nail_model_exists and hemoglobin_model_exists,
            'device': self.device
        }
