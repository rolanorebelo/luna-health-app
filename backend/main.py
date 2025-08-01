






import uvicorn
from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from db import SessionLocal, engine, Base
from models import User
from auth_utils import get_password_hash, verify_password, create_access_token, decode_access_token
from pydantic import BaseModel
from typing import Optional
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

class UserRegister(BaseModel):
    username: str
    password: str

class OnboardingData(BaseModel):
    first_name: str = ""
    last_name: str = ""
    age: int = 0
    reproductive_stage: str = ""
    health_goals: list = []
    onboarding_completed: bool = False


# Expanded UserProfile for frontend
class UserProfile(BaseModel):
    id: Optional[int] = None
    username: str
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    age: Optional[int] = None
    race: Optional[str] = None
    location: Optional[str] = None
    reproductive_stage: Optional[str] = None
    health_goals: Optional[list] = None
    medical_history: Optional[dict] = None
    preferences: Optional[dict] = None
    onboarding_completed: bool
    created_at: Optional[str] = None
    onboarding: Optional[dict] = None

async def get_db():
    async with SessionLocal() as session:
        yield session

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
def read_root():
    return {"message": "Backend is running!"}

@app.post("/register")
async def register(user: UserRegister, db: AsyncSession = Depends(get_db)):
    hashed_pw = get_password_hash(user.password)
    db_user = User(username=user.username, hashed_password=hashed_pw)
    db.add(db_user)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Username already exists")
    return {"message": "User registered successfully"}

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token({"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "onboarding_completed": user.onboarding_completed}

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    try:
        payload = decode_access_token(token)
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# Expanded /profile endpoint for frontend
@app.get("/profile", response_model=UserProfile)
async def get_profile(current_user: User = Depends(get_current_user)):
    onboarding = current_user.onboarding or {}
    # Extract nested fields for frontend compatibility
    personal_info = onboarding.get("personalInfo", {})
    reproductive_health = onboarding.get("reproductiveHealth", {})
    medical_history = onboarding.get("medicalHistory", {})
    lifestyle = onboarding.get("lifestyle", {})
    preferences = onboarding.get("preferences", {})
    health_goals = onboarding.get("healthGoals", onboarding.get("health_goals", []))
    return {
        "id": getattr(current_user, "id", None),
        "username": current_user.username,
        "email": personal_info.get("email"),
        "first_name": personal_info.get("firstName"),
        "last_name": personal_info.get("lastName"),
        "age": onboarding.get("age"),
        "race": personal_info.get("race"),
        "location": personal_info.get("location"),
        "reproductive_stage": reproductive_health.get("stage"),
        "health_goals": health_goals,
        "medical_history": medical_history,
        "preferences": preferences,
        "lifestyle": lifestyle,
        "onboarding_completed": current_user.onboarding_completed,
        "created_at": None,
        "onboarding": onboarding
    }


# Save all onboarding fields in onboarding JSON and set onboarding_completed
@app.post("/onboarding")
async def onboarding(data: OnboardingData, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    current_user.onboarding = data.dict()
    current_user.onboarding_completed = True
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return {"message": "Onboarding data saved", "onboarding": current_user.onboarding}
