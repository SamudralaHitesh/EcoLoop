from fastapi import APIRouter
from backend.app.models.schemas import FeedstockInput, BMPCalculationResult
from backend.app.services.bmp_carbon_engine import bmp_engine

router = APIRouter(prefix="/bmp", tags=["Biochemical Methane Potential & Carbon Engine"])

@router.post("/calculate", response_model=BMPCalculationResult)
async def calculate_bmp_and_carbon(feedstock: FeedstockInput):
    """
    Computes theoretical methane yield (m3 CH4), electrical power generation (kWh),
    avoided GHG emissions (kg CO2e), and tradeable Green Energy Tokens based on feedstock kinetics.
    """
    return bmp_engine.calculate(feedstock)

@router.get("/kinetic-factors")
async def get_kinetic_factors():
    return {
        "factors_m3_ch4_per_kg": bmp_engine.KINETIC_FACTORS,
        "lhv_methane_kwh_m3": bmp_engine.LHV_METHANE_KWH_PER_M3,
        "chp_electrical_efficiency": bmp_engine.CHP_ELECTRICAL_EFFICIENCY,
        "carbon_offset_factor_kg_co2e_per_kg_organic": bmp_engine.AVOIDED_CO2E_PER_KG_ORGANIC,
        "green_energy_token_price_usd": bmp_engine.TOKEN_EXCHANGE_RATE_USD
    }
