#!/usr/bin/env python3
"""
Data Preparation Tools for Medical Image Training
Prepare and validate medical image datasets for ResNet training
"""

import os
import json
import shutil
import numpy as np
from PIL import Image
from typing import Dict, List, Tuple, Optional
import argparse
import logging
from collections import Counter

# Add parent directory to path to import config
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MedicalDataPreparer:
    """Prepare medical image datasets for training"""
    
    def __init__(self, base_dir: str):
        self.base_dir = base_dir
        self.images_dir = os.path.join(base_dir, "images")
        self.annotations_dir = os.path.join(base_dir, "annotations")
        
        # Medical condition classes from settings
        self.skin_conditions = settings.SKIN_CONDITIONS
        self.discharge_conditions = settings.DISCHARGE_CONDITIONS
        self.all_classes = self.skin_conditions + self.discharge_conditions
        
    def create_directory_structure(self):
        """Create the required directory structure"""
        directories = [
            self.base_dir,
            self.images_dir,
            self.annotations_dir,
            os.path.join(self.images_dir, "skin"),
            os.path.join(self.images_dir, "discharge"),
            os.path.join(self.images_dir, "train"),
            os.path.join(self.images_dir, "val"),
            os.path.join(self.images_dir, "test")
        ]
        
        # Create class-specific directories
        for condition in self.all_classes:
            directories.append(os.path.join(self.images_dir, condition))
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
            logger.info(f"Created directory: {directory}")
    
    def validate_image(self, image_path: str) -> Dict[str, any]:
        """Validate image quality and characteristics"""
        try:
            # Open image
            with Image.open(image_path) as img:
                # Basic properties
                width, height = img.size
                mode = img.mode
                file_size = os.path.getsize(image_path)
                
                # Convert to RGB for analysis
                if mode != 'RGB':
                    img_rgb = img.convert('RGB')
                else:
                    img_rgb = img
                
                # Check resolution requirements
                min_width, min_height = settings.MIN_IMAGE_SIZE
                is_high_res = width >= min_width and height >= min_height
                
                # Overall quality assessment
                quality_score = 1.0
                issues = []
                
                if not is_high_res:
                    quality_score -= 0.4
                    issues.append("low_resolution")
                
                quality_score = max(0.0, quality_score)
                
                return {
                    "valid": True,
                    "width": width,
                    "height": height,
                    "mode": mode,
                    "file_size": file_size,
                    "quality_score": quality_score,
                    "issues": issues,
                    "suitable_for_training": quality_score >= 0.6
                }
                
        except Exception as e:
            return {
                "valid": False,
                "error": str(e),
                "quality_score": 0.0,
                "suitable_for_training": False
            }
    
    def create_sample_annotations(self, images_dir: str, output_file: str):
        """Create sample annotations file from organized image directories"""
        annotations = []
        
        # Process images by class directories
        for class_name in self.all_classes:
            class_dir = os.path.join(images_dir, class_name)
            
            if os.path.exists(class_dir):
                for filename in os.listdir(class_dir):
                    if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                        image_path = os.path.join(class_dir, filename)
                        
                        # Validate image
                        validation = self.validate_image(image_path)
                        
                        if validation['suitable_for_training']:
                            annotations.append({
                                "filename": os.path.join(class_name, filename),
                                "class": class_name,
                                "category": "skin" if class_name in self.skin_conditions else "discharge",
                                "quality_score": validation['quality_score'],
                                "width": validation['width'],
                                "height": validation['height'],
                                "file_size": validation['file_size']
                            })
                        else:
                            logger.warning(f"Skipping low quality image: {filename} (score: {validation['quality_score']:.2f})")
        
        # Save annotations
        with open(output_file, 'w') as f:
            json.dump(annotations, f, indent=2)
        
        logger.info(f"Created annotations file with {len(annotations)} samples: {output_file}")
        
        # Print class distribution
        class_counts = Counter(ann['class'] for ann in annotations)
        logger.info("Class distribution:")
        for class_name, count in sorted(class_counts.items()):
            logger.info(f"  {class_name}: {count} samples")
        
        return annotations
    
    def create_dataset_summary(self, annotations: List[Dict], output_file: str):
        """Create comprehensive dataset summary"""
        
        # Basic statistics
        total_samples = len(annotations)
        class_counts = Counter(ann['class'] for ann in annotations)
        category_counts = Counter(ann.get('category', 'unknown') for ann in annotations)
        
        # Quality statistics
        quality_scores = [ann.get('quality_score', 0) for ann in annotations]
        avg_quality = np.mean(quality_scores) if quality_scores else 0
        
        # Image size statistics
        widths = [ann.get('width', 0) for ann in annotations]
        heights = [ann.get('height', 0) for ann in annotations]
        file_sizes = [ann.get('file_size', 0) for ann in annotations]
        
        summary = {
            "dataset_info": {
                "total_samples": total_samples,
                "creation_date": "2024-01-15T10:30:00Z",
                "classes": list(self.all_classes),
                "skin_conditions": self.skin_conditions,
                "discharge_conditions": self.discharge_conditions
            },
            "class_distribution": dict(class_counts),
            "category_distribution": dict(category_counts),
            "quality_metrics": {
                "average_quality_score": float(avg_quality),
                "min_quality_score": float(min(quality_scores)) if quality_scores else 0,
                "max_quality_score": float(max(quality_scores)) if quality_scores else 0,
                "high_quality_samples": sum(1 for q in quality_scores if q >= 0.8)
            },
            "image_statistics": {
                "width": {
                    "min": int(min(widths)) if widths else 0,
                    "max": int(max(widths)) if widths else 0,
                    "average": float(np.mean(widths)) if widths else 0
                },
                "height": {
                    "min": int(min(heights)) if heights else 0,
                    "max": int(max(heights)) if heights else 0,
                    "average": float(np.mean(heights)) if heights else 0
                },
                "file_size_mb": {
                    "min": float(min(file_sizes) / (1024*1024)) if file_sizes else 0,
                    "max": float(max(file_sizes) / (1024*1024)) if file_sizes else 0,
                    "average": float(np.mean(file_sizes) / (1024*1024)) if file_sizes else 0
                }
            }
        }
        
        # Save summary
        with open(output_file, 'w') as f:
            json.dump(summary, f, indent=2)
        
        logger.info(f"Dataset summary saved to: {output_file}")
        logger.info(f"Total samples: {total_samples}")
        logger.info(f"Average quality score: {avg_quality:.3f}")
        
        return summary

