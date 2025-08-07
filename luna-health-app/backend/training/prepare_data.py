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
import cv2

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MedicalDataPreparer:
    """Prepare medical image datasets for training"""
    
    def __init__(self, base_dir: str):
        self.base_dir = base_dir
        self.images_dir = os.path.join(base_dir, "images")
        self.annotations_dir = os.path.join(base_dir, "annotations")
        
        # Medical condition classes
        self.skin_conditions = [
            "normal_skin", "acne", "eczema", "psoriasis",
            "melanoma", "basal_cell_carcinoma", "seborrheic_keratosis"
        ]
        
        self.discharge_conditions = [
            "normal_white", "normal_clear", "yeast_infection",
            "bacterial_vaginosis", "trichomoniasis", "menstrual_blood"
        ]
        
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
                
                # Convert to numpy for quality checks
                img_array = np.array(img_rgb)
                
                # Check for blur (using Laplacian variance)
                gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
                blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
                
                # Check brightness
                brightness = np.mean(img_array)
                
                # Check if image is too dark or too bright
                is_too_dark = brightness < 50
                is_too_bright = brightness > 200
                
                # Check resolution requirements
                min_resolution = 100
                is_high_res = width >= min_resolution and height >= min_resolution
                
                # Overall quality assessment
                quality_score = 1.0
                issues = []
                
                if blur_score < 100:
                    quality_score -= 0.3
                    issues.append("blurry")
                
                if is_too_dark:
                    quality_score -= 0.2
                    issues.append("too_dark")
                
                if is_too_bright:
                    quality_score -= 0.2
                    issues.append("too_bright")
                
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
                    "blur_score": blur_score,
                    "brightness": brightness,
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
    
    def augment_dataset(self, annotations: List[Dict], target_samples_per_class: int = 100):
        """Generate data augmentation suggestions for balancing dataset"""
        class_counts = Counter(ann['class'] for ann in annotations)
        augmentation_plan = {}
        
        for class_name in self.all_classes:
            current_count = class_counts.get(class_name, 0)
            needed = max(0, target_samples_per_class - current_count)
            
            if needed > 0:
                augmentation_plan[class_name] = {
                    "current_samples": current_count,
                    "needed_samples": needed,
                    "augmentation_factor": needed / max(1, current_count)
                }
        
        return augmentation_plan
    
    def split_dataset(self, annotations: List[Dict], 
                     train_ratio: float = 0.7, 
                     val_ratio: float = 0.2, 
                     test_ratio: float = 0.1) -> Dict[str, List[Dict]]:
        """Split dataset into train/validation/test sets with class stratification"""
        
        # Ensure ratios sum to 1
        total = train_ratio + val_ratio + test_ratio
        train_ratio /= total
        val_ratio /= total
        test_ratio /= total
        
        # Group by class
        class_groups = {}
        for ann in annotations:
            class_name = ann['class']
            if class_name not in class_groups:
                class_groups[class_name] = []
            class_groups[class_name].append(ann)
        
        # Split each class
        train_set = []
        val_set = []
        test_set = []
        
        for class_name, samples in class_groups.items():
            # Shuffle samples
            np.random.shuffle(samples)
            
            n_samples = len(samples)
            n_train = int(n_samples * train_ratio)
            n_val = int(n_samples * val_ratio)
            
            class_train = samples[:n_train]
            class_val = samples[n_train:n_train + n_val]
            class_test = samples[n_train + n_val:]
            
            train_set.extend(class_train)
            val_set.extend(class_val)
            test_set.extend(class_test)
            
            logger.info(f"{class_name}: {len(class_train)} train, {len(class_val)} val, {len(class_test)} test")
        
        return {
            'train': train_set,
            'validation': val_set,
            'test': test_set
        }
    
    def create_dataset_summary(self, annotations: List[Dict], output_file: str):
        """Create comprehensive dataset summary"""
        
        # Basic statistics
        total_samples = len(annotations)
        class_counts = Counter(ann['class'] for ann in annotations)
        category_counts = Counter(ann.get('category', 'unknown') for ann in annotations)
        
        # Quality statistics
        quality_scores = [ann.get('quality_score', 0) for ann in annotations]
        avg_quality = np.mean(quality_scores)
        
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
    
    def validate_dataset_structure(self, images_dir: str, annotations_file: str) -> Dict[str, any]:
        """Validate dataset structure and consistency"""
        
        issues = []
        warnings = []
        
        # Check if directories exist
        if not os.path.exists(images_dir):
            issues.append(f"Images directory not found: {images_dir}")
        
        if not os.path.exists(annotations_file):
            issues.append(f"Annotations file not found: {annotations_file}")
        
        if issues:
            return {"valid": False, "issues": issues, "warnings": warnings}
        
        # Load annotations
        try:
            with open(annotations_file, 'r') as f:
                annotations = json.load(f)
        except Exception as e:
            issues.append(f"Cannot load annotations file: {e}")
            return {"valid": False, "issues": issues, "warnings": warnings}
        
        # Validate annotations
        missing_files = []
        invalid_classes = []
        
        for ann in annotations:
            # Check required fields
            required_fields = ['filename', 'class']
            for field in required_fields:
                if field not in ann:
                    issues.append(f"Missing field '{field}' in annotation: {ann}")
            
            # Check if file exists
            if 'filename' in ann:
                image_path = os.path.join(images_dir, ann['filename'])
                if not os.path.exists(image_path):
                    missing_files.append(ann['filename'])
            
            # Check if class is valid
            if 'class' in ann and ann['class'] not in self.all_classes:
                invalid_classes.append(ann['class'])
        
        if missing_files:
            warnings.append(f"Missing image files: {len(missing_files)} files")
        
        if invalid_classes:
            issues.append(f"Invalid classes found: {set(invalid_classes)}")
        
        # Check class balance
        class_counts = Counter(ann['class'] for ann in annotations if 'class' in ann)
        min_samples = min(class_counts.values()) if class_counts else 0
        max_samples = max(class_counts.values()) if class_counts else 0
        
        if min_samples == 0:
            warnings.append("Some classes have no samples")
        elif max_samples / min_samples > 10:
            warnings.append(f"Highly imbalanced dataset: {max_samples}/{min_samples} ratio")
        
        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "warnings": warnings,
            "total_annotations": len(annotations),
            "missing_files": len(missing_files),
            "class_distribution": dict(class_counts)
        }

