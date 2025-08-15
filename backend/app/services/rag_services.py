from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.schema import Document
from typing import List, Dict, Any
from app.core.config import settings
import os

class HealthKnowledgeRAG:
    def __init__(self):
        print("Initializing Health Knowledge RAG System...")
        self.embeddings = OpenAIEmbeddings(openai_api_key=settings.OPENAI_API_KEY)
        
        # Initialize with women's health knowledge base
        self.vectorstore = self._create_knowledge_base()
        print("RAG system initialized successfully!")
    
    def _create_knowledge_base(self):
        """Create vector store with comprehensive women's health knowledge"""
        
        # Comprehensive women's health knowledge
        health_documents = [
            # Normal discharge information
            "Normal vaginal discharge is typically clear or milky white in color and has little to no odor. The consistency can vary throughout the menstrual cycle, becoming thicker before menstruation and thinner after.",
            
            # Infection indicators
            "Yellow or green vaginal discharge, especially when accompanied by a strong fishy or foul odor, may indicate bacterial vaginosis or other infections requiring medical attention.",
            
            # Yeast infection signs
            "Thick, white, cottage cheese-like discharge with itching and burning sensations often indicates a yeast infection. This is common and usually treatable with over-the-counter medications.",
            
            # UTI - Symptoms and testing
            "Urinary Tract Infection (UTI) symptoms include a burning sensation during urination, frequent urge to urinate, cloudy or strong-smelling urine, and lower abdominal pain. At-home UTI test strips are available in pharmacies and can detect white blood cells or nitrites in urine. Positive results or persistent symptoms should be followed up with a healthcare provider.",
            
            # UTI - Prevention and care
            "To prevent UTIs: stay hydrated, urinate after sexual activity, wipe from front to back, and avoid harsh soaps in the genital area. If you suspect a UTI, consult a medical professional. Early treatment can prevent complications.",
            
            # Vaginal health basics
            "Vaginal health is maintained by a balance of natural bacteria and pH. Disruption can lead to infections like bacterial vaginosis or yeast infections. Use gentle, unscented products and avoid douching.",
            
            # Vaginal hygiene tips
            "Wash the vulva with warm water and avoid inserting soap or cleansing products inside the vagina. Wear breathable, cotton underwear and change out of wet clothes promptly.",
            
            # Hormonal changes
            "Discharge characteristics change throughout the menstrual cycle due to hormonal fluctuations. Ovulation typically produces clear, stretchy discharge similar to egg whites.",
            
            # Skin conditions - acne
            "Hormonal acne is common during menstrual cycles and typically appears on the jawline, chin, and lower face. It's caused by fluctuations in estrogen and progesterone levels.",
            
            # Skin conditions - irritation
            "Skin redness and irritation in intimate areas can be caused by harsh soaps, tight clothing, allergic reactions to products, or infections requiring different treatments.",
            
            # When to seek care
            "Seek medical attention for sudden changes in discharge color, consistency, or odor, especially if accompanied by itching, burning, pain, or fever. Also seek care for persistent UTI symptoms.",
            
            # Menstrual cycle tracking
            "Tracking discharge patterns alongside menstrual cycles can help identify normal variations versus potential health concerns requiring medical evaluation.",
            
            # Hygiene recommendations
            "Maintain intimate hygiene with gentle, unscented products. Avoid douching, which can disrupt natural bacterial balance and increase infection risk.",
            
            # Preventive care
            "Regular gynecological check-ups, safe sexual practices, and maintaining overall health support reproductive wellness and early detection of concerns.",
        ]
        
        # Create documents with metadata
        documents = [
            Document(page_content=doc, metadata={"source": "women_health_kb", "topic": f"topic_{i}"})
            for i, doc in enumerate(health_documents)
        ]
        
        # Create vector store
        vectorstore = Chroma.from_documents(
            documents,
            self.embeddings,
            collection_name="womens_health_knowledge"
        )
        
        return vectorstore
    
    def get_relevant_context(self, query: str, k: int = 3) -> List[Document]:
        """Retrieve relevant medical context for a query"""
        try:
            relevant_docs = self.vectorstore.similarity_search(query, k=k)
            return relevant_docs
        except Exception as e:
            print(f"Error retrieving context: {str(e)}")
            return []
    
    def get_context_string(self, query: str, k: int = 3) -> str:
        """Get relevant context as a formatted string"""
        docs = self.get_relevant_context(query, k)
        return "\n".join([doc.page_content for doc in docs])