def main():
    parser = argparse.ArgumentParser(description='Prepare Medical Image Dataset')
    parser.add_argument('--data_dir', type=str, default='data',
                        help='Base data directory')
    parser.add_argument('--create_structure', action='store_true',
                        help='Create directory structure')
    parser.add_argument('--create_annotations', type=str,
                        help='Create annotations from image directory')
    parser.add_argument('--summary', action='store_true',
                        help='Create dataset summary')
    
    args = parser.parse_args()
    
    # Initialize data preparer
    preparer = MedicalDataPreparer(args.data_dir)
    
    if args.create_structure:
        logger.info("Creating directory structure...")
        preparer.create_directory_structure()
        logger.info("Directory structure created successfully!")
        logger.info(f"Medical classes configured: {len(preparer.all_classes)} classes")
        logger.info(f"  Skin conditions: {preparer.skin_conditions}")
        logger.info(f"  Discharge conditions: {preparer.discharge_conditions}")
    
    if args.create_annotations:
        logger.info(f"Creating annotations from: {args.create_annotations}")
        images_dir = args.create_annotations
        annotations_file = os.path.join(args.data_dir, 'annotations', 'annotations.json')
        annotations = preparer.create_sample_annotations(images_dir, annotations_file)
    
    if args.summary:
        logger.info("Creating dataset summary...")
        annotations_file = os.path.join(args.data_dir, 'annotations', 'annotations.json')
        
        try:
            with open(annotations_file, 'r') as f:
                annotations = json.load(f)
            
            summary_file = os.path.join(args.data_dir, 'dataset_summary.json')
            preparer.create_dataset_summary(annotations, summary_file)
        except Exception as e:
            logger.error(f"Cannot create summary: {e}")
    
    logger.info("Data preparation tools are ready!")
    logger.info("Available commands:")
    logger.info("  --create_structure: Set up directory structure")
    logger.info("  --create_annotations <dir>: Generate annotations from organized images")
    logger.info("  --summary: Create dataset summary report")

if __name__ == "__main__":
    main()