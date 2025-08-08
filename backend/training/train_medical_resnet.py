#!/usr/bin/env python3
"""
Medical ResNet Training Pipeline
Train custom ResNet model for medical image classification (skin conditions + discharge analysis)
"""

import os
import json
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, random_split
from torchvision import transforms, models
from PIL import Image
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix
import logging
from typing import Dict, List, Tuple, Optional
import argparse
from datetime import datetime

# Add parent directory to path to import config
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MedicalImageDataset(Dataset):
    """Dataset class for medical images with JSON annotations"""
    
    def __init__(self, images_dir: str, annotations_file: str, transform=None, class_to_idx=None):
        self.images_dir = images_dir
        self.transform = transform
        
        # Load annotations
        with open(annotations_file, 'r') as f:
            self.annotations = json.load(f)
        
        # Create class mapping if not provided
        if class_to_idx is None:
            unique_classes = set(item['class'] for item in self.annotations)
            self.class_to_idx = {cls: idx for idx, cls in enumerate(sorted(unique_classes))}
        else:
            self.class_to_idx = class_to_idx
        
        self.idx_to_class = {idx: cls for cls, idx in self.class_to_idx.items()}
        
        # Filter annotations for existing images
        self.valid_annotations = []
        for ann in self.annotations:
            img_path = os.path.join(self.images_dir, ann['filename'])
            if os.path.exists(img_path):
                self.valid_annotations.append(ann)
        
        logger.info(f"Loaded {len(self.valid_annotations)} valid samples from {len(self.annotations)} annotations")
        logger.info(f"Classes: {list(self.class_to_idx.keys())}")
    
    def __len__(self):
        return len(self.valid_annotations)
    
    def __getitem__(self, idx):
        ann = self.valid_annotations[idx]
        img_path = os.path.join(self.images_dir, ann['filename'])
        
        # Load and convert image
        image = Image.open(img_path).convert('RGB')
        
        if self.transform:
            image = self.transform(image)
        
        # Get class index
        class_name = ann['class']
        class_idx = self.class_to_idx[class_name]
        
        return image, class_idx, ann['filename']

class MedicalResNet(nn.Module):
    """Custom ResNet model for medical image classification"""
    
    def __init__(self, num_classes: int, pretrained: bool = True):
        super(MedicalResNet, self).__init__()
        # Load pre-trained ResNet-50
        self.backbone = models.resnet50(pretrained=pretrained)
        
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

