#!/usr/bin/env python3
"""
Comprehensive Test Suite for Vision Analysis Service
Tests for medical image analysis including GPT-4 Vision, ResNet, and preprocessing
"""

import pytest
import pytest_asyncio
import os
import io
import base64
import json
import numpy as np
import torch
from PIL import Image
from unittest.mock import Mock, patch, MagicMock
import tempfile
import shutil

# Add parent directory to path
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.vision_analysis import (
    VisionAnalysisService,
    MedicalResNet,
    ImagePreprocessor,
    ImageQualityValidator
)
from app.core.config import settings

class TestImagePreprocessor:
    """Test image preprocessing pipeline"""
    
    def setup_method(self):
        self.preprocessor = ImagePreprocessor()
    
    def create_test_image(self, size=(224, 224), color=(128, 128, 128)):
        """Create a test image"""
        image = Image.new('RGB', size, color)
        return image
    
    def test_preprocess_for_analysis(self):
        """Test complete preprocessing pipeline"""
        # Create test image
        test_image = self.create_test_image()
        
        # Preprocess
        enhanced_pil, enhanced_array = self.preprocessor.preprocess_for_analysis(test_image)
        
        # Check outputs
        assert isinstance(enhanced_pil, Image.Image)
        assert isinstance(enhanced_array, np.ndarray)
        assert enhanced_pil.size == test_image.size
        assert enhanced_array.shape == np.array(test_image).shape
    
    def test_preprocess_with_alpha_channel(self):
        """Test preprocessing with RGBA image"""
        # Create RGBA test image
        test_image = Image.new('RGBA', (224, 224), (128, 128, 128, 255))
        
        # Preprocess
        enhanced_pil, enhanced_array = self.preprocessor.preprocess_for_analysis(test_image)
        
        # Should convert to RGB
        assert enhanced_pil.mode == 'RGB'
        assert enhanced_array.shape[2] == 3

class TestImageQualityValidator:
    """Test image quality validation"""
    
    def setup_method(self):
        self.validator = ImageQualityValidator()
    
    def create_test_image(self, size=(224, 224), brightness=128):
        """Create test image with specified properties"""
        image = Image.new('RGB', size, (brightness, brightness, brightness))
        image_array = np.array(image)
        return image, image_array
    
    def test_validate_resolution(self):
        """Test resolution validation"""
        # High resolution image
        high_res_image, _ = self.create_test_image(size=(500, 500))
        high_res_info = self.validator.validate_resolution(high_res_image)
        
        assert high_res_info['width'] == 500
        assert high_res_info['height'] == 500
        assert high_res_info['meets_min_size'] == True
        assert high_res_info['within_max_dimension'] == True
        
        # Low resolution image
        low_res_image, _ = self.create_test_image(size=(50, 50))
        low_res_info = self.validator.validate_resolution(low_res_image)
        
        assert low_res_info['meets_min_size'] == False
    
    def test_assess_quality(self):
        """Test comprehensive quality assessment"""
        # Good quality image
        good_image, good_array = self.create_test_image(size=(300, 300), brightness=128)
        good_assessment = self.validator.assess_quality(good_image, good_array)
        
        assert good_assessment['overall_quality'] > 0.5
        assert good_assessment['suitable_for_analysis'] == True

class TestMedicalResNet:
    """Test Medical ResNet model"""
    
    def test_model_creation(self):
        """Test model initialization"""
        num_classes = 13
        model = MedicalResNet(num_classes=num_classes)
        
        # Check model structure
        assert isinstance(model, torch.nn.Module)
        assert hasattr(model, 'backbone')
        
        # Test forward pass with random input
        test_input = torch.randn(1, 3, 224, 224)
        with torch.no_grad():
            output = model(test_input)
        
        assert output.shape == (1, num_classes)
    
    def test_model_parameters(self):
        """Test that early layers are frozen"""
        model = MedicalResNet(num_classes=13)
        
        # Count trainable parameters
        trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
        total_params = sum(p.numel() for p in model.parameters())
        
        # Should have fewer trainable parameters than total (transfer learning)
        assert trainable_params < total_params

