# Womens Health App 
Womens health Luna AI is an intelligent, privacy-conscious women’s health assistant that empowers users with **AI-driven visual and symptom analysis**. By combining powerful **vision models** (like ResNet and BLIP) with **Large Language Models (LLMs)** and **Retrieval-Augmented Generation (RAG)**, Luna provides **personalized, educational insights** — not diagnoses — to help users better understand their health.

> ⚠️ *Luna Health AI is for educational purposes only and does not offer medical advice or diagnosis.*

---

## 🚀 Features

🔍 **AI Image Analysis**  
Upload skin or discharge images for computer vision analysis using state-of-the-art models.

🧠 **LLM + RAG Health Insights**  
Combines image results with symptoms and retrieves information from a curated women’s health knowledge base using GPT and LangChain.

📸 **Vision Models (ResNet + BLIP)**  
Extracts both visual descriptions and classifications for accurate context interpretation.

🩺 **Symptom-Aware Analysis**  
Select symptoms to improve response specificity and personalization.

📚 **Educational Focus**  
All responses are framed as health education, with clear disclaimers to avoid medical overreach.

---

## 🗂 Project Structure
```plaintext
frontend/
  └── src/
      ├── components/
      │   └── ImageAnalysis.jsx
      └── services/
          └── imageAnalysisService.js
backend/
  ├── .env
  ├── requirements.txt
  └── app/
      ├── main.py
      ├── core/
      │   └── config.py
      ├── api/
      │   └── endpoints/
      │       └── health_analysis.py
      └── services/
          ├── vision_analysis.py
          ├── llm_health_service.py
          └── rag_services.py


⚙️ How It Works
🖼 Frontend (React)
Users upload images and optionally select symptoms.
Frontend sends this data to the backend API.
AI-generated analysis is displayed with clarity and empathy.


🧠 Backend (FastAPI)
Classifies and describes images using BLIP and ResNet.
Sends image + symptom context to GPT via LangChain with RAG.
Generates and returns an educational health summary.

🧪 Setup 
🔧 Prerequisites
Python 3.10+
Node.js (for frontend)
OpenAI API Key (store in .env)


🔌 API Endpoints
Accepts: Image file, symptoms, age, menstrual phase, analysis type

Returns:
image_analysis: Description, classification, confidence
health_assessment: GPT-generated explanation, self-care advice, urgency level

🙌 Acknowledgements
⚡ FastAPI
🧠 OpenAI GPT
📷 BLIP / ResNet (Hugging Face)
🔗 LangChain
🧬 ChromaDB

🛑 Disclaimer
Luna Health AI is not a medical device or diagnostic tool.
This app is designed for educational and informational purposes only.
Please consult a licensed medical professional for any health concerns.
