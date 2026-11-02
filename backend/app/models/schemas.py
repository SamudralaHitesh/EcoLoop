from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class RoleEnum(str, Enum):
    KITCHEN = "KITCHEN"
    DRIVER = "DRIVER"
    PLANT_OPERATOR = "PLANT_OPERATOR"
    ADMIN = "ADMIN"

class BatchStatus(str, Enum):
    LOGGED = "LOGGED"
    AI_AUDITED = "AI_AUDITED"
    DISPATCH_READY = "DISPATCH_READY"
    IN_TRANSIT = "IN_TRANSIT"
    RECEIVED_AT_PLANT = "RECEIVED_AT_PLANT"
    IN_DIGESTER = "IN_DIGESTER"
    REJECTED = "REJECTED"

# --- User & Auth Schemas ---
class UserLogin(BaseModel):
    username: str
    password: str
    role: Optional[RoleEnum] = RoleEnum.ADMIN

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

# --- Vision & Contamination Schemas ---
class BoundingBox(BaseModel):
    x_min: float
    y_min: float
    x_max: float
    y_max: float
    width: float
    height: float
    area_pixels: float

class DetectedItem(BaseModel):
    id: str
    label: str
    category: str  # "ORGANIC" or "CONTAMINANT"
    confidence: float
    bbox: BoundingBox
    contaminant_type: Optional[str] = None  # "PLASTIC", "FILM", "METAL", "GLASS", "FOIL", "SYNTHETIC"
    color: str

class VisionAuditResponse(BaseModel):
    audit_id: str
    timestamp: str
    image_width: int
    image_height: int
    detected_items: List[DetectedItem]
    total_area_pixels: float
    organic_area_pixels: float
    contaminant_area_pixels: float
    contamination_pct: float
    purity_pct: float
    status: str  # "APPROVED_FOR_DISPATCH" or "REJECTED_NEEDS_SORTING"
    sorting_alerts: List[str]
    annotated_image_base64: str
    feedstock_distribution: Dict[str, float]

# --- BMP & Carbon Mathematics Schemas ---
class FeedstockInput(BaseModel):
    fog_kg: float = Field(default=0.0, description="Fats, Oils & Greases (kg)")
    meat_proteins_kg: float = Field(default=0.0, description="Meat, Fish & Dairy Proteins (kg)")
    carbs_starches_kg: float = Field(default=0.0, description="Rice, Bread, Pasta & Starches (kg)")
    mixed_cooked_kg: float = Field(default=0.0, description="Mixed Cooked Kitchen Scrap (kg)")
    raw_greens_kg: float = Field(default=0.0, description="Raw Fruit, Veg & Peels (kg)")
    purity_factor: float = Field(default=100.0, description="Purity % from CV Audit (0-100)")

class BMPCalculationResult(BaseModel):
    total_feedstock_kg: float
    net_organic_kg: float
    methane_yield_m3: float
    total_biogas_yield_m3: float
    biogas_ch4_content_pct: float
    chp_electricity_kwh: float
    chp_thermal_kwh: float
    avoided_co2e_kg: float
    green_energy_tokens: float
    esg_token_value_usd: float
    feedstock_breakdown: Dict[str, Dict[str, float]]
    formula_audit_trail: List[str]

# --- Batch & Logistics Schemas ---
class CreateBatchRequest(BaseModel):
    generator_name: str
    generator_type: str  # "RESTAURANT", "HOTEL", "CANTEEN", "CATERING"
    location_address: str
    latitude: float
    longitude: float
    feedstock: FeedstockInput
    image_base64: Optional[str] = None

class BatchResponse(BaseModel):
    batch_id: str
    qr_code_id: str
    created_at: str
    generator_name: str
    generator_type: str
    location_address: str
    latitude: float
    longitude: float
    total_weight_kg: float
    verified_scale_weight_kg: Optional[float] = None
    purity_pct: float
    contamination_pct: float
    status: BatchStatus
    methane_potential_m3: float
    avoided_co2e_kg: float
    green_tokens_earned: float
    assigned_driver: Optional[str] = None
    target_facility: str
    audit_summary: Optional[Dict[str, Any]] = None
    timeline: List[Dict[str, str]]

class ScaleVerificationRequest(BaseModel):
    batch_id: str
    scale_weight_kg: float
    driver_id: str
    notes: Optional[str] = None

# --- RAG Biogas Copilot Schemas ---
class CopilotQuery(BaseModel):
    query: str
    digester_id: Optional[str] = "DIGESTER-ALPHA-01"
    operating_mode: Optional[str] = "MESOPHILIC"  # "MESOPHILIC" (37C) or "THERMOPHILIC" (55C)
    current_ph: Optional[float] = None
    current_vfa_tic: Optional[float] = None
    temperature_c: Optional[float] = None

class CopilotResponse(BaseModel):
    answer: str
    confidence_score: float
    stability_verdict: str  # "OPTIMAL", "WARNING", "CRITICAL_SOURING_RISK", "AMMONIA_INHIBITION_RISK"
    biochemical_metrics: Dict[str, Any]
    actionable_remediations: List[str]
    citations: List[Dict[str, str]]

# --- Digester SCADA & Telemetry Schemas ---
class DigesterTelemetry(BaseModel):
    digester_id: str
    name: str
    status: str
    operating_temp_c: float
    target_temp_c: float
    ph_level: float
    vfa_tic_ratio: float
    vfa_concentration_mg_l: float
    tic_alkalinity_mg_l: float
    biogas_production_m3_h: float
    ch4_concentration_pct: float
    h2s_ppm: float
    co2_concentration_pct: float
    organic_loading_rate_kg_vs_m3_d: float
    hydraulic_retention_time_days: float
    active_feedstock_mass_tons: float
    bio_fertilizer_digestate_m3: float
    health_score_pct: float
    alerts: List[Dict[str, str]]

# --- Producer & Commercial Company Registration Schemas ---
class ProducerRegistrationRequest(BaseModel):
    name: str = Field(description="Company / Restaurant / Canteen Name")
    category: str = Field(description="RESTAURANT, HOTEL, CANTEEN, CATERING, FOOD_PROCESSING, SUPERMARKET")
    contact_person: str
    contact_email: str
    contact_phone: str
    location_address: str
    latitude: float = 1.2834
    longitude: float = 103.8607
    avg_daily_waste_kg: float = 250.0
    primary_waste_type: str = "MIXED_COOKED"  # "FOG_GREASE", "MEAT_PROTEINS", "CARBS_BAKERY", "RAW_GREENS", "MIXED_COOKED"
    assigned_biogas_facility: str = "BioPower AD Mega-Facility 01"

class ProducerResponse(BaseModel):
    producer_id: str
    qr_producer_tag: str
    name: str
    category: str
    contact_person: str
    contact_email: str
    contact_phone: str
    location_address: str
    latitude: float
    longitude: float
    avg_daily_waste_kg: float
    primary_waste_type: str
    assigned_biogas_facility: str
    total_diverted_mass_kg: float
    total_green_tokens_earned: float
    status: str
    onboarded_at: str

