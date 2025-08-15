import openai
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI
from typing import Dict, Any, Optional
import json
from app.core.config import settings
from typing import List, Optional

class LLMHealthService:
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY
        self.embeddings = OpenAIEmbeddings()
        
        # Initialize vector store with women's health knowledge
        # For demo, we'll use in-memory store
        self.health_knowledge = self._initialize_health_knowledge()
        
    def _initialize_health_knowledge(self):
        """Initialize with basic women's health knowledge"""
        # In production, load from comprehensive medical database
        documents = [
            "Normal vaginal discharge is usually clear or white and doesn't have a strong odor.",
            "Yellow or green discharge may indicate an infection and should be evaluated by a healthcare provider.",
            "Skin redness and irritation can be caused by allergies, infections, or hormonal changes.",
            "Acne during menstrual cycles is common due to hormonal fluctuations.",
            "Any sudden changes in discharge color, consistency, or odor should be monitored.",
            "Itching accompanied by discharge changes may indicate a yeast infection or bacterial vaginosis."
        ]
        
        # Create vector store
        vectorstore = Chroma.from_texts(
            documents,
            self.embeddings,
            collection_name="womens_health"
        )
        
        return vectorstore
    
    async def analyze_with_context(
        self,
        image_analysis: Dict[str, Any],
        analysis_type: str,
        user_symptoms: Optional[List[str]] = None,
        user_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Analyze health condition with LLM and medical context"""
        
        # Retrieve relevant medical knowledge
        relevant_docs = self.health_knowledge.similarity_search(
            f"{analysis_type} {image_analysis.get('description', '')} {' '.join(user_symptoms or [])}",
            k=3
        )
        
        # Create comprehensive prompt
        prompt = self._create_health_prompt(
            image_analysis,
            analysis_type,
            user_symptoms,
            user_context,
            relevant_docs
        )
        
        # Get LLM analysis
        try:
            response = await self._get_llm_response(prompt)
            
            # Parse and structure response
            structured_response = self._parse_health_response(response)
            
            # Add safety disclaimers
            structured_response["disclaimers"] = [
                "This is not a medical diagnosis",
                "Please consult a healthcare provider for medical advice",
                "This analysis is for informational purposes only"
            ]
            
            return structured_response
            
        except Exception as e:
            return {
                "error": str(e),
                "message": "Unable to complete health analysis"
            }
    
    def _create_health_prompt(
        self,
        image_analysis: Dict,
        analysis_type: str,
        symptoms: Optional[List[str]],
        context: Optional[Dict],
        medical_docs: List
    ) -> str:
        """Create comprehensive prompt for health analysis"""
        
        medical_context = "\n".join([doc.page_content for doc in medical_docs])
        
        prompt = f"""
        You are a knowledgeable women's health assistant providing educational information.
        
        Analysis Type: {analysis_type}
        
        Image Analysis Results:
        - Description: {image_analysis.get('description', 'N/A')}
        - Detected Concerns: {', '.join(image_analysis.get('skin_concerns', []) or image_analysis.get('health_indicators', []))}
        - Confidence: {image_analysis.get('confidence', 0):.2f}
        
        User Reported Symptoms: {', '.join(symptoms) if symptoms else 'None reported'}
        
        Medical Knowledge Context:
        {medical_context}
        
        Please provide:
        1. Likely explanation for the observed condition (educational only, not diagnostic)
        2. Severity assessment (low, moderate, high)
        3. Common causes for this type of condition
        4. Self-care recommendations
        5. Signs that would warrant seeing a healthcare provider
        
        Format your response as JSON with these keys:
        - condition_overview: Brief explanation
        - severity: low/moderate/high
        - possible_causes: List of common causes
        - self_care: List of self-care recommendations
        - seek_care_if: List of warning signs
        - additional_notes: Any other relevant information
        
        Remember: This is educational information only, not medical advice.
        """
        
        return prompt
    
    async def _get_llm_response(self, prompt: str) -> str:
        """Get response from OpenAI"""
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful women's health education assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=800
        )
        
        return response.choices[0].message.content
    
    def _parse_health_response(self, response: str) -> Dict[str, Any]:
        """Parse LLM response into structured format"""
        try:
            # Try to parse as JSON
            parsed = json.loads(response)
            return parsed
        except:
            # Fallback to text parsing
            return {
                "condition_overview": response,
                "severity": "unknown",
                "possible_causes": ["Please see the overview above"],
                "self_care": ["Monitor symptoms", "Maintain good hygiene"],
                "seek_care_if": ["Symptoms worsen", "Unusual pain or discomfort"],
                "additional_notes": "Please consult the full response above"
            }
    
    async def analyze_hemoglobin_with_context(
        self,
        nail_analysis_result: Dict[str, Any],
        user_symptoms: Optional[List[str]] = None,
        user_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Analyze hemoglobin levels with LLM and medical context"""
        
        # Extract hemoglobin data
        nail_analysis = nail_analysis_result.get('nail_analysis', {})
        avg_hemoglobin = nail_analysis.get('average_hemoglobin_g_per_L', 0)
        num_nails = nail_analysis.get('num_nails_detected', 0)
        
        # Retrieve relevant medical knowledge about anemia and hemoglobin
        hemoglobin_query = f"hemoglobin anemia iron deficiency women health {avg_hemoglobin} g/L"
        relevant_docs = self.health_knowledge.similarity_search(hemoglobin_query, k=3)
        
        # Add hemoglobin-specific knowledge
        hemoglobin_context = self._get_hemoglobin_knowledge()
        
        # Create comprehensive prompt
        prompt = self._create_hemoglobin_prompt(
            nail_analysis_result,
            user_symptoms,
            user_context,
            relevant_docs,
            hemoglobin_context
        )
        
        # Get LLM analysis
        try:
            response = await self._get_llm_response(prompt)
            
            # Parse and structure response
            structured_response = self._parse_hemoglobin_response(response, avg_hemoglobin)
            
            # Add safety disclaimers
            structured_response["disclaimers"] = [
                "This is not a medical diagnosis",
                "Nail-based hemoglobin analysis is a screening tool only",
                "Please consult a healthcare provider for proper blood testing",
                "This analysis is for informational purposes only"
            ]
            
            return structured_response
            
        except Exception as e:
            return {
                "error": str(e),
                "message": "Unable to complete hemoglobin analysis",
                "severity": "moderate",
                "condition_overview": "Please consult a healthcare provider for proper blood testing."
            }
    
    def _get_hemoglobin_knowledge(self) -> str:
        """Get hemoglobin-specific medical knowledge"""
        return """
        HEMOGLOBIN REFERENCE RANGES:
        - Normal for women: 120-160 g/L (12-16 g/dL)
        - Mild anemia: 100-119 g/L (10-11.9 g/dL)
        - Moderate anemia: 70-99 g/L (7-9.9 g/dL)
        - Severe anemia: <70 g/L (<7 g/dL)
        
        COMMON CAUSES OF LOW HEMOGLOBIN:
        - Iron deficiency (most common in women)
        - Heavy menstrual periods
        - Poor iron absorption
        - Inadequate dietary iron intake
        - Pregnancy
        - Chronic diseases
        - Blood loss
        
        SYMPTOMS OF ANEMIA:
        - Fatigue and weakness
        - Pale skin, nails, or inner eyelids
        - Shortness of breath
        - Cold hands and feet
        - Brittle or spoon-shaped nails
        - Unusual cravings for ice or starch
        - Rapid or irregular heartbeat
        """
    
    def _create_hemoglobin_prompt(
        self,
        nail_analysis_result: Dict,
        symptoms: Optional[List[str]],
        context: Optional[Dict],
        medical_docs: List,
        hemoglobin_context: str
    ) -> str:
        """Create comprehensive prompt for hemoglobin analysis"""
        
        nail_analysis = nail_analysis_result.get('nail_analysis', {})
        avg_hemoglobin = nail_analysis.get('average_hemoglobin_g_per_L', 0)
        num_nails = nail_analysis.get('num_nails_detected', 0)
        
        medical_knowledge = "\n".join([doc.page_content for doc in medical_docs])
        
        prompt = f"""
        You are a knowledgeable women's health assistant providing educational information about hemoglobin levels.
        
        NAIL-BASED HEMOGLOBIN ANALYSIS RESULTS:
        - Number of nails analyzed: {num_nails}
        - Average hemoglobin level: {avg_hemoglobin:.1f} g/L
        - Individual nail readings: {nail_analysis.get('individual_predictions', [])}
        
        User Information:
        - Age: {context.get('age') if context else 'Not provided'}
        - Reported symptoms: {', '.join(symptoms) if symptoms else 'None reported'}
        
        Medical Knowledge Context:
        {hemoglobin_context}
        
        General Health Knowledge:
        {medical_knowledge}
        
        Please provide a comprehensive assessment including:
        1. Interpretation of the hemoglobin level
        2. Severity assessment (low, moderate, high)
        3. Possible causes for this hemoglobin level
        4. Dietary and lifestyle recommendations
        5. Signs that warrant immediate medical attention
        6. Follow-up recommendations
        
        Format your response as JSON with these keys:
        - condition_overview: Brief interpretation of the hemoglobin level
        - severity: low/moderate/high (based on anemia risk)
        - possible_causes: List of potential causes for this level
        - self_care: List of dietary and lifestyle recommendations
        - seek_care_if: List of warning signs requiring medical attention
        - follow_up: Recommendations for monitoring and follow-up
        - additional_notes: Any other relevant information
        
        Remember: This is educational information only, not medical advice.
        Emphasize the need for proper blood testing for confirmation.
        """
        
        return prompt
    
    def _parse_hemoglobin_response(self, response: str, hemoglobin_level: float) -> Dict[str, Any]:
        """Parse LLM response into structured format for hemoglobin analysis"""
        try:
            # Try to parse as JSON
            parsed = json.loads(response)
            return parsed
        except:
            # Fallback to structured response based on hemoglobin level
            if hemoglobin_level < 120:
                severity = "high"
                overview = f"Hemoglobin level of {hemoglobin_level:.1f} g/L indicates possible anemia and requires medical evaluation."
            elif hemoglobin_level < 140:
                severity = "moderate"
                overview = f"Hemoglobin level of {hemoglobin_level:.1f} g/L is borderline low and should be monitored."
            else:
                severity = "low"
                overview = f"Hemoglobin level of {hemoglobin_level:.1f} g/L is within normal range."
            
            return {
                "condition_overview": overview,
                "severity": severity,
                "possible_causes": [
                    "Iron deficiency", 
                    "Heavy menstrual periods", 
                    "Poor dietary iron intake",
                    "Chronic diseases"
                ],
                "self_care": [
                    "Eat iron-rich foods (red meat, spinach, beans)",
                    "Include vitamin C to enhance iron absorption",
                    "Avoid tea/coffee with iron-rich meals",
                    "Consider iron supplements if recommended by doctor"
                ],
                "seek_care_if": [
                    "Severe fatigue or weakness",
                    "Shortness of breath",
                    "Rapid heartbeat",
                    "Chest pain",
                    "Heavy menstrual bleeding"
                ],
                "follow_up": [
                    "Get proper blood test for confirmation",
                    "Monitor symptoms",
                    "Follow up with healthcare provider"
                ],
                "additional_notes": "Nail-based analysis is a screening tool. Confirm with proper blood testing."
            }
    
    async def generate_cycle_insight(
        self,
        current_cycle_day: int,
        cycle_length: int,
        period_length: int,
        last_period_date: str,
        health_goals: Optional[List[str]] = None,
        reproductive_stage: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate personalized cycle insight based on current cycle data"""
        
        # Calculate cycle phase
        follicular_end = cycle_length // 2 - 2
        ovulatory_start = follicular_end + 1
        ovulatory_end = ovulatory_start + 2
        
        if current_cycle_day <= period_length:
            phase = "menstrual"
        elif current_cycle_day <= follicular_end:
            phase = "follicular"
        elif current_cycle_day <= ovulatory_end:
            phase = "ovulatory"
        else:
            phase = "luteal"
        
        # Create personalized prompt
        prompt = self._create_cycle_insight_prompt(
            current_cycle_day, cycle_length, period_length, phase, 
            health_goals, reproductive_stage
        )
        
        try:
            response = await self._get_llm_response(prompt)
            return self._parse_cycle_insight_response(response, phase)
        except Exception as e:
            print(f"Error generating cycle insight: {e}")
            return self._get_fallback_cycle_insight(phase, current_cycle_day)
    
    def _create_cycle_insight_prompt(
        self,
        cycle_day: int,
        cycle_length: int,
        period_length: int,
        phase: str,
        health_goals: Optional[List[str]],
        reproductive_stage: Optional[str]
    ) -> str:
        """Create a personalized prompt for cycle insights"""
        
        goals_text = ""
        if health_goals:
            goals_text = f"User's health goals: {', '.join(health_goals)}. "
        
        stage_text = ""
        if reproductive_stage:
            stage_text = f"Reproductive stage: {reproductive_stage}. "
        
        return f"""
As a women's health AI assistant, provide a personalized insight for a user based on their current menstrual cycle data.

Current cycle information:
- Day {cycle_day} of {cycle_length}-day cycle
- Currently in {phase} phase
- Period length: {period_length} days
{stage_text}{goals_text}

Please provide:
1. A short, encouraging title (2-4 words)
2. A personalized description (1-2 sentences) with actionable advice
3. The insight type: "success" for ovulatory/fertile phases, "info" for other phases
4. A relevant action suggestion

Focus on:
- Current cycle phase benefits and recommendations
- Personalized advice based on health goals if provided
- Encouraging and positive tone
- Practical, actionable suggestions

Format your response as JSON:
{{
    "title": "Short Title",
    "description": "Personalized description with advice",
    "type": "success|info|warning",
    "action": "Suggested Action"
}}
"""
    
    def _parse_cycle_insight_response(self, response: str, phase: str) -> Dict[str, Any]:
        """Parse the LLM response for cycle insights"""
        try:
            # Try to parse JSON response
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                insight_data = json.loads(json_match.group())
                return {
                    "title": insight_data.get("title", "Cycle Update"),
                    "description": insight_data.get("description", "Stay in tune with your cycle."),
                    "type": insight_data.get("type", "info"),
                    "action": insight_data.get("action", "Track Cycle")
                }
        except Exception as e:
            print(f"Error parsing cycle insight response: {e}")
        
        return self._get_fallback_cycle_insight(phase, 0)
    
    def _get_fallback_cycle_insight(self, phase: str, cycle_day: int) -> Dict[str, Any]:
        """Provide fallback insights if LLM fails"""
        insights = {
            "menstrual": {
                "title": "Rest & Recharge",
                "description": "Your body is working hard during menstruation. Focus on gentle movement, hydration, and iron-rich foods to support your energy.",
                "type": "info",
                "action": "Track Symptoms"
            },
            "follicular": {
                "title": "Energy Rising",
                "description": "Your energy levels are building! This is a great time to start new projects and engage in more intense workouts.",
                "type": "info",
                "action": "Plan Activities"
            },
            "ovulatory": {
                "title": "Peak Fertility",
                "description": "You're in your fertile window! If trying to conceive, this is optimal timing. Your energy and mood are likely at their peak.",
                "type": "success",
                "action": "Track Fertility"
            },
            "luteal": {
                "title": "Focus Within",
                "description": "As your cycle progresses, focus on self-care and stress management. Consider gentle yoga and nutritious comfort foods.",
                "type": "info",
                "action": "Practice Self-Care"
            }
        }
        
        return insights.get(phase, insights["follicular"])