from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
import io
from PIL import Image
import json
import logging
from datetime import datetime
import traceback

from app.services.vision_analysis import VisionAnalysisService
from app.services.llm_health_service import LLMHealthService
from app.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize services with error handling
try:
    vision_service = VisionAnalysisService()
    logger.info("Vision analysis service initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize vision service: {e}")
    vision_service = None

try:
    llm_service = LLMHealthService()
    logger.info("LLM health service initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize LLM service: {e}")
    llm_service = None

def validate_image_file(file: UploadFile) -> Dict[str, Any]:
    """Validate uploaded image file"""
    validation_result = {
        "valid": True,
        "issues": [],
        "warnings": []
    }
    
    # Check content type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type not in allowed_types:
        validation_result["valid"] = False
        validation_result["issues"].append(f"Invalid file type: {file.content_type}")
    
    # Check file size (if available)
    if hasattr(file, 'size') and file.size:
        if file.size > settings.MAX_UPLOAD_SIZE:
            validation_result["valid"] = False
            validation_result["issues"].append(f"File too large: {file.size} bytes (max: {settings.MAX_UPLOAD_SIZE})")
        elif file.size < 1024:  # Less than 1KB
            validation_result["warnings"].append("Very small file size - may affect analysis quality")
    
    # Check filename extension
    if file.filename:
        extension = file.filename.lower().split('.')[-1]
        if f".{extension}" not in settings.ALLOWED_EXTENSIONS:
            validation_result["warnings"].append(f"Unusual file extension: .{extension}")
    
    return validation_result

