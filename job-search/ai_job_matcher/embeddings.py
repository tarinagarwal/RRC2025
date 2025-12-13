"""Vector embeddings and similarity search using ChromaDB + OpenAI"""
import chromadb
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma

from .config import OPENAI_API_KEY, CHROMA_PERSIST_DIR, OPENAI_EMBEDDING_MODEL


class SkillEmbeddings:
    """Handles skill embeddings and similarity search"""
    
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            api_key=OPENAI_API_KEY,
            model=OPENAI_EMBEDDING_MODEL
        )
        self.client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        self.vectorstore = None
    
    def create_resume_embeddings(self, resume_data: dict) -> Chroma:
        """Create embeddings from resume skills and experience"""
        documents = []
        metadatas = []
        
        # Technical skills
        for skill in resume_data.get("skills", {}).get("technical", []):
            documents.append(f"Technical skill: {skill}")
            metadatas.append({"type": "technical_skill", "value": skill})
        
        # Tools
        for tool in resume_data.get("skills", {}).get("tools", []):
            documents.append(f"Tool/Technology: {tool}")
            metadatas.append({"type": "tool", "value": tool})
        
        # Experience descriptions
        for exp in resume_data.get("experience", []):
            if exp.get("description"):
                documents.append(f"Experience at {exp.get('company', 'Unknown')}: {exp['description']}")
                metadatas.append({"type": "experience", "company": exp.get("company", "")})
        
        # Projects
        for proj in resume_data.get("projects", []):
            if proj.get("description"):
                doc = f"Project {proj.get('title', '')}: {proj['description']}"
                if proj.get("technologies"):
                    doc += f" Technologies: {', '.join(proj['technologies'])}"
                documents.append(doc)
                metadatas.append({"type": "project", "title": proj.get("title", "")})
        
        if not documents:
            return None
        
        self.vectorstore = Chroma.from_texts(
            texts=documents,
            embedding=self.embeddings,
            metadatas=metadatas,
            collection_name="resume_skills",
            persist_directory=CHROMA_PERSIST_DIR
        )
        return self.vectorstore
    
    def find_matching_skills(self, job_requirements: str, k: int = 10) -> list[dict]:
        """Find resume skills that match job requirements"""
        if not self.vectorstore:
            return []
        
        results = self.vectorstore.similarity_search_with_score(
            job_requirements,
            k=k
        )
        
        matches = []
        for doc, score in results:
            matches.append({
                "content": doc.page_content,
                "metadata": doc.metadata,
                "similarity": 1 - score  # Convert distance to similarity
            })
        return matches
    
    def calculate_skill_overlap(self, job_skills: list[str], resume_skills: list[str]) -> float:
        """Calculate semantic skill overlap using embeddings"""
        if not job_skills or not resume_skills:
            return 0.0
        
        job_text = " ".join(job_skills)
        resume_text = " ".join(resume_skills)
        
        job_embedding = self.embeddings.embed_query(job_text)
        resume_embedding = self.embeddings.embed_query(resume_text)
        
        # Cosine similarity
        import numpy as np
        similarity = np.dot(job_embedding, resume_embedding) / (
            np.linalg.norm(job_embedding) * np.linalg.norm(resume_embedding)
        )
        return float(similarity)
