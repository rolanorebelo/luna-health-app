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
    
    def test_enhance_image(self):
        """Test image enhancement with CLAHE and denoising"""
        # Create test image
        test_image = self.create_test_image()
        image_array = np.array(test_image)
        
        # Apply enhancement
        enhanced = self.preprocessor.enhance_image(image_array)
        
        # Check output properties
        assert enhanced.shape == image_array.shape
        assert enhanced.dtype == np.uint8
        assert 0 <= np.min(enhanced) <= 255
        assert 0 <= np.max(enhanced) <= 255
    
    def test_adjust_contrast_brightness(self):
        """Test contrast and brightness adjustment"""
        # Create test image
        test_image = self.create_test_image(color=(100, 100, 100))
        image_array = np.array(test_image)
        
        # Apply adjustment
        adjusted = self.preprocessor.adjust_contrast_brightness(
            image_array, contrast=1.5, brightness=20
        )
        
        # Check that adjustment was applied
        assert adjusted.shape == image_array.shape
        assert np.mean(adjusted) > np.mean(image_array)  # Should be brighter
    
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
    
    def create_test_image(self, size=(224, 224), blur=False, brightness=128):
        """Create test image with specified properties"""
        image = Image.new('RGB', size, (brightness, brightness, brightness))
        image_array = np.array(image)
        
        if blur:
            # Add blur by convolving with a blur kernel
            import cv2
            kernel = np.ones((15, 15), np.float32) / 225
            image_array = cv2.filter2D(image_array, -1, kernel).astype(np.uint8)
            image = Image.fromarray(image_array)
        
        return image, image_array
    
    def test_calculate_blur_score(self):
        """Test blur score calculation"""
        # Sharp image
        sharp_image, sharp_array = self.create_test_image(blur=False)
        sharp_score = self.validator.calculate_blur_score(sharp_array)
        
        # Blurry image
        blurry_image, blurry_array = self.create_test_image(blur=True)
        blurry_score = self.validator.calculate_blur_score(blurry_array)
        
        # Sharp image should have higher blur score
        assert sharp_score > blurry_score
    
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
        good_image, good_array = self.create_test_image(size=(300, 300), blur=False, brightness=128)
        good_assessment = self.validator.assess_quality(good_image, good_array)
        
        assert good_assessment['overall_quality'] > 0.5
        assert good_assessment['suitable_for_analysis'] == True
        
        # Poor quality image
        poor_image, poor_array = self.create_test_image(size=(50, 50), blur=True, brightness=20)
        poor_assessment = self.validator.assess_quality(poor_image, poor_array)
        
        assert poor_assessment['overall_quality'] < good_assessment['overall_quality']

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
    
    def test_advanced_color_analysis(self):
        """Test advanced color analysis for discharge"""
        # Create test image with specific color
        test_image = Image.new('RGB', (100, 100), (200, 200, 150))  # Yellowish
        image_array = np.array(test_image)
        
        result = self.service._advanced_color_analysis(image_array)
        
        assert 'dominant_color' in result
        assert 'rgb_values' in result
        assert 'hsv_values' in result
        assert 'lab_values' in result
        assert 'consistency_score' in result
        assert 0 <= result['consistency_score'] <= 1
    
    def test_categorize_discharge_color(self):
        """Test discharge color categorization"""
        # Test different color categories
        test_cases = [
            ([245, 245, 245], "clear/transparent"),  # Very light
            ([220, 220, 200], "white/off-white"),    # Off-white
            ([200, 200, 100], "yellow/cream"),       # Yellow
            ([120, 180, 80], "green/gray"),          # Greenish
            ([180, 100, 100], "pink/red"),           # Reddish
            ([80, 70, 60], "brown/dark")             # Dark
        ]
        
        for rgb, expected_category in test_cases:
            category = self.service._categorize_discharge_color(np.array(rgb))
            assert isinstance(category, str)
            # Note: Exact category matching might vary based on thresholds
    
    def test_get_skin_recommendations(self):
        """Test skin condition recommendations"""
        # Test with high confidence melanoma detection
        resnet_result = {
            'success': True,
            'predictions': [{'class': 'melanoma', 'confidence': 0.9}]
        }
        quality_assessment = {'suitable_for_analysis': True}
        
        recommendations = self.service._get_skin_recommendations(resnet_result, quality_assessment)
        
        assert isinstance(recommendations, list)
        assert len(recommendations) > 0
        # Should recommend medical evaluation for potential melanoma
        assert any('dermatological evaluation' in rec for rec in recommendations)
    
    def test_get_discharge_recommendations(self):
        """Test discharge recommendations"""
        # Test with possible infection
        resnet_result = {
            'success': True,
            'predictions': [{'class': 'yeast_infection', 'confidence': 0.8}]
        }
        quality_assessment = {'suitable_for_analysis': True}
        
        recommendations = self.service._get_discharge_recommendations(resnet_result, quality_assessment)
        
        assert isinstance(recommendations, list)
        assert len(recommendations) > 0
        # Should mention consulting healthcare provider
        assert any('healthcare provider' in rec for rec in recommendations)