def process_image_safely(file_contents: bytes) -> tuple[Image.Image, Dict[str, Any]]:
    """Safely process uploaded image with validation"""
    processing_result = {
        "success": True,
        "issues": [],
        "warnings": [],
        "image_info": {}
    }
    
    try:
        # Open and validate image
        image = Image.open(io.BytesIO(file_contents))
        
        # Get image information
        processing_result["image_info"] = {
            "format": image.format,
            "mode": image.mode,
            "size": image.size,
            "width": image.size[0],
            "height": image.size[1]
        }
        
        # Validate image properties
        width, height = image.size
        
        if width < settings.MIN_IMAGE_SIZE[0] or height < settings.MIN_IMAGE_SIZE[1]:
            processing_result["warnings"].append(
                f"Image resolution ({width}x{height}) is below recommended minimum "
                f"({settings.MIN_IMAGE_SIZE[0]}x{settings.MIN_IMAGE_SIZE[1]})"
            )
        
        if width > settings.MAX_IMAGE_DIMENSION or height > settings.MAX_IMAGE_DIMENSION:
            processing_result["warnings"].append(
                f"Image resolution ({width}x{height}) is very high - may slow processing"
            )
        
        # Convert to RGB if needed
        if image.mode not in ['RGB', 'L']:
            if image.mode == 'RGBA':
                # Handle transparency by creating white background
                background = Image.new('RGB', image.size, (255, 255, 255))
                background.paste(image, mask=image.split()[-1])  # Use alpha channel as mask
                image = background
                processing_result["warnings"].append("Converted RGBA to RGB (removed transparency)")
            else:
                image = image.convert('RGB')
                processing_result["warnings"].append(f"Converted {image.mode} to RGB")
        
        return image, processing_result
        
    except Exception as e:
        processing_result["success"] = False
        processing_result["issues"].append(f"Image processing failed: {str(e)}")
        logger.error(f"Image processing error: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

def parse_symptoms_safely(symptoms_json: Optional[str]) -> List[str]:
    """Safely parse symptoms JSON string"""
    if not symptoms_json:
        return []
    
    try:
        symptoms = json.loads(symptoms_json)
        if isinstance(symptoms, list):
            return [str(s) for s in symptoms]
        elif isinstance(symptoms, str):
            return [symptoms]
        else:
            logger.warning(f"Unexpected symptoms format: {type(symptoms)}")
            return []
    except json.JSONDecodeError as e:
        logger.warning(f"Failed to parse symptoms JSON: {e}")
        return []

@router.post("/analyze-image")
async def analyze_health_image(
    file: UploadFile = File(...),
    analysis_type: str = Form(...),  # "skin" or "discharge"
    symptoms: Optional[str] = Form(None),  # JSON string of symptoms
    user_age: Optional[int] = Form(None),
    user_phase: Optional[str] = Form(None)  # menstrual phase
):
    """
    Analyze health image with enhanced AI system
    
    - **file**: Image file (JPEG, PNG, WebP)
    - **analysis_type**: Type of analysis ("skin" or "discharge")
    - **symptoms**: JSON string of symptoms (optional)
    - **user_age**: User's age (optional)
    - **user_phase**: Menstrual phase (optional)
    """
    
    # Check if services are available
    if vision_service is None:
        raise HTTPException(
            status_code=503, 
            detail="Vision analysis service unavailable"
        )
    
    start_time = datetime.utcnow()
    
    try:
        # Validate analysis type
        if analysis_type not in ["skin", "discharge"]:
            raise HTTPException(
                status_code=400, 
                detail="Invalid analysis type. Must be 'skin' or 'discharge'"
            )
        
        # Validate uploaded file
        file_validation = validate_image_file(file)
        if not file_validation["valid"]:
            raise HTTPException(
                status_code=400,
                detail=f"File validation failed: {', '.join(file_validation['issues'])}"
            )
        
        # Read and process image
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
        
        image, processing_info = process_image_safely(contents)
        
        # Parse symptoms
        symptom_list = parse_symptoms_safely(symptoms)
        
        # Validate user inputs
        if user_age is not None and (user_age < 0 or user_age > 120):
            raise HTTPException(status_code=400, detail="Invalid age provided")
        
        # Create user context
        user_context = {
            "age": user_age,
            "menstrual_phase": user_phase,
            "symptoms": symptom_list
        }
        
        # Perform image analysis
        logger.info(f"Starting {analysis_type} analysis for image: {file.filename}")
        
        if analysis_type == "skin":
            image_results = await vision_service.analyze_skin_condition(image)
        else:  # discharge
            image_results = await vision_service.analyze_discharge(image)
        
        # Get LLM health analysis if service is available
        health_analysis = None
        if llm_service is not None:
            try:
                health_analysis = await llm_service.analyze_with_context(
                    image_results,
                    analysis_type,
                    symptom_list,
                    user_context
                )
            except Exception as e:
                logger.warning(f"LLM analysis failed: {e}")
                health_analysis = {
                    "status": "failed",
                    "error": "LLM analysis unavailable",
                    "fallback_used": True
                }
        
        # Calculate processing time
        end_time = datetime.utcnow()
        processing_time = (end_time - start_time).total_seconds()
        
        # Compile final response
        final_response = {
            "status": "success",
            "analysis_type": analysis_type,
            "image_analysis": image_results,
            "health_assessment": health_analysis,
            "user_context": user_context,
            "processing_info": {
                "file_validation": file_validation,
                "image_processing": processing_info,
                "processing_time_seconds": round(processing_time, 2),
                "timestamp": end_time.isoformat() + "Z",
                "model_versions": {
                    "vision_service": "enhanced_v1.0",
                    "gpt4_vision": settings.OPENAI_MODEL if hasattr(settings, 'OPENAI_MODEL') else "gpt-4-vision-preview",
                    "medical_resnet": "custom_v1.0"
                }
            },
            "confidence_score": image_results.get("ensemble_confidence", 0.0),
            "recommendations": image_results.get("recommendations", []),
            "disclaimers": [
                "This analysis is for educational purposes only",
                "Results should not replace professional medical advice",
                "Consult a healthcare provider for proper diagnosis and treatment"
            ]
        }
        
        # Add warnings if any
        all_warnings = file_validation.get("warnings", []) + processing_info.get("warnings", [])
        if all_warnings:
            final_response["processing_info"]["warnings"] = all_warnings
        
        logger.info(f"Analysis completed successfully in {processing_time:.2f}s")
        
        return JSONResponse(content=final_response)
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
        
    except Exception as e:
        # Log detailed error for debugging
        error_details = {
            "error": str(e),
            "traceback": traceback.format_exc(),
            "analysis_type": analysis_type,
            "filename": file.filename if file else "unknown"
        }
        logger.error(f"Analysis failed: {json.dumps(error_details, indent=2)}")
        
        # Return user-friendly error
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Image analysis failed",
                "error_type": type(e).__name__,
                "error_details": str(e),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        )

