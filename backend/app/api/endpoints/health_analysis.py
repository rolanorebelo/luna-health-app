from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from typing import List, Optional
import io
from PIL import Image
import json

from app.services.vision_analysis import VisionAnalysisService
from app.services.llm_health_service import LLMHealthService
from app.core.config import settings

router = APIRouter()

# Initialize services
vision_service = VisionAnalysisService()
llm_service = LLMHealthService()

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

@router.get("/health-check")
async def health_check():
    """Check if the service is running"""
    return {"status": "healthy", "service": "Luna Health AI"}