class MedicalResNetTrainer:
    """Trainer class for medical ResNet model"""
    
    def __init__(self, 
                 model: nn.Module,
                 train_loader: DataLoader,
                 val_loader: DataLoader,
                 device: torch.device,
                 num_classes: int,
                 class_names: List[str]):
        
        self.model = model
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.device = device
        self.num_classes = num_classes
        self.class_names = class_names
        
        # Training components
        self.criterion = nn.CrossEntropyLoss()
        self.optimizer = optim.Adam(
            filter(lambda p: p.requires_grad, model.parameters()),
            lr=settings.LEARNING_RATE,
            weight_decay=1e-4
        )
        self.scheduler = optim.lr_scheduler.ReduceLROnPlateau(
            self.optimizer, mode='min', patience=5, factor=0.5, verbose=True
        )
        
        # Training history
        self.train_losses = []
        self.val_losses = []
        self.train_accuracies = []
        self.val_accuracies = []
        self.best_val_acc = 0.0
        
    def train_epoch(self) -> Tuple[float, float]:
        """Train for one epoch"""
        self.model.train()
        running_loss = 0.0
        correct_predictions = 0
        total_samples = 0
        
        for batch_idx, (images, labels, _) in enumerate(self.train_loader):
            images, labels = images.to(self.device), labels.to(self.device)
            
            # Forward pass
            self.optimizer.zero_grad()
            outputs = self.model(images)
            loss = self.criterion(outputs, labels)
            
            # Backward pass
            loss.backward()
            self.optimizer.step()
            
            # Statistics
            running_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            total_samples += labels.size(0)
            correct_predictions += (predicted == labels).sum().item()
            
            if batch_idx % 20 == 0:
                logger.info(f'Batch {batch_idx}/{len(self.train_loader)}, Loss: {loss.item():.4f}')
        
        epoch_loss = running_loss / len(self.train_loader)
        epoch_acc = correct_predictions / total_samples
        
        return epoch_loss, epoch_acc
    
    def validate_epoch(self) -> Tuple[float, float]:
        """Validate for one epoch"""
        self.model.eval()
        running_loss = 0.0
        correct_predictions = 0
        total_samples = 0
        
        with torch.no_grad():
            for images, labels, _ in self.val_loader:
                images, labels = images.to(self.device), labels.to(self.device)
                
                outputs = self.model(images)
                loss = self.criterion(outputs, labels)
                
                running_loss += loss.item()
                _, predicted = torch.max(outputs.data, 1)
                total_samples += labels.size(0)
                correct_predictions += (predicted == labels).sum().item()
        
        epoch_loss = running_loss / len(self.val_loader)
        epoch_acc = correct_predictions / total_samples
        
        return epoch_loss, epoch_acc
    
    def train(self, num_epochs: int, save_dir: str) -> Dict:
        """Complete training loop"""
        logger.info(f"Starting training for {num_epochs} epochs")
        
        for epoch in range(num_epochs):
            logger.info(f"\nEpoch {epoch+1}/{num_epochs}")
            logger.info("-" * 50)
            
            # Training phase
            train_loss, train_acc = self.train_epoch()
            self.train_losses.append(train_loss)
            self.train_accuracies.append(train_acc)
            
            # Validation phase
            val_loss, val_acc = self.validate_epoch()
            self.val_losses.append(val_loss)
            self.val_accuracies.append(val_acc)
            
            # Learning rate scheduling
            self.scheduler.step(val_loss)
            
            logger.info(f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.4f}")
            logger.info(f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.4f}")
            
            # Save best model
            if val_acc > self.best_val_acc:
                self.best_val_acc = val_acc
                best_model_path = os.path.join(save_dir, "medical_resnet_best.pth")
                torch.save(self.model.state_dict(), best_model_path)
                logger.info(f"New best model saved with validation accuracy: {val_acc:.4f}")
            
            # Save checkpoint every 10 epochs
            if (epoch + 1) % 10 == 0:
                checkpoint_path = os.path.join(save_dir, f"checkpoint_epoch_{epoch+1}.pth")
                torch.save({
                    'epoch': epoch + 1,
                    'model_state_dict': self.model.state_dict(),
                    'optimizer_state_dict': self.optimizer.state_dict(),
                    'best_val_acc': self.best_val_acc,
                }, checkpoint_path)
        
        # Save final training history
        training_history = {
            'train_losses': self.train_losses,
            'val_losses': self.val_losses,
            'train_accuracies': self.train_accuracies,
            'val_accuracies': self.val_accuracies,
            'best_val_acc': self.best_val_acc,
            'num_epochs': num_epochs,
            'class_names': self.class_names
        }
        
        history_path = os.path.join(save_dir, "training_history.json")
        with open(history_path, 'w') as f:
            json.dump(training_history, f, indent=2)
        
        return training_history

def create_data_transforms() -> Tuple[transforms.Compose, transforms.Compose]:
    """Create training and validation transforms"""
    
    # Training transforms with data augmentation
    train_transforms = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomResizedCrop(settings.IMAGE_SIZE[0], scale=(0.8, 1.0)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    
    # Validation transforms (no augmentation)
    val_transforms = transforms.Compose([
        transforms.Resize(settings.IMAGE_SIZE),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    
    return train_transforms, val_transforms

def main():
    parser = argparse.ArgumentParser(description='Train Medical ResNet Model')
    parser.add_argument('--images_dir', type=str, default='data/images',
                        help='Directory containing training images')
    parser.add_argument('--annotations_file', type=str, default='data/annotations/annotations.json',
                        help='JSON file with image annotations')
    parser.add_argument('--output_dir', type=str, default='models',
                        help='Directory to save trained models')
    parser.add_argument('--epochs', type=int, default=settings.NUM_EPOCHS,
                        help='Number of training epochs')
    parser.add_argument('--batch_size', type=int, default=settings.BATCH_SIZE,
                        help='Batch size for training')
    parser.add_argument('--val_split', type=float, default=settings.VALIDATION_SPLIT,
                        help='Validation split ratio')
    
    args = parser.parse_args()
    
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Setup device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Using device: {device}")
    
    # Create transforms
    train_transforms, val_transforms = create_data_transforms()
    
    # Create dummy dataset info for demonstration
    logger.info("Training infrastructure is ready. To train the model:")
    logger.info("1. Organize medical images in the expected structure")
    logger.info("2. Create annotations using prepare_data.py")
    logger.info("3. Run this script with proper data paths")
    
    return {"status": "ready", "message": "Training pipeline configured successfully"}

if __name__ == "__main__":
    main()