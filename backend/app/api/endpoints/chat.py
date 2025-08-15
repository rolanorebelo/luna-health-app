from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
from datetime import datetime

from app.services.rag_services import HealthKnowledgeRAG
from app.core.config import settings

router = APIRouter()

# Initialize RAG service
try:
    health_rag = HealthKnowledgeRAG()
except Exception as e:
    print(f"Warning: RAG service initialization failed: {e}")
    health_rag = None

class ChatMessage(BaseModel):
    message: str
    user_context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    category: str
    quick_actions: List[str]
    timestamp: str

@router.post("/send-message", response_model=ChatResponse)
async def send_chat_message(request: ChatMessage):
    """
    Send a message to the AI chatbot and get a RAG-enhanced response
    """
    if not health_rag:
        raise HTTPException(status_code=503, detail="Chat service is not available")
    
    try:
        # Get relevant context from RAG system
        relevant_context = health_rag.get_context_string(request.message, k=3)
        
        # Create enhanced prompt with medical context
        enhanced_prompt = _create_enhanced_prompt(
            request.message, 
            relevant_context, 
            request.user_context
        )
        
        # Generate response using the enhanced prompt
        response = await _generate_rag_response(enhanced_prompt, request.message)
        
        return ChatResponse(
            response=response["content"],
            category=response["category"], 
            quick_actions=response["quick_actions"],
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        print(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate response")

def _create_enhanced_prompt(user_message: str, medical_context: str, user_context: Dict = None) -> str:
    """Create an enhanced prompt with medical context and user information"""
    
    # Extract user context safely
    cycle_day = user_context.get("cycleDay", "unknown") if user_context else "unknown"
    phase = user_context.get("phase", "unknown") if user_context else "unknown"
    age = user_context.get("age", "unknown") if user_context else "unknown"
    
    prompt = f"""You are WIHHMS, a compassionate and knowledgeable women's health AI assistant. You provide empathetic, evidence-based guidance while always encouraging professional medical consultation when appropriate.

USER CONTEXT:
- Cycle day: {cycle_day}
- Menstrual phase: {phase}
- Age: {age}

RELEVANT MEDICAL KNOWLEDGE:
{medical_context}

USER QUESTION: {user_message}

Please provide a comprehensive, empathetic response that:
1. Acknowledges the user's concerns with empathy
2. Uses the medical knowledge provided to give accurate information
3. Personalizes advice based on their cycle phase and context
4. Includes clear guidance on when to seek professional care
5. Offers practical, actionable advice
6. Maintains a warm, supportive tone throughout

Focus on women's health topics including menstrual health, fertility, vaginal health, UTI prevention and symptoms, hormonal changes, and overall reproductive wellness.

Always remind users that this is educational information and not a substitute for professional medical advice."""

    return prompt

async def _generate_rag_response(prompt: str, original_message: str) -> Dict[str, Any]:
    """Generate response using RAG-enhanced prompt"""
    
    # For now, provide intelligent pattern matching with medical context
    # In a production environment, this would call OpenAI or another LLM
    
    lower_message = original_message.lower()
    
    # Determine category and generate appropriate response
    if any(keyword in lower_message for keyword in ['uti', 'urinary', 'burning', 'infection', 'bladder']):
        category = 'uti-health'
        content = _generate_uti_response(original_message)
        quick_actions = ['UTI prevention tips', 'When to see a doctor', 'Home remedies', 'Symptoms to watch']
        
    elif any(keyword in lower_message for keyword in ['discharge', 'vaginal', 'itching', 'odor', 'yeast']):
        category = 'vaginal-health'
        content = _generate_vaginal_health_response(original_message)
        quick_actions = ['Normal vs abnormal discharge', 'pH balance tips', 'Hygiene recommendations', 'When to seek care']
        
    elif any(keyword in lower_message for keyword in ['period', 'menstrual', 'cycle', 'bleeding']):
        category = 'menstrual-health'
        content = _generate_menstrual_response(original_message)
        quick_actions = ['Cycle tracking', 'Pain management', 'Flow patterns', 'Irregular periods']
        
    elif any(keyword in lower_message for keyword in ['fertil', 'ovulat', 'conceiv', 'pregnancy']):
        category = 'fertility'
        content = _generate_fertility_response(original_message)
        quick_actions = ['Ovulation tracking', 'Fertility signs', 'Conception tips', 'Age and fertility']
        
    elif any(keyword in lower_message for keyword in ['mood', 'emotional', 'anxiety', 'depression', 'pms']):
        category = 'mental-wellness'
        content = _generate_mental_wellness_response(original_message)
        quick_actions = ['Mood tracking', 'Stress management', 'Hormonal effects', 'Support resources']
        
    else:
        category = 'general-health'
        content = _generate_general_response(original_message)
        quick_actions = ['Ask about symptoms', 'Cycle questions', 'Health tracking', 'Preventive care']
    
    return {
        "content": content,
        "category": category,
        "quick_actions": quick_actions
    }

def _generate_uti_response(message: str) -> str:
    """Generate UTI-specific response with medical accuracy"""
    return """I understand you're concerned about UTI symptoms. This is a common women's health issue that requires attention.

**Common UTI Symptoms:**
• Burning sensation when urinating
• Frequent, urgent need to urinate
• Cloudy or strong-smelling urine
• Pelvic pain (in women)
• Blood in urine (sometimes)

**Immediate Steps:**
• Drink plenty of water to help flush bacteria
• Urinate frequently, don't hold it
• Wipe front to back after bathroom use
• Avoid irritating products (scented soaps, douches)

**Prevention Tips:**
• Stay well-hydrated (8+ glasses of water daily)
• Urinate after sexual activity
• Wear breathable cotton underwear
• Avoid tight-fitting clothing

**When to Seek Medical Care:**
• Symptoms persist for more than 24-48 hours
• Fever, chills, or back pain develop
• Blood in urine
• Severe pain or frequent recurrent UTIs

UTIs are very treatable with proper medical care. If you're experiencing symptoms, it's important to see a healthcare provider for proper diagnosis and treatment, typically antibiotics if bacterial."""

def _generate_vaginal_health_response(message: str) -> str:
    """Generate vaginal health response with medical context"""
    return """Vaginal health is an important aspect of overall women's wellness. I'm here to help you understand what's normal and when to be concerned.

**Normal Vaginal Discharge:**
• Clear or milky white color
• Mild or no odor
• Consistency changes throughout your cycle
• Increases around ovulation (clear, stretchy)
• Thicker before periods

**Signs to Monitor:**
• Sudden changes in color, smell, or texture
• Green, gray, or bright yellow discharge
• Strong fishy or foul odor
• Accompanied by itching, burning, or pain

**Maintaining Vaginal Health:**
• Use gentle, unscented products for cleansing
• Wear breathable cotton underwear
• Avoid douching (disrupts natural balance)
• Change tampons/pads regularly
• Practice safe sex

**When to See a Healthcare Provider:**
• Unusual discharge with strong odor
• Itching, burning, or discomfort
• Bleeding between periods
• Pelvic pain or pressure

Your vagina has a natural self-cleaning system. Small changes throughout your cycle are normal, but trust your instincts—if something feels different, it's worth discussing with a healthcare professional."""

def _generate_menstrual_response(message: str) -> str:
    """Generate menstrual health response"""
    return """Menstrual health varies greatly between individuals, and understanding your unique patterns is key to overall wellness.

**Normal Cycle Characteristics:**
• Length: 21-35 days (average 28 days)
• Flow duration: 3-7 days
• Color: Bright red to dark brown
• Volume: Light to heavy (changing pad/tampon every 2-6 hours)

**Cycle Phase Understanding:**
• Menstrual: Days 1-5 (bleeding)
• Follicular: Days 1-13 (preparing for ovulation)
• Ovulatory: Days 14-16 (egg release)
• Luteal: Days 15-28 (post-ovulation)

**Managing Period Discomfort:**
• Heat therapy for cramps
• Gentle exercise and stretching
• Anti-inflammatory medications as needed
• Adequate hydration and nutrition

**Concerning Signs:**
• Cycles shorter than 21 days or longer than 35 days
• Bleeding lasting more than 7 days
• Extremely heavy bleeding (soaking pad/tampon hourly)
• Severe pain that interferes with daily activities

Tracking your cycle helps identify patterns and changes. Every woman's cycle is unique, so focus on what's normal for you and note any significant changes to discuss with your healthcare provider."""

def _generate_fertility_response(message: str) -> str:
    """Generate fertility-focused response"""
    return """Understanding fertility involves recognizing your body's natural signals and optimizing your health for conception when desired.

**Key Fertility Signs:**
• Cervical mucus changes (clear, stretchy during ovulation)
• Basal body temperature shifts
• Ovulation pain or mittelschmerz
• Changes in cervical position

**Optimizing Fertility:**
• Track ovulation patterns consistently
• Maintain a healthy weight and nutrition
• Take prenatal vitamins with folic acid
• Limit alcohol and eliminate smoking
• Manage stress levels
• Regular moderate exercise

**Timing for Conception:**
• Fertile window: 5 days before through day of ovulation
• Peak fertility: 2-3 days before ovulation
• Regular intercourse every 2-3 days throughout cycle

**When to Consult a Specialist:**
• Trying to conceive for 12 months (under 35) or 6 months (over 35)
• Irregular or absent periods
• History of pelvic inflammatory disease
• Known reproductive health conditions

Fertility awareness helps whether you're trying to conceive or prevent pregnancy. Understanding your cycle empowers you to make informed decisions about your reproductive health."""

def _generate_mental_wellness_response(message: str) -> str:
    """Generate mental wellness response"""
    return """Mental wellness and reproductive health are deeply connected through hormonal fluctuations throughout your cycle.

**Hormonal Effects on Mood:**
• Estrogen and progesterone influence neurotransmitters
• PMS symptoms affect 75% of menstruating individuals
• Mood changes are normal but shouldn't be debilitating
• PMDD (severe PMS) affects 3-8% of women

**Supporting Mental Wellness:**
• Regular exercise and movement
• Consistent sleep schedule (7-9 hours)
• Stress management techniques (meditation, deep breathing)
• Balanced nutrition with adequate omega-3s
• Social support and connection

**Cycle-Based Self-Care:**
• Menstrual phase: Rest and gentleness
• Follicular phase: Planning and new projects
• Ovulatory phase: Social activities and communication
• Luteal phase: Reflection and preparation

**When to Seek Support:**
• Mood changes severely impact daily life
• Persistent sadness or anxiety
• Thoughts of self-harm
• Inability to cope with daily activities

Your mental health matters just as much as your physical health. Hormonal fluctuations can affect mood, but severe symptoms shouldn't be dismissed as "just PMS." Professional support is available and effective."""

def _generate_general_response(message: str) -> str:
    """Generate general health response"""
    return """Thank you for reaching out! As your AI health companion, I'm here to provide evidence-based information about women's health while encouraging professional medical care when appropriate.

**How I Can Help:**
• Menstrual cycle education and tracking
• Reproductive health information
• Symptom understanding and guidance
• Preventive care recommendations
• Emotional support and validation

**Areas of Focus:**
• Menstrual health and cycle irregularities
• Fertility awareness and family planning
• Vaginal and urinary health
• Hormonal changes and their effects
• Mental wellness and mood
• Preventive care and healthy lifestyle

**Important Reminders:**
• This information is educational, not diagnostic
• Always consult healthcare providers for persistent symptoms
• Trust your instincts about your body
• Regular check-ups support long-term health

I'm trained in women's health topics and aim to provide compassionate, accurate information. Feel free to ask specific questions about symptoms, cycle concerns, or general wellness. What would you like to know more about?"""

@router.get("/health-check")
async def chat_health_check():
    """Check if the chat service is running properly"""
    status = "healthy" if health_rag else "degraded"
    return {
        "status": status,
        "service": "Luna Health Chat",
        "rag_available": health_rag is not None
    }