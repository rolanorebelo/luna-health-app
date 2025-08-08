from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # API Keys
    OPENAI_API_KEY: str
    
    # App Settings
    APP_NAME: str = "Luna Health AI"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:3001"]
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: set = {".jpg", ".jpeg", ".png", ".webp"}
    
    # Model Configuration
    MODELS_DIR: str = "models"
    RESNET_MODEL_PATH: str = os.path.join("models", "medical_resnet_best.pth")
    OPENAI_MODEL: str = "gpt-4-vision-preview"
    
    # Medical Classes
    SKIN_CONDITIONS: list = [
        "normal_skin", "acne", "eczema", "psoriasis", 
        "melanoma", "basal_cell_carcinoma", "seborrheic_keratosis"
    ]
    DISCHARGE_CONDITIONS: list = [
        "normal_white", "normal_clear", "yeast_infection",
        "bacterial_vaginosis", "trichomoniasis", "menstrual_blood"
    ]
    
    # Image Processing
    IMAGE_SIZE: tuple = (224, 224)
    MIN_IMAGE_SIZE: tuple = (100, 100)
    MAX_IMAGE_DIMENSION: int = 2048
    BLUR_THRESHOLD: float = 100.0
    QUALITY_THRESHOLD: float = 0.7
    
    # Training Configuration
    BATCH_SIZE: int = 32
    LEARNING_RATE: float = 0.001
    NUM_EPOCHS: int = 50
    VALIDATION_SPLIT: float = 0.2
    
    class Config:
        env_file = ".env"

settings = Settings()