class TestVisionAnalysisService:
    """Test the main vision analysis service"""
    
    def setup_method(self):
        # Mock settings to avoid loading actual models
        with patch('app.services.vision_analysis.settings') as mock_settings:
            mock_settings.OPENAI_API_KEY = "test-key"
            mock_settings.RESNET_MODEL_PATH = "non-existent-path.pth"
            mock_settings.SKIN_CONDITIONS = ["acne", "eczema"]
            mock_settings.DISCHARGE_CONDITIONS = ["normal", "yeast"]
            mock_settings.IMAGE_SIZE = (224, 224)
            mock_settings.QUALITY_THRESHOLD = 0.7
            mock_settings.OPENAI_MODEL = "gpt-4-vision-preview"
            mock_settings.MIN_IMAGE_SIZE = (100, 100)
            mock_settings.MAX_IMAGE_DIMENSION = 2048
            mock_settings.BLUR_THRESHOLD = 100.0
            
            with patch('app.services.vision_analysis.OpenAI'), \
                 patch('os.path.exists', return_value=False):
                self.service = VisionAnalysisService()
    
    def create_test_image(self, size=(224, 224)):
        """Create a test image"""
        return Image.new('RGB', size, (128, 128, 128))
    
    def test_encode_image_for_openai(self):
        """Test image encoding for OpenAI API"""
        test_image = self.create_test_image()
        encoded = self.service.encode_image_for_openai(test_image)
        
        # Check that it's a valid base64 data URL
        assert encoded.startswith("data:image/jpeg;base64,")
        
        # Decode and verify it's valid base64
        base64_part = encoded.split(',')[1]
        decoded_data = base64.b64decode(base64_part)
        assert len(decoded_data) > 0
    
    @patch('app.services.vision_analysis.OpenAI')
    def test_get_gpt4_vision_analysis_success(self, mock_openai):
        """Test successful GPT-4 Vision analysis"""
        # Mock OpenAI response
        mock_response = Mock()
        mock_response.choices[0].message.content = "This is a skin analysis result"
        mock_openai.return_value.chat.completions.create.return_value = mock_response
        
        test_image = self.create_test_image()
        result = self.service.get_gpt4_vision_analysis(test_image, "skin")
        
        assert result['success'] == True
        assert 'gpt4_analysis' in result
        assert result['gpt4_analysis'] == "This is a skin analysis result"
    
    @patch('app.services.vision_analysis.OpenAI')
    def test_get_gpt4_vision_analysis_failure(self, mock_openai):
        """Test GPT-4 Vision analysis failure handling"""
        # Mock OpenAI to raise exception
        mock_openai.return_value.chat.completions.create.side_effect = Exception("API Error")
        
        test_image = self.create_test_image()
        result = self.service.get_gpt4_vision_analysis(test_image, "skin")
        
        assert result['success'] == False
        assert 'error' in result
    
    def test_get_resnet_prediction(self):
        """Test ResNet prediction"""
        test_image = self.create_test_image()
        
        with patch.object(self.service.resnet_model, 'forward') as mock_forward:
            # Mock model output
            mock_output = torch.randn(1, 4)  # 4 classes for test
            mock_forward.return_value = mock_output
            
            result = self.service.get_resnet_prediction(test_image)
            
            assert result['success'] == True
            assert 'predictions' in result
            assert len(result['predictions']) == 3  # Top 3
            assert all('confidence' in pred for pred in result['predictions'])
    
    def test_calculate_ensemble_confidence(self):
        """Test ensemble confidence calculation"""
        # Test with successful results
        gpt4_result = {'success': True, 'gpt4_analysis': 'Detailed analysis result'}
        resnet_result = {
            'success': True, 
            'top_prediction': {'confidence': 0.8}
        }
        
        confidence = self.service.calculate_ensemble_confidence(gpt4_result, resnet_result)
        assert 0.0 <= confidence <= 1.0
        assert confidence > 0.7  # Should be high with both successful
        
        # Test with failed results
        failed_gpt4 = {'success': False}
        failed_resnet = {'success': False}
        
        low_confidence = self.service.calculate_ensemble_confidence(failed_gpt4, failed_resnet)
        assert low_confidence < confidence  # Should be lower
    
    @pytest.mark.asyncio
    async def test_analyze_skin_condition_integration(self):
        """Test complete skin condition analysis"""
        test_image = self.create_test_image()
        
        # Mock the GPT-4 and ResNet calls
        with patch.object(self.service, 'get_gpt4_vision_analysis') as mock_gpt4, \
             patch.object(self.service, 'get_resnet_prediction') as mock_resnet:
            
            # Mock responses
            mock_gpt4.return_value = {
                'success': True, 
                'gpt4_analysis': 'Skin analysis result'
            }
            mock_resnet.return_value = {
                'success': True,
                'predictions': [{'class': 'acne', 'confidence': 0.85}]
            }
            
            result = await self.service.analyze_skin_condition(test_image)
            
            assert result['success'] == True
            assert result['analysis_type'] == 'skin_condition'
            assert 'gpt4_vision' in result
            assert 'resnet_classification' in result
            assert 'quality_assessment' in result
            assert 'ensemble_confidence' in result
    
    @pytest.mark.asyncio
    async def test_analyze_discharge_integration(self):
        """Test complete discharge analysis"""
        test_image = self.create_test_image()
        
        # Mock the GPT-4 and ResNet calls
        with patch.object(self.service, 'get_gpt4_vision_analysis') as mock_gpt4, \
             patch.object(self.service, 'get_resnet_prediction') as mock_resnet:
            
            mock_gpt4.return_value = {
                'success': True, 
                'gpt4_analysis': 'Discharge analysis result'
            }
            mock_resnet.return_value = {
                'success': True,
                'predictions': [{'class': 'normal', 'confidence': 0.75}]
            }
            
            result = await self.service.analyze_discharge(test_image)
            
            assert result['success'] == True
            assert result['analysis_type'] == 'discharge'
            assert 'gpt4_vision' in result
            assert 'resnet_classification' in result
            assert 'color_analysis' in result
            assert 'health_indicators' in result

