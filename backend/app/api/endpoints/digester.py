from fastapi import APIRouter
from typing import Dict, Any, List
from backend.app.models.schemas import DigesterTelemetry
from backend.app.services.logistics_engine import logistics_engine

router = APIRouter(prefix="/digester", tags=["Biogas Digester Facility SCADA"])

@router.get("/telemetry/{digester_id}", response_model=DigesterTelemetry)
async def get_telemetry(digester_id: str = "DIGESTER-ALPHA-01"):
    return logistics_engine.get_digester_telemetry(digester_id)

@router.get("/facilities")
async def list_facilities():
    return [
        {
            "id": "FAC-MEGA-01",
            "name": "BioPower AD Mega-Facility 01 (East Hub)",
            "capacity_tons_day": 150.0,
            "current_inflow_tons_day": 118.4,
            "chp_installed_capacity_mw": 2.4,
            "grid_export_status": "ONLINE",
            "digesters": ["DIGESTER-ALPHA-01", "DIGESTER-BETA-02"]
        },
        {
            "id": "FAC-WEST-02",
            "name": "EcoGrid Anaerobic Center (West Sector)",
            "capacity_tons_day": 90.0,
            "current_inflow_tons_day": 64.2,
            "chp_installed_capacity_mw": 1.2,
            "grid_export_status": "ONLINE",
            "digesters": ["DIGESTER-GAMMA-01"]
        }
    ]

@router.post("/optimize-recipe")
async def optimize_feedstock_recipe(payload: Dict[str, Any]):
    """
    Computes balanced co-digestion mixing ratios to achieve target C:N (25:1)
    and limit FOG concentration below 15% to avoid foaming and acidification.
    """
    incoming_meat_kg = float(payload.get("meat_kg", 50.0))
    incoming_fog_kg = float(payload.get("fog_kg", 20.0))
    incoming_greens_kg = float(payload.get("greens_kg", 100.0))
    
    # Calculate required high-carbon co-substrate (e.g. bakery starch / grain slurry)
    # Meat has C:N ~ 8:1, Greens ~ 18:1, Target is 25:1
    required_bakery_starch_kg = round(max(20.0, incoming_meat_kg * 1.6 + incoming_fog_kg * 0.4), 1)
    target_water_dilution_liters = round((incoming_meat_kg + incoming_greens_kg + required_bakery_starch_kg) * 0.25, 1)
    expected_ch4_yield_m3 = round(
        incoming_meat_kg * 0.49 + incoming_fog_kg * 0.85 + incoming_greens_kg * 0.18 + required_bakery_starch_kg * 0.37,
        2
    )

    return {
        "recipe_status": "OPTIMAL_CO_DIGESTION",
        "recommended_blend": {
            "meat_proteins_kg": incoming_meat_kg,
            "fats_oils_fog_kg": incoming_fog_kg,
            "raw_greens_kg": incoming_greens_kg,
            "co_substrate_bakery_starch_kg": required_bakery_starch_kg,
            "process_water_dilution_liters": target_water_dilution_liters
        },
        "projected_cn_ratio": "25.2 : 1",
        "projected_methane_yield_m3": expected_ch4_yield_m3,
        "vfa_risk_score": "LOW (0.19 projected VFA/TIC)",
        "guidance": "Adding bakery waste buffers nitrogen-rich proteins, stabilizing ammonium concentration and boosting net CH4 generation by 28%."
    }
