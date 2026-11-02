from fastapi import APIRouter
from backend.app.models.schemas import CopilotQuery, CopilotResponse
from backend.app.services.rag_copilot import rag_copilot

router = APIRouter(prefix="/copilot", tags=["RAG Biogas Chemistry Copilot"])

@router.post("/chat", response_model=CopilotResponse)
async def query_biogas_copilot(query_payload: CopilotQuery):
    """
    RAG Biogas Chemistry Copilot endpoint.
    Retrieves operational guidelines, evaluates VFA/TIC stability ratios,
    and provides biochemical remediation instructions.
    """
    return rag_copilot.query(query_payload)

@router.get("/topics")
async def get_knowledge_topics():
    return [
        {
            "topic": item.topic,
            "source": item.source,
            "formula": item.formula
        }
        for item in rag_copilot.knowledge_base
    ]
