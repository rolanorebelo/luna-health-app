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
            
            # Hormonal changes
            "Discharge characteristics change throughout the menstrual cycle due to hormonal fluctuations. Ovulation typically produces clear, stretchy discharge similar to egg whites.",
            
            # UTI Symptoms and Prevention
            "Urinary tract infections (UTIs) are common in women due to the shorter urethra. Symptoms include burning during urination, frequent urging, cloudy urine, and pelvic pain.",
            
            "UTI prevention includes drinking plenty of water, urinating after sexual activity, wiping front to back, and avoiding irritating feminine products like douches and scented soaps.",
            
            "Cranberry products may help prevent recurrent UTIs by preventing bacteria from adhering to the urinary tract walls, though medical treatment is still necessary for active infections.",
            
            "Recurrent UTIs (more than 2-3 per year) may indicate underlying issues requiring medical evaluation, such as incomplete bladder emptying or anatomical abnormalities.",
            
            # UTI Testing and Diagnosis
            "UTI diagnosis typically involves urinalysis and urine culture testing. Home UTI test strips can detect nitrites and leukocytes but cannot replace professional medical evaluation.",
            
            "Symptoms of UTIs can sometimes be confused with other conditions like vaginal infections, STIs, or bladder irritation, making proper medical diagnosis important.",
            
            # Vaginal Health Comprehensive
            "The vagina maintains a naturally acidic pH (3.5-4.5) through beneficial lactobacilli bacteria. This acidic environment helps prevent harmful bacteria and yeast overgrowth.",
            
            "Bacterial vaginosis occurs when the natural bacterial balance is disrupted, often causing gray discharge with a fishy odor. It's the most common vaginal infection in women of reproductive age.",
            
            "Vaginal pH can be disrupted by douching, harsh soaps, hormonal changes, antibiotics, and certain sexual practices. Natural balance usually restores itself with proper care.",
            
            "Normal vaginal self-cleaning through natural discharge eliminates the need for internal douching, which can actually increase infection risk by disrupting beneficial bacteria.",
            
            "Probiotics containing lactobacilli may help maintain vaginal health, especially after antibiotic treatment or for women prone to recurrent infections.",
            
            # Sexual Health and Vaginal Wellness
            "Sexual activity can introduce bacteria and alter vaginal pH temporarily. Urinating after sex helps flush potential bacteria from the urinary tract.",
            
            "Lubrication during sexual activity prevents vaginal tears and irritation. Natural lubrication varies with hormone levels, stress, and hydration status.",
            
            "Vaginal dryness can occur due to hormonal changes, breastfeeding, menopause, certain medications, or insufficient arousal. Various safe lubricants are available to address this.",
            
            # Menstrual Health and Vaginal Changes
            "Vaginal discharge and sensations change throughout the menstrual cycle. Mid-cycle ovulation often produces increased, clear, stretchy discharge resembling egg whites.",
            
            "During menstruation, using tampons or menstrual cups requires proper hygiene to prevent toxic shock syndrome. Change tampons every 4-8 hours and cups every 12 hours maximum.",
            
            # Skin conditions - acne
            "Hormonal acne is common during menstrual cycles and typically appears on the jawline, chin, and lower face. It's caused by fluctuations in estrogen and progesterone levels.",
            
            # Skin conditions - irritation
            "Skin redness and irritation in intimate areas can be caused by harsh soaps, tight clothing, allergic reactions to products, or infections requiring different treatments.",
            
            # When to seek care - Enhanced
            "Seek immediate medical attention for sudden changes in discharge color, consistency, or odor, especially if accompanied by itching, burning, pain, fever, or pelvic pain.",
            
            "UTI symptoms that worsen or include fever, chills, back pain, nausea, or vomiting may indicate kidney involvement and require urgent medical care.",
            
            "Persistent vaginal symptoms lasting more than a few days, recurrent infections, or unusual bleeding patterns should be evaluated by a healthcare provider.",
            
            # Menstrual cycle tracking - Enhanced
            "Tracking discharge patterns alongside menstrual cycles can help identify normal variations versus potential health concerns requiring medical evaluation.",
            
            "Changes in menstrual flow, cycle length, or associated symptoms may indicate hormonal imbalances, thyroid issues, or reproductive health conditions.",
            
            # Hygiene recommendations - Enhanced
            "Maintain intimate hygiene with gentle, unscented products. Avoid douching, which can disrupt natural bacterial balance and increase infection risk.",
            
            "Cotton underwear and breathable fabrics help maintain proper air circulation and moisture balance in the genital area, reducing infection risk.",
            
            "Proper wiping technique (front to back) prevents intestinal bacteria from entering the urinary tract and vaginal area.",
            
            # Preventive care - Enhanced
            "Regular gynecological check-ups, safe sexual practices, and maintaining overall health support reproductive wellness and early detection of concerns.",
            
            "Annual pelvic exams and Pap smears help detect cervical cancer and other reproductive health issues in early, treatable stages.",
            
            "STI testing as appropriate for sexual activity helps maintain both personal and partner health, as many STIs can be asymptomatic initially."
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