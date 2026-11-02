from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.api.endpoints import auth, vision, bmp, copilot, batches, digester, producers

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Commercial Food Waste Diversion & Anaerobic Digestion Platform"
)

# Enable CORS for frontend Single Page Application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Sub-Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(vision.router, prefix=settings.API_V1_STR)
app.include_router(bmp.router, prefix=settings.API_V1_STR)
app.include_router(copilot.router, prefix=settings.API_V1_STR)
app.include_router(batches.router, prefix=settings.API_V1_STR)
app.include_router(digester.router, prefix=settings.API_V1_STR)
app.include_router(producers.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "docs_url": "/docs",
        "modules": [
            "AI Computer Vision Contamination Engine (YOLOv8 + OpenCV)",
            "Biochemical Methane Potential (BMP) & Carbon Offset Engine",
            "RAG Biogas Chemistry Copilot (ChromaDB / LangChain)",
            "Logistics & Multi-Party Lifecycle Management"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "biowaste-neural-grid-backend"}
