# Luna Health App

AI-powered women's health companion app built with React and TypeScript.

## Features

- 🤖 AI-powered health chat with OpenAI integration
- 📱 Cycle tracking and fertility monitoring
- 😊 Mood and symptom tracking
- 🏥 Health insights and predictions
- 📸 Photo analysis capabilities

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and add your OpenAI API key
4. Start the development server: `npm start`
5. Open a new terminal and navigate to \backend folder
6. Create and activate a Python virtual environment (optional)
7. Install dependencies: `pip install -r requirements.txt`
8. Initialize the database "luna_health": `python create_tables.py`
9. Start the FastAPI server: `uvicorn main:app --reload`

## Tech Stack

- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- OpenAI API
- Zustand for state management
