import cv2
import numpy as np
import torch
import torch.nn as nn
from torchvision import models
from PIL import Image, ImageEnhance
import os
import io
import time
from typing import Dict, List, Tuple, Optional, Union
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PatternDetectionService:
    """
    Service for detecting and classifying LC droplet patterns using pattern-aware ResNet18
    """
    
    def __init__(self):
        self.model = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.class_names = {0: 'bipolar-circle', 1: 'radial-cross'}
        self.model_path = None
        self._models_checked = False
        logger.info(f"PatternDetectionService initialized on device: {self.device}")
    
    def create_pattern_aware_resnet18(self, num_classes=2, dropout_rate=0.5, pretrained=False):
        """Create the same pattern-aware ResNet18 architecture used in training"""
        model = models.resnet18(pretrained=pretrained)
        
        # Modify avgpool to match training architecture
        model.avgpool = nn.Sequential(
            nn.AdaptiveAvgPool2d((7, 7)),  # Preserve more spatial information
            nn.Conv2d(512, 512, 3, padding=1),  # Pattern-aware conv
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((1, 1))
        )
        
        # Enhanced classifier with pattern-specific processing
        model.fc = nn.Sequential(
            nn.Dropout(dropout_rate),
            nn.Linear(512, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout_rate * 0.5),
            nn.Linear(256, num_classes)
        )
        
        return model
    
    def check_models_available(self) -> Dict[str, any]:
        """
        Check if required model files are available
        """
        if self._models_checked and self.model_path:
            return {
                'models_ready': self.model_path is not None,
                'model_path': self.model_path,
                'device': str(self.device)
            }
        
        # Check for model files in models directory
        models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'models')
        possible_paths = [
            os.path.join(models_dir, 'pattern_aware_resnet18_final.pth'),
            os.path.join(models_dir, 'resnet18_lc_classifier.pth'),
            'pattern_aware_resnet18_final.pth',
            'resnet18_lc_classifier.pth'
        ]
        
        model_found = False
        for path in possible_paths:
            abs_path = os.path.abspath(path)
            logger.info(f"Checking for model at: {abs_path}")
            if os.path.exists(abs_path):
                self.model_path = abs_path
                model_found = True
                logger.info(f"Found model file: {abs_path}")
                break
        
        self._models_checked = True
        
        return {
            'models_ready': model_found,
            'model_path': self.model_path,
            'device': str(self.device),
            'checked_paths': possible_paths
        }
    
    def load_model(self) -> bool:
        """
        Load the trained pattern detection model
        """
        if self.model is not None:
            return True
        
        model_status = self.check_models_available()
        if not model_status['models_ready']:
            logger.error("Pattern detection model not available")
            return False
        
        logger.info(f"Attempting to load model from: {self.model_path}")
        
        try:
            # Load checkpoint
            logger.info("Loading checkpoint...")
            checkpoint = torch.load(self.model_path, map_location=self.device, weights_only=False)
            logger.info("Checkpoint loaded successfully")
            
            # Create model with pattern-aware architecture
            logger.info("Creating pattern-aware ResNet18 architecture...")
            self.model = self.create_pattern_aware_resnet18(num_classes=2, dropout_rate=0.5, pretrained=False)
            logger.info("Model architecture created")
            
            # Load trained weights
            logger.info("Loading model state dict...")
            if 'model_state_dict' in checkpoint:
                self.model.load_state_dict(checkpoint['model_state_dict'])
                logger.info("Loaded model_state_dict from checkpoint")
            else:
                self.model.load_state_dict(checkpoint)
                logger.info("Loaded direct state dict from checkpoint")
            
            logger.info("Moving model to device...")
            self.model = self.model.to(self.device)
            self.model.eval()
            logger.info("Model moved to device and set to eval mode")
            
            # Get class mapping from checkpoint and normalize to lowercase
            if 'class_to_idx' in checkpoint:
                class_to_idx = checkpoint['class_to_idx']
                # Convert to lowercase for consistency (Bipolar-Circle -> bipolar-circle)
                self.class_names = {v: k.lower() for k, v in class_to_idx.items()}
                logger.info(f"Loaded class_to_idx: {class_to_idx}")
                logger.info(f"Normalized class names: {self.class_names}")
            elif 'idx_to_class' in checkpoint:
                idx_to_class = checkpoint['idx_to_class']
                if all(isinstance(k, str) for k in idx_to_class.keys()):
                    # Convert to lowercase for consistency
                    self.class_names = {int(k): v.lower() for k, v in idx_to_class.items()}
                else:
                    # Convert to lowercase for consistency
                    self.class_names = {k: v.lower() for k, v in idx_to_class.items()}
                logger.info(f"Loaded idx_to_class: {idx_to_class}")
                logger.info(f"Normalized class names: {self.class_names}")
            else:
                # Use default mapping with lowercase
                self.class_names = {0: 'bipolar-circle', 1: 'radial-cross'}
                logger.info("Using default class mapping")
            
            logger.info(f"Pattern detection model loaded successfully!")
            logger.info(f"Final class names: {self.class_names}")
            return True
            
        except Exception as e:
            logger.error(f"Error loading pattern detection model: {e}")
            logger.error(f"Error type: {type(e).__name__}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            self.model = None
            return False
    
    def preprocess_image(self, image: Image.Image, img_size: int = 224) -> torch.Tensor:
        """
        Preprocess image for classification with enhancement
        """
        # Convert to RGB
        image = image.convert('RGB')
        
        # Enhance contrast for better visibility of dim patterns
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.2)  # 20% more contrast
        
        # Enhance brightness slightly
        brightness_enhancer = ImageEnhance.Brightness(image)
        image = brightness_enhancer.enhance(1.1)  # 10% brighter
        
        # Resize to consistent size
        image = image.resize((img_size, img_size), Image.Resampling.LANCZOS)
        
        # Convert to tensor manually
        width, height = image.size
        pixels = list(image.getdata())
        
        tensor_data = []
        for i in range(height):
            row = []
            for j in range(width):
                pixel = pixels[i * width + j]
                row.append([pixel[0]/255.0, pixel[1]/255.0, pixel[2]/255.0])
            tensor_data.append(row)
        
        tensor = torch.tensor(tensor_data, dtype=torch.float32)
        tensor = tensor.permute(2, 0, 1)  # (H, W, C) -> (C, H, W)
        
        # ImageNet normalization
        mean = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
        std = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)
        tensor = (tensor - mean) / std
        
        return tensor
    
    def detect_patterns_improved(self, image: np.ndarray, min_area: int = 50, max_area: int = 5000, 
                                expand_ratio: float = 0.4, merge_distance: int = 30) -> List[Tuple[int, int, int, int]]:
        """
        Improved pattern detection that works better for both circular and cross patterns
        """
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Use intensity-based thresholding
        _, binary = cv2.threshold(blurred, 30, 255, cv2.THRESH_BINARY)
        
        # Morphological closing to merge nearby bright pixels
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
        
        # Additional opening to remove noise
        kernel_small = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel_small)
        
        # Find contours
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter contours based on area
        candidate_bboxes = []
        for contour in contours:
            area = cv2.contourArea(contour)
            
            if min_area <= area <= max_area:
                x, y, w, h = cv2.boundingRect(contour)
                
                # Expand bounding box to capture full pattern
                pad_w = int(w * expand_ratio)
                pad_h = int(h * expand_ratio)
                x = max(0, x - pad_w)
                y = max(0, y - pad_h)
                w = min(image.shape[1] - x, w + 2 * pad_w)
                h = min(image.shape[0] - y, h + 2 * pad_h)
                
                candidate_bboxes.append((x, y, w, h))
        
        # Merge nearby bboxes
        merged_bboxes = self.merge_nearby_boxes(candidate_bboxes, merge_distance)
        
        return merged_bboxes
    
    def merge_nearby_boxes(self, bboxes: List[Tuple[int, int, int, int]], distance_threshold: int = 30) -> List[Tuple[int, int, int, int]]:
        """
        Merge bounding boxes that are close to each other
        """
        if len(bboxes) <= 1:
            return bboxes
        
        merged = []
        used = [False] * len(bboxes)
        
        for i, bbox1 in enumerate(bboxes):
            if used[i]:
                continue
                
            x1, y1, w1, h1 = bbox1
            cx1, cy1 = x1 + w1//2, y1 + h1//2
            
            group = [bbox1]
            used[i] = True
            
            for j, bbox2 in enumerate(bboxes):
                if used[j] or i == j:
                    continue
                    
                x2, y2, w2, h2 = bbox2
                cx2, cy2 = x2 + w2//2, y2 + h2//2
                
                distance = np.sqrt((cx1 - cx2)**2 + (cy1 - cy2)**2)
                
                if distance < distance_threshold:
                    group.append(bbox2)
                    used[j] = True
            
            if len(group) == 1:
                merged.append(group[0])
            else:
                min_x = min(x for x, y, w, h in group)
                min_y = min(y for x, y, w, h in group)
                max_x = max(x + w for x, y, w, h in group)
                max_y = max(y + h for x, y, w, h in group)
                
                merged.append((min_x, min_y, max_x - min_x, max_y - min_y))
        
        return merged
    
    def classify_pattern(self, crop_image: Image.Image, confidence_threshold: float = 0.5) -> Tuple[str, float]:
        """
        Classify a single pattern crop
        """
        if crop_image is None:
            return "unknown", 0.0
        
        try:
            # Transform image
            input_tensor = self.preprocess_image(crop_image).unsqueeze(0).to(self.device)
            
            # Classify
            with torch.no_grad():
                outputs = self.model(input_tensor)
                probabilities = torch.softmax(outputs, dim=1)
                confidence, predicted = torch.max(probabilities, 1)
                
                class_idx = predicted.item()
                confidence_score = confidence.item()
                
                if confidence_score >= confidence_threshold:
                    class_name = self.class_names.get(class_idx, f"class_{class_idx}")
                else:
                    class_name = "uncertain"
                
                return class_name, confidence_score
        
        except Exception as e:
            logger.error(f"Classification error: {e}")
            return "error", 0.0
    
    def extract_pattern_crop(self, image: np.ndarray, bbox: Tuple[int, int, int, int]) -> Optional[Image.Image]:
        """
        Extract pattern crop from image using bounding box
        """
        x, y, w, h = bbox
        
        # Ensure valid coordinates
        x = max(0, x)
        y = max(0, y)
        w = min(w, image.shape[1] - x)
        h = min(h, image.shape[0] - y)
        
        if w <= 0 or h <= 0:
            return None
        
        # Crop and convert to PIL
        crop = image[y:y+h, x:x+w]
        pil_crop = Image.fromarray(cv2.cvtColor(crop, cv2.COLOR_BGR2RGB))
        
        return pil_crop
    
    async def analyze_patterns(self, image: Union[Image.Image, io.BytesIO], 
                              min_area: int = 50, max_area: int = 5000,
                              confidence_threshold: float = 0.5) -> Dict[str, any]:
        """
        Main analysis function - detect and classify patterns in an image
        """
        # Load model if not already loaded
        if not self.load_model():
            return {
                'success': False,
                'message': 'Pattern detection model not available',
                'pattern_analysis': {}
            }
        
        try:
            # Convert PIL to opencv format
            if isinstance(image, Image.Image):
                image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            else:
                # If it's BytesIO, convert to PIL first then to OpenCV
                pil_image = Image.open(image)
                image_cv = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
            
            # Detect pattern bounding boxes
            bboxes = self.detect_patterns_improved(image_cv, min_area, max_area)
            
            # Classify each detected pattern
            detections = []
            pattern_counts = {
                'bipolar-circle': 0,
                'radial-cross': 0,
                'uncertain': 0,
                'error': 0
            }
            
            for bbox in bboxes:
                # Extract crop
                crop = self.extract_pattern_crop(image_cv, bbox)
                
                # Classify
                class_name, confidence = self.classify_pattern(crop, confidence_threshold)
                
                # Store result
                detections.append({
                    'bbox': bbox,
                    'class': class_name,
                    'confidence': confidence
                })
                
                # Update counts
                if class_name in pattern_counts:
                    pattern_counts[class_name] += 1
                else:
                    pattern_counts['uncertain'] += 1
            
            # Create analysis result
            analysis_result = {
                'total_patterns_detected': len(bboxes),
                'pattern_counts': pattern_counts,
                'circular_patterns': pattern_counts['bipolar-circle'],
                'cross_patterns': pattern_counts['radial-cross'],
                'uncertain_patterns': pattern_counts['uncertain'],
                'confidence_threshold': confidence_threshold,
                'detection_parameters': {
                    'min_area': min_area,
                    'max_area': max_area
                },
                'individual_detections': detections
            }
            
            return {
                'success': True,
                'message': 'Pattern analysis completed successfully',
                'pattern_analysis': analysis_result,
                'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            }
            
        except Exception as e:
            logger.error(f"Pattern analysis failed: {e}")
            return {
                'success': False,
                'message': f'Pattern analysis failed: {str(e)}',
                'pattern_analysis': {}
            }
