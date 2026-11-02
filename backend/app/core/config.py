import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "BioWaste Neural-Grid"
    VERSION: str = "2.4.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "biowaste-neural-grid-super-secret-key-2026-ad-biotech")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Contamination Thresholds
    MAX_PERMISSIBLE_CONTAMINATION_PCT: float = 15.0  # >15% triggers mandatory rejection
    OPTIMAL_CN_MIN: float = 20.0
    OPTIMAL_CN_MAX: float = 30.0
    CRITICAL_VFA_TIC_RATIO: float = 0.40  # Souring threshold
    
    # ESG Parameters
    CARBON_OFFSET_PER_KG_ORGANIC: float = 1.90  # kg CO2e per kg organic diverted
    GET_TOKEN_VALUE_USD: float = 15.00  # $15 per Green Energy Token

settings = Settings()
