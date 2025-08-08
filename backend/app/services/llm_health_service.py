import openai
from openai import OpenAI
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI as LangChainOpenAI
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
        # Use new OpenAI client
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
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