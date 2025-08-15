# Models Directory

This directory contains the trained machine learning models for the Luna Health App.

## Required Model Files

### Pattern Detection
- `pattern_aware_resnet18_final.pth` - Pattern-aware ResNet18 model for LC droplet pattern detection
  - Used to classify bipolar-circle vs radial-cross patterns
  - Size: ~45MB
  - Architecture: ResNet18 with pattern-aware modifications

### Nail Hemoglobin Analysis  
- `nail_detection_model_final.pth` - Faster R-CNN model for nail detection
- `hemoglobin_model_scale_corrected_FINAL.pth` - ResNet-18 model for hemoglobin prediction

## Setup Instructions

1. **For Pattern Detection**: 
   Copy your `pattern_aware_resnet18_final.pth` file from your Jupyter notebook training to this directory.

2. **For Nail Hemoglobin**:
   The nail hemoglobin models should already be in place from previous setup.

3. **Git LFS** (for large files):
   ```bash
   git lfs track "*.pth"
   git add .gitattributes
   git add models/
   git commit -m "Add model files"
   ```

## Model Files Status

- [ ] `pattern_aware_resnet18_final.pth` - **REQUIRED for pattern detection**
- [x] `nail_detection_model_final.pth` - Nail detection model
- [x] `hemoglobin_model_scale_corrected_FINAL.pth` - Hemoglobin prediction model

## Testing Model Availability

You can check if the models are available using the API endpoints:

- Pattern Detection: `GET /api/v1/health/pattern-status`
- Nail Hemoglobin: `GET /api/v1/health/hemoglobin-status`

## Service Architecture

- **PatternDetectionService**: Handles LC droplet pattern detection and classification
- **NailHemoglobinService**: Handles nail-based hemoglobin level analysis  
- **VisionAnalysisService**: General health image analysis

Each service loads its models lazily (on first use) to optimize startup time.