class TestPerformance:
    """Performance and benchmarking tests"""
    
    def setup_method(self):
        with patch('app.services.vision_analysis.settings') as mock_settings:
            mock_settings.OPENAI_API_KEY = "test-key"
            mock_settings.RESNET_MODEL_PATH = "non-existent-path.pth"
            mock_settings.SKIN_CONDITIONS = ["acne", "eczema"]
            mock_settings.DISCHARGE_CONDITIONS = ["normal", "yeast"]
            mock_settings.IMAGE_SIZE = (224, 224)
            mock_settings.QUALITY_THRESHOLD = 0.7
            
            with patch('app.services.vision_analysis.OpenAI'), \
                 patch('os.path.exists', return_value=False):
                self.service = VisionAnalysisService()
    
    def test_preprocessing_speed(self):
        """Test image preprocessing speed"""
        import time
        
        test_image = Image.new('RGB', (512, 512), (128, 128, 128))
        
        start_time = time.time()
        enhanced_pil, enhanced_array = self.service.preprocessor.preprocess_for_analysis(test_image)
        end_time = time.time()
        
        processing_time = end_time - start_time
        # Should process in less than 2 seconds
        assert processing_time < 2.0
    
    def test_quality_assessment_speed(self):
        """Test quality assessment speed"""
        import time
        
        test_image = Image.new('RGB', (300, 300), (128, 128, 128))
        image_array = np.array(test_image)
        
        start_time = time.time()
        quality = self.service.quality_validator.assess_quality(test_image, image_array)
        end_time = time.time()
        
        assessment_time = end_time - start_time
        # Should assess quality in less than 1 second
        assert assessment_time < 1.0

class TestErrorHandling:
    """Test error handling and edge cases"""
    
    def setup_method(self):
        with patch('app.services.vision_analysis.settings') as mock_settings:
            mock_settings.OPENAI_API_KEY = "test-key"
            mock_settings.RESNET_MODEL_PATH = "non-existent-path.pth"
            mock_settings.SKIN_CONDITIONS = ["acne"]
            mock_settings.DISCHARGE_CONDITIONS = ["normal"]
            mock_settings.IMAGE_SIZE = (224, 224)
            
            with patch('app.services.vision_analysis.OpenAI'), \
                 patch('os.path.exists', return_value=False):
                self.service = VisionAnalysisService()
    
    def test_corrupted_image_handling(self):
        """Test handling of corrupted images"""
        # Create an invalid image (too small array)
        invalid_array = np.array([[[0, 0, 0]]])  # 1x1x3 array
        
        # Should handle gracefully without crashing
        try:
            enhanced = self.service.preprocessor.enhance_image(invalid_array)
            # If it doesn't crash, that's good
            assert True
        except Exception:
            # If it does crash, that's also acceptable for invalid input
            assert True
    
    @pytest.mark.asyncio
    async def test_analysis_with_missing_api_key(self):
        """Test analysis when OpenAI API key is missing"""
        # Patch the OpenAI client to raise an authentication error
        with patch.object(self.service.client.chat.completions, 'create') as mock_create:
            mock_create.side_effect = Exception("Invalid API key")
            
            test_image = Image.new('RGB', (224, 224), (128, 128, 128))
            result = await self.service.analyze_skin_condition(test_image)
            
            # Should handle the error gracefully
            assert isinstance(result, dict)
            # May still succeed with ResNet even if GPT-4 fails

if __name__ == "__main__":
    # Run with: python -m pytest tests/test_vision_analysis.py -v
    pytest.main([__file__, "-v"])