@router.get("/health-check")
async def health_check():
    """Check if the service is running and all components are available"""
    
    service_status = {
        "status": "healthy",
        "service": "Luna Health AI - Enhanced Vision Analysis",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": "2.0.0",
        "components": {}
    }
    
    # Check vision service
    if vision_service is not None:
        service_status["components"]["vision_analysis"] = {
            "status": "available",
            "features": ["gpt4_vision", "medical_resnet", "image_preprocessing", "quality_validation"]
        }
    else:
        service_status["components"]["vision_analysis"] = {
            "status": "unavailable",
            "error": "Service failed to initialize"
        }
    
    # Check LLM service
    if llm_service is not None:
        service_status["components"]["llm_analysis"] = {
            "status": "available"
        }
    else:
        service_status["components"]["llm_analysis"] = {
            "status": "unavailable",
            "error": "Service failed to initialize"
        }
    
    # Check model availability
    model_status = {}
    try:
        if hasattr(vision_service, 'resnet_model'):
            model_status["medical_resnet"] = "loaded"
        if hasattr(vision_service, 'client'):
            model_status["gpt4_vision"] = "configured"
    except:
        model_status["error"] = "Unable to check model status"
    
    service_status["components"]["models"] = model_status
    
    # Overall health determination
    if vision_service is None:
        service_status["status"] = "degraded"
        service_status["issues"] = ["Vision analysis service unavailable"]
    
    return service_status

@router.get("/supported-formats")
async def get_supported_formats():
    """Get information about supported image formats and requirements"""
    
    return {
        "supported_formats": {
            "image_types": ["JPEG", "PNG", "WebP"],
            "mime_types": ["image/jpeg", "image/png", "image/webp", "image/jpg"],
            "file_extensions": list(settings.ALLOWED_EXTENSIONS)
        },
        "requirements": {
            "max_file_size_mb": settings.MAX_UPLOAD_SIZE / (1024 * 1024),
            "min_resolution": settings.MIN_IMAGE_SIZE,
            "max_dimension": settings.MAX_IMAGE_DIMENSION,
            "recommended_size": settings.IMAGE_SIZE,
            "quality_threshold": settings.QUALITY_THRESHOLD
        },
        "analysis_types": {
            "skin": {
                "description": "Skin condition analysis",
                "supported_conditions": settings.SKIN_CONDITIONS
            },
            "discharge": {
                "description": "Vaginal discharge analysis", 
                "supported_conditions": settings.DISCHARGE_CONDITIONS
            }
        }
    }

@router.get("/model-info")
async def get_model_info():
    """Get information about the AI models used for analysis"""
    
    model_info = {
        "models": {
            "gpt4_vision": {
                "name": "GPT-4 Vision",
                "provider": "OpenAI",
                "version": settings.OPENAI_MODEL if hasattr(settings, 'OPENAI_MODEL') else "gpt-4-vision-preview",
                "description": "Advanced vision model for medical image analysis",
                "capabilities": ["image_understanding", "medical_assessment", "detailed_analysis"]
            },
            "medical_resnet": {
                "name": "Medical ResNet-50",
                "provider": "Custom",
                "version": "1.0",
                "description": "Specialized ResNet model trained on medical images",
                "classes": len(settings.SKIN_CONDITIONS + settings.DISCHARGE_CONDITIONS),
                "capabilities": ["medical_classification", "confidence_scoring"]
            },
            "image_preprocessing": {
                "name": "OpenCV Enhancement Pipeline",
                "version": "4.8+",
                "description": "Image preprocessing for medical analysis",
                "features": ["CLAHE_enhancement", "noise_reduction", "contrast_adjustment"]
            }
        },
        "ensemble_approach": {
            "description": "Combines multiple AI models for improved accuracy",
            "confidence_calculation": "Weighted average of model confidences",
            "quality_validation": "Comprehensive image quality assessment"
        }
    }
    
    return model_info