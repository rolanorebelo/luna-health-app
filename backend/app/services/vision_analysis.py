import base64
import io
from PIL import Image
import torch
from transformers import pipeline, BlipProcessor, BlipForConditionalGeneration
from typing import Dict, Any, List
import numpy as np

class VisionAnalysisService:
    def __init__(self):
        # Initialize BLIP model for image captioning
        self.processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
        self.model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
        
        # Initialize classification pipeline for basic analysis
        self.classifier = pipeline("image-classification", model="microsoft/resnet-50")
        
    async def analyze_skin_condition(self, image: Image.Image) -> Dict[str, Any]:
        """Analyze skin condition from image"""
        try:
            # Get image description
            inputs = self.processor(image, return_tensors="pt")
            out = self.model.generate(**inputs, max_length=50)
            description = self.processor.decode(out[0], skip_special_tokens=True)
            
            # Get classifications
            classifications = self.classifier(image)
            
            # Process for skin-specific insights
            analysis = {
                "description": description,
                "classifications": classifications[:3],  # Top 3 predictions
                "skin_concerns": self._extract_skin_concerns(description, classifications),
                "confidence": classifications[0]['score'] if classifications else 0.0
            }
            
            return analysis
            
        except Exception as e:
            return {
                "error": str(e),
                "description": "Unable to analyze image",
                "confidence": 0.0
            }
    
    async def analyze_discharge(self, image: Image.Image) -> Dict[str, Any]:
        """Analyze discharge characteristics"""
        # For demo purposes, using general analysis
        # In production, use specialized medical models
        try:
            inputs = self.processor(image, return_tensors="pt")
            out = self.model.generate(**inputs, max_length=50)
            description = self.processor.decode(out[0], skip_special_tokens=True)
            
            # Analyze color and consistency
            color_info = self._analyze_color(image)
            
            return {
                "description": description,
                "color_analysis": color_info,
                "health_indicators": self._get_discharge_indicators(color_info),
                "confidence": 0.85  # Placeholder
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    def _extract_skin_concerns(self, description: str, classifications: List) -> List[str]:
        """Extract potential skin concerns from analysis"""
        concerns = []
        
        # Keywords to look for
        concern_keywords = {
            "redness": ["red", "inflamed", "irritated"],
            "acne": ["pimple", "bump", "spot", "blemish"],
            "dryness": ["dry", "flaky", "rough"],
            "discoloration": ["dark", "spot", "uneven", "pigment"]
        }
        
        description_lower = description.lower()
        for concern, keywords in concern_keywords.items():
            if any(keyword in description_lower for keyword in keywords):
                concerns.append(concern)
        
        return concerns
    
    def _analyze_color(self, image: Image.Image) -> Dict[str, Any]:
        """Analyze dominant colors in image"""
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize for faster processing
        image_small = image.resize((150, 150))
        
        # Get color data
        pixels = np.array(image_small)
        avg_color = pixels.mean(axis=(0, 1))
        
        # Determine color category
        color_category = self._categorize_color(avg_color)
        
        return {
            "dominant_color": color_category,
            "rgb_values": avg_color.tolist(),
            "brightness": np.mean(avg_color)
        }
    
    def _categorize_color(self, rgb: np.ndarray) -> str:
        """Categorize color for health analysis"""
        r, g, b = rgb
        
        if r > 200 and g > 200 and b > 200:
            return "white/clear"
        elif r > 150 and g > 150 and b < 100:
            return "yellow"
        elif r > 150 and g < 100 and b < 100:
            return "red/pink"
        elif r < 100 and g > 150 and b < 100:
            return "green"
        elif r < 150 and g < 150 and b < 150:
            return "gray/brown"
        else:
            return "mixed"
    
    def _get_discharge_indicators(self, color_info: Dict) -> List[str]:
        """Get health indicators based on discharge color"""
        indicators = []
        color = color_info.get("dominant_color", "")
        
        indicator_map = {
            "white/clear": ["Normal discharge", "Healthy pH balance likely"],
            "yellow": ["Possible infection", "May need medical attention"],
            "green": ["Bacterial infection possible", "Consult healthcare provider"],
            "gray/brown": ["Old blood possible", "Monitor for other symptoms"],
            "red/pink": ["Fresh blood present", "Track if during expected period"]
        }
        
        return indicator_map.get(color, ["Unable to determine - consult healthcare provider"])