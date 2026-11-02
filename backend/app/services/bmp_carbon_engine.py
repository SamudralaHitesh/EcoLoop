from typing import Dict, Any, List
from backend.app.models.schemas import FeedstockInput, BMPCalculationResult
from backend.app.core.config import settings

class BiochemicalMethaneAndCarbonEngine:
    """
    Biochemical Methane Potential (BMP) & Carbon Engine.
    Executes precision thermodynamic and stoichiometric degradation calculations
    based on empirical feedstock kinetics and IPCC/EPA avoided methane emission models.
    """
    
    # Empirical stoichiometric methane yield factors (m^3 CH4 per kg wet weight)
    KINETIC_FACTORS: Dict[str, float] = {
        "fog": 0.85,           # Fats, Oils & Greases
        "meat_proteins": 0.49, # Meat, Fish & Animal Protein
        "carbs_starches": 0.37,# Bread, Rice, Pasta & Sugars
        "mixed_cooked": 0.25,  # Prepared / Cooked Kitchen Plate Scrap
        "raw_greens": 0.18     # Fruits, Vegetables & Trim Peels
    }

    # Bio-energy physical constants
    LHV_METHANE_KWH_PER_M3: float = 9.97      # Lower Heating Value of 100% CH4
    CHP_ELECTRICAL_EFFICIENCY: float = 0.38    # 38% electrical conversion efficiency
    CHP_THERMAL_EFFICIENCY: float = 0.45       # 45% recoverable thermal energy
    DEFAULT_BIOGAS_CH4_FRACTION: float = 0.60  # Typical raw biogas is 60% CH4, 40% CO2
    
    # IPCC Landfill Methane Avoidance Factor
    AVOIDED_CO2E_PER_KG_ORGANIC: float = settings.CARBON_OFFSET_PER_KG_ORGANIC # 1.90 kg CO2e / kg diverted
    TOKEN_EXCHANGE_RATE_USD: float = settings.GET_TOKEN_VALUE_USD              # $15.00 / GET

    def calculate(self, feedstock: FeedstockInput) -> BMPCalculationResult:
        purity_ratio = max(0.0, min(1.0, feedstock.purity_factor / 100.0))
        
        gross_kg = (
            feedstock.fog_kg +
            feedstock.meat_proteins_kg +
            feedstock.carbs_starches_kg +
            feedstock.mixed_cooked_kg +
            feedstock.raw_greens_kg
        )
        
        net_organic_kg = gross_kg * purity_ratio
        
        # Individual component yield calculations
        fog_yield = feedstock.fog_kg * self.KINETIC_FACTORS["fog"] * purity_ratio
        meat_yield = feedstock.meat_proteins_kg * self.KINETIC_FACTORS["meat_proteins"] * purity_ratio
        carbs_yield = feedstock.carbs_starches_kg * self.KINETIC_FACTORS["carbs_starches"] * purity_ratio
        mixed_yield = feedstock.mixed_cooked_kg * self.KINETIC_FACTORS["mixed_cooked"] * purity_ratio
        greens_yield = feedstock.raw_greens_kg * self.KINETIC_FACTORS["raw_greens"] * purity_ratio
        
        total_ch4_yield_m3 = fog_yield + meat_yield + carbs_yield + mixed_yield + greens_yield
        total_biogas_yield_m3 = (total_ch4_yield_m3 / self.DEFAULT_BIOGAS_CH4_FRACTION) if total_ch4_yield_m3 > 0 else 0.0
        
        # CHP Energy Calculations
        total_energy_kwh = total_ch4_yield_m3 * self.LHV_METHANE_KWH_PER_M3
        chp_elec_kwh = total_energy_kwh * self.CHP_ELECTRICAL_EFFICIENCY
        chp_thermal_kwh = total_energy_kwh * self.CHP_THERMAL_EFFICIENCY
        
        # Avoided Carbon Emissions & Green Energy Token (GET) minting
        avoided_co2e_kg = net_organic_kg * self.AVOIDED_CO2E_PER_KG_ORGANIC
        # 1 GET token per 10 kg CO2e avoided * purity factor
        green_tokens = (avoided_co2e_kg / 10.0) * purity_ratio
        esg_value_usd = green_tokens * self.TOKEN_EXCHANGE_RATE_USD

        feedstock_breakdown = {
            "fog": {
                "mass_kg": round(feedstock.fog_kg, 2),
                "kinetic_factor": self.KINETIC_FACTORS["fog"],
                "ch4_yield_m3": round(fog_yield, 3),
                "energy_kwh": round(fog_yield * self.LHV_METHANE_KWH_PER_M3, 2)
            },
            "meat_proteins": {
                "mass_kg": round(feedstock.meat_proteins_kg, 2),
                "kinetic_factor": self.KINETIC_FACTORS["meat_proteins"],
                "ch4_yield_m3": round(meat_yield, 3),
                "energy_kwh": round(meat_yield * self.LHV_METHANE_KWH_PER_M3, 2)
            },
            "carbs_starches": {
                "mass_kg": round(feedstock.carbs_starches_kg, 2),
                "kinetic_factor": self.KINETIC_FACTORS["carbs_starches"],
                "ch4_yield_m3": round(carbs_yield, 3),
                "energy_kwh": round(carbs_yield * self.LHV_METHANE_KWH_PER_M3, 2)
            },
            "mixed_cooked": {
                "mass_kg": round(feedstock.mixed_cooked_kg, 2),
                "kinetic_factor": self.KINETIC_FACTORS["mixed_cooked"],
                "ch4_yield_m3": round(mixed_yield, 3),
                "energy_kwh": round(mixed_yield * self.LHV_METHANE_KWH_PER_M3, 2)
            },
            "raw_greens": {
                "mass_kg": round(feedstock.raw_greens_kg, 2),
                "kinetic_factor": self.KINETIC_FACTORS["raw_greens"],
                "ch4_yield_m3": round(greens_yield, 3),
                "energy_kwh": round(greens_yield * self.LHV_METHANE_KWH_PER_M3, 2)
            }
        }

        formula_audit_trail = [
            f"Gross Feedstock Mass: {round(gross_kg, 2)} kg | Purity Multiplier: {round(purity_ratio, 3)} -> Net Organic: {round(net_organic_kg, 2)} kg",
            f"Stoichiometric BMP summation: Σ(Mass_i * KineticFactor_i * Purity) = {round(total_ch4_yield_m3, 3)} m³ CH4",
            f"CHP Electrical Generation: {round(total_ch4_yield_m3, 3)} m³ CH4 * 9.97 kWh/m³ * 38% η = {round(chp_elec_kwh, 2)} kWh",
            f"IPCC Carbon Avoidance Model: {round(net_organic_kg, 2)} kg organic * 1.90 kg CO2e/kg = {round(avoided_co2e_kg, 2)} kg CO2e",
            f"Green Energy Token Minting: ({round(avoided_co2e_kg, 2)} kg CO2e / 10) * {round(purity_ratio, 3)} = {round(green_tokens, 4)} GET (${round(esg_value_usd, 2)} USD)"
        ]

        return BMPCalculationResult(
            total_feedstock_kg=round(gross_kg, 2),
            net_organic_kg=round(net_organic_kg, 2),
            methane_yield_m3=round(total_ch4_yield_m3, 3),
            total_biogas_yield_m3=round(total_biogas_yield_m3, 3),
            biogas_ch4_content_pct=round(self.DEFAULT_BIOGAS_CH4_FRACTION * 100.0, 1),
            chp_electricity_kwh=round(chp_elec_kwh, 2),
            chp_thermal_kwh=round(chp_thermal_kwh, 2),
            avoided_co2e_kg=round(avoided_co2e_kg, 2),
            green_energy_tokens=round(green_tokens, 4),
            esg_token_value_usd=round(esg_value_usd, 2),
            feedstock_breakdown=feedstock_breakdown,
            formula_audit_trail=formula_audit_trail
        )

# Global singleton
bmp_engine = BiochemicalMethaneAndCarbonEngine()