def main():
    parser = argparse.ArgumentParser(description='Prepare Medical Image Dataset')
    parser.add_argument('--data_dir', type=str, default='data',
                        help='Base data directory')
    parser.add_argument('--create_structure', action='store_true',
                        help='Create directory structure')
    parser.add_argument('--create_annotations', type=str,
                        help='Create annotations from image directory')
    parser.add_argument('--validate', action='store_true',
                        help='Validate dataset structure')
    parser.add_argument('--summary', action='store_true',
                        help='Create dataset summary')
    parser.add_argument('--split', action='store_true',
                        help='Split dataset into train/val/test')
    
    args = parser.parse_args()
    
    # Initialize data preparer
    preparer = MedicalDataPreparer(args.data_dir)
    
    if args.create_structure:
        logger.info("Creating directory structure...")
        preparer.create_directory_structure()
    
    if args.create_annotations:
        logger.info(f"Creating annotations from: {args.create_annotations}")
        images_dir = args.create_annotations
        annotations_file = os.path.join(args.data_dir, 'annotations', 'annotations.json')
        annotations = preparer.create_sample_annotations(images_dir, annotations_file)
        
        # Show augmentation plan
        aug_plan = preparer.augment_dataset(annotations)
        if aug_plan:
            logger.info("\nData augmentation recommendations:")
            for class_name, plan in aug_plan.items():
                logger.info(f"  {class_name}: need {plan['needed_samples']} more samples "
                          f"(current: {plan['current_samples']})")
    
    if args.validate:
        logger.info("Validating dataset...")
        images_dir = os.path.join(args.data_dir, 'images')
        annotations_file = os.path.join(args.data_dir, 'annotations', 'annotations.json')
        
        validation = preparer.validate_dataset_structure(images_dir, annotations_file)
        
        if validation['valid']:
            logger.info("✅ Dataset validation passed!")
        else:
            logger.error("❌ Dataset validation failed!")
            for issue in validation['issues']:
                logger.error(f"  - {issue}")
        
        if validation['warnings']:
            logger.warning("Warnings:")
            for warning in validation['warnings']:
                logger.warning(f"  - {warning}")
    
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
    
    if args.split:
        logger.info("Splitting dataset...")
        annotations_file = os.path.join(args.data_dir, 'annotations', 'annotations.json')
        
        try:
            with open(annotations_file, 'r') as f:
                annotations = json.load(f)
            
            # Split dataset
            splits = preparer.split_dataset(annotations)
            
            # Save splits
            for split_name, split_data in splits.items():
                split_file = os.path.join(args.data_dir, 'annotations', f'{split_name}_annotations.json')
                with open(split_file, 'w') as f:
                    json.dump(split_data, f, indent=2)
                logger.info(f"Saved {split_name} set: {len(split_data)} samples -> {split_file}")
                
        except Exception as e:
            logger.error(f"Cannot split dataset: {e}")

if __name__ == "__main__":
    main()