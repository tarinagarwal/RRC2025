"""Configuration for AI Job Matcher"""
import os
from dotenv import load_dotenv

load_dotenv()

# API Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Model configs
OPENAI_EMBEDDING_MODEL = "text-embedding-3-small"
OPENAI_CHAT_MODEL = "gpt-4o-mini"
GROQ_CHAT_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"

# ChromaDB
CHROMA_PERSIST_DIR = "./chroma_db"
COLLECTION_NAME = "job_skills"

# Scoring weights
SCORING_WEIGHTS = {
    "technical_skills": 0.40,
    "experience_level": 0.25,
    "education": 0.15,
    "soft_skills": 0.10,
    "location": 0.10,
}
