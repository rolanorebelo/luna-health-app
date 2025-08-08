from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from typing import List, Optional
import io
from PIL import Image
import json

from app.services.vision_analysis import VisionAnalysisService
from app.services.llm_health_service import LLMHealthService
from app.services.nail_hemoglobin_service import NailHemoglobinService
from app.core.config import settings

router = APIRouter()

# Initialize services
vision_service = VisionAnalysisService()
llm_service = LLMHealthService()
nail_hemoglobin_service = NailHemoglobinService()

@router.post("/analyze-image")
async def analyze_health_image(
    file: UploadFile = File(...),
    analysis_type: str = Form(...),  # "skin" or "discharge"
    symptoms: Optional[str] = Form(None),  # JSON string of symptoms
    user_age: Optional[int] = Form(None),
    user_phase: Optional[str] = Form(None)  # menstrual phase
):
    """
    Analyze health image with AI
    """
    # Validate file
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Read and process image
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    
    # Parse symptoms if provided
    symptom_list = []
    if symptoms:
        try:
            symptom_list = json.loads(symptoms)
        except:
            symptom_list = []
    
    # Perform image analysis
    if analysis_type == "skin":
        image_results = await vision_service.analyze_skin_condition(image)
    elif analysis_type == "discharge":
        image_results = await vision_service.analyze_discharge(image)
    else:
        raise HTTPException(status_code=400, detail="Invalid analysis type")
    
    # Create user context
    user_context = {
        "age": user_age,
        "menstrual_phase": user_phase
    }
    
    # Get LLM health analysis
    health_analysis = await llm_service.analyze_with_context(
        image_results,
        analysis_type,
        symptom_list,
        user_context
    )
    
    # Combine results
    final_response = {
        "status": "success",
        "image_analysis": image_results,
        "health_assessment": health_analysis,
        "analysis_type": analysis_type,
        "timestamp": "2024-01-15T10:30:00Z"  # Add proper timestamp
    }
    
    return JSONResponse(content=final_response)

@router.post("/analyze-hemoglobin")
async def analyze_nail_hemoglobin(
    file: UploadFile = File(...),
    user_age: Optional[int] = Form(None),
    symptoms: Optional[str] = Form(None)  # JSON string of symptoms
):
    """
    Analyze hemoglobin levels from nail images
    """
    # Check if models are available
    model_status = nail_hemoglobin_service.check_models_available()
    if not model_status['models_ready']:
        raise HTTPException(
            status_code=503, 
            detail="Nail hemoglobin analysis service is not available. Model files are missing."
        )
    
    # Validate file
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a JPEG, PNG, or WebP image.")
    
    # Check file size (optional - already handled by FastAPI settings)
    if file.size and file.size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File too large")
    
    try:
        # Read and process image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Parse symptoms if provided
        symptom_list = []
        if symptoms:
            try:
                symptom_list = json.loads(symptoms)
            except:
                symptom_list = []
        
        # Perform nail hemoglobin analysis
        nail_analysis_result = await nail_hemoglobin_service.analyze_hemoglobin(
            image=image,
            user_age=user_age,
            symptoms=symptom_list
        )
        
        # If analysis failed, return early
        if not nail_analysis_result.get('success', False):
            return JSONResponse(
                status_code=400,
                content={
                    "status": "error",
                    "message": nail_analysis_result.get('message', 'Analysis failed'),
                    "nail_analysis": nail_analysis_result.get('nail_analysis', {})
                }
            )
        
        # Create user context for LLM
        user_context = {
            "age": user_age,
            "symptoms": symptom_list,
            "analysis_type": "hemoglobin"
        }
        
        # Get enhanced health assessment from LLM
        health_assessment = await llm_service.analyze_hemoglobin_with_context(
            nail_analysis_result,
            symptom_list,
            user_context
        )
        
        # Combine results
        final_response = {
            "status": "success",
            "nail_analysis": nail_analysis_result['nail_analysis'],
            "health_assessment": health_assessment,
            "medical_context": {
                "normal_range": "120-160 g/L for women",
                "interpretation": nail_hemoglobin_service.get_interpretation(
                    nail_analysis_result['nail_analysis']['average_hemoglobin_g_per_L']
                )['interpretation']
            },
            "timestamp": nail_analysis_result['timestamp']
        }
        
        return JSONResponse(content=final_response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/health-check")
async def health_check():
    """Check if the service is running"""
    return {"status": "healthy", "service": "Luna Health AI"}

@router.get("/hemoglobin-status")
async def hemoglobin_service_status():
    """Check if the nail hemoglobin service is available"""
    try:
        model_status = nail_hemoglobin_service.check_models_available()
        return {
            "status": "ready" if model_status['models_ready'] else "not_ready",
            "models": model_status,
            "service": "Nail Hemoglobin Analysis"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "service": "Nail Hemoglobin Analysis"
        }