class TestIntegration:
    """Integration tests for the entire pipeline"""
    
    def setup_method(self):
        # Mock all external dependencies
        with patch('app.services.vision_analysis.settings') as mock_settings:
            mock_settings.OPENAI_API_KEY = "test-key"
            mock_settings.RESNET_MODEL_PATH = "non-existent-path.pth"
            mock_settings.SKIN_CONDITIONS = ["normal_skin", "acne", "eczema"]
            mock_settings.DISCHARGE_CONDITIONS = ["normal_white", "normal_clear", "yeast_infection"]
            mock_settings.IMAGE_SIZE = (224, 224)
            mock_settings.QUALITY_THRESHOLD = 0.7
            mock_settings.OPENAI_MODEL = "gpt-4-vision-preview"
            mock_settings.MIN_IMAGE_SIZE = (100, 100)
            mock_settings.MAX_IMAGE_DIMENSION = 2048
            mock_settings.BLUR_THRESHOLD = 100.0
            
            with patch('app.services.vision_analysis.OpenAI'), \
                 patch('os.path.exists', return_value=False):
                self.service = VisionAnalysisService()
    
    def test_service_initialization(self):
        """Test that the service initializes correctly"""
        assert hasattr(self.service, 'client')
        assert hasattr(self.service, 'preprocessor')
        assert hasattr(self.service, 'quality_validator')
        assert hasattr(self.service, 'resnet_model')
        assert len(self.service.medical_classes) == 6  # 3 skin + 3 discharge

if __name__ == "__main__":
    # Run with: python -m pytest tests/test_vision_analysis.py -v
    pytest.main([__file__, "-v"])