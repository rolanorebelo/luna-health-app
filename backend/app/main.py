from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints.health_analysis import router as health_router

app = FastAPI(title=settings.APP_NAME)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    health_router,
    prefix=f"{settings.API_V1_STR}/health",
    tags=["health-analysis"]
)

@app.get("/")
async def root():
    return {
        "message": "Luna Health AI API - Enhanced with ResNet + LLM",
        "version": "2.0.0",
        "features": [
            "GPT-4 Vision integration", 
            "Custom Medical ResNet", 
            "OpenCV image preprocessing",
            "Quality validation",
            "Ensemble confidence scoring"
        ]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Luna Health AI - Enhanced ResNet + LLM Integration",
        "medical_classes": len(settings.SKIN_CONDITIONS + settings.DISCHARGE_CONDITIONS),
        "skin_conditions": settings.SKIN_CONDITIONS,
        "discharge_conditions": settings.DISCHARGE_CONDITIONS
    }