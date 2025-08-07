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