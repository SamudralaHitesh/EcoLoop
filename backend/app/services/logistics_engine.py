import uuid
import math
import random
from typing import List, Dict, Optional, Any
from datetime import datetime, timezone
from backend.app.models.schemas import (
    BatchStatus, BatchResponse, CreateBatchRequest,
    FeedstockInput, DigesterTelemetry
)
from backend.app.services.bmp_carbon_engine import bmp_engine
from backend.app.services.cv_engine import vision_engine

class LogisticsAndSCADAEngine:
    """
    Logistics & Multi-Party Lifecycle Management Engine.
    Coordinates real-time transitions between Commercial Food Waste Producers,
    Driver Fleets (QR & Digital Scale verification), and Biogas Plants (Inflow & SCADA).
    """
    def __init__(self):
        self.batches: Dict[str, BatchResponse] = {}
        self.digesters: Dict[str, DigesterTelemetry] = {}
        self._seed_initial_data()

    def _seed_initial_data(self):
        seed_generators = [
            {
                "generator_name": "Grand Horizon Palace Hotel",
                "generator_type": "HOTEL",
                "location_address": "400 Marina Bay Blvd, Sector 4",
                "latitude": 1.2834,
                "longitude": 103.8607,
                "feedstock": FeedstockInput(fog_kg=45.0, meat_proteins_kg=80.0, carbs_starches_kg=120.0, mixed_cooked_kg=210.0, raw_greens_kg=95.0, purity_factor=96.5),
                "status": BatchStatus.DISPATCH_READY,
                "assigned_driver": "Marcus Vance (Fleet Alpha-4)",
                "purity_pct": 96.5,
                "contamination_pct": 3.5
            },
            {
                "generator_name": "Metro Tech Tower Canteen",
                "generator_type": "CANTEEN",
                "location_address": "88 Innovation Way, Tech Park",
                "latitude": 1.2950,
                "longitude": 103.8520,
                "feedstock": FeedstockInput(fog_kg=20.0, meat_proteins_kg=60.0, carbs_starches_kg=180.0, mixed_cooked_kg=150.0, raw_greens_kg=140.0, purity_factor=94.0),
                "status": BatchStatus.IN_TRANSIT,
                "assigned_driver": "Sarah Jenkins (Fleet Beta-2)",
                "purity_pct": 94.0,
                "contamination_pct": 6.0
            },
            {
                "generator_name": "Spice Route Gourmet Bistro",
                "generator_type": "RESTAURANT",
                "location_address": "12 Heritage Row, Old Town",
                "latitude": 1.2890,
                "longitude": 103.8450,
                "feedstock": FeedstockInput(fog_kg=35.0, meat_proteins_kg=45.0, carbs_starches_kg=70.0, mixed_cooked_kg=90.0, raw_greens_kg=40.0, purity_factor=98.0),
                "status": BatchStatus.RECEIVED_AT_PLANT,
                "assigned_driver": "Sarah Jenkins (Fleet Beta-2)",
                "purity_pct": 98.0,
                "contamination_pct": 2.0
            },
            {
                "generator_name": "Apex Culinary Catering Hub",
                "generator_type": "CATERING",
                "location_address": "550 Airport Cargo Link, Hub 2",
                "latitude": 1.3500,
                "longitude": 103.9800,
                "feedstock": FeedstockInput(fog_kg=15.0, meat_proteins_kg=30.0, carbs_starches_kg=40.0, mixed_cooked_kg=50.0, raw_greens_kg=25.0, purity_factor=81.0),
                "status": BatchStatus.REJECTED,
                "assigned_driver": None,
                "purity_pct": 81.0,
                "contamination_pct": 19.0
            }
        ]

        for item in seed_generators:
            b_id = f"BATCH-2026-{uuid.uuid4().hex[:6].upper()}"
            feedstock = item["feedstock"]
            calc = bmp_engine.calculate(feedstock)
            
            timeline = [
                {"step": "LOGGED", "timestamp": "2026-08-30 08:30:00 UTC", "desc": "Waste batch logged by Kitchen Station"},
                {"step": "AI_AUDITED", "timestamp": "2026-08-30 08:32:15 UTC", "desc": f"CV Audit complete: Purity {item['purity_pct']}%, Contamination {item['contamination_pct']}%"}
            ]
            if item["status"] in [BatchStatus.DISPATCH_READY, BatchStatus.IN_TRANSIT, BatchStatus.RECEIVED_AT_PLANT, BatchStatus.IN_DIGESTER]:
                timeline.append({"step": "DISPATCH_READY", "timestamp": "2026-08-30 08:35:00 UTC", "desc": "Batch approved and QR dispatch token issued"})
            if item["status"] in [BatchStatus.IN_TRANSIT, BatchStatus.RECEIVED_AT_PLANT, BatchStatus.IN_DIGESTER]:
                timeline.append({"step": "IN_TRANSIT", "timestamp": "2026-08-30 09:10:00 UTC", "desc": f"Driver {item['assigned_driver']} verified scale weight and initiated transit"})
            if item["status"] in [BatchStatus.RECEIVED_AT_PLANT, BatchStatus.IN_DIGESTER]:
                timeline.append({"step": "RECEIVED_AT_PLANT", "timestamp": "2026-08-30 10:20:00 UTC", "desc": "Inflow verified at Bio-Facility Ingest Gate 2"})
            if item["status"] == BatchStatus.REJECTED:
                timeline.append({"step": "REJECTED", "timestamp": "2026-08-30 08:33:00 UTC", "desc": "Rejected: Contamination >15% limit. Sorting required."})

            batch = BatchResponse(
                batch_id=b_id,
                qr_code_id=f"QR-{b_id}",
                created_at=datetime.now(timezone.utc).isoformat(),
                generator_name=item["generator_name"],
                generator_type=item["generator_type"],
                location_address=item["location_address"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                total_weight_kg=calc.total_feedstock_kg,
                verified_scale_weight_kg=calc.total_feedstock_kg if item["status"] in [BatchStatus.IN_TRANSIT, BatchStatus.RECEIVED_AT_PLANT, BatchStatus.IN_DIGESTER] else None,
                purity_pct=item["purity_pct"],
                contamination_pct=item["contamination_pct"],
                status=item["status"],
                methane_potential_m3=calc.methane_yield_m3,
                avoided_co2e_kg=calc.avoided_co2e_kg,
                green_tokens_earned=calc.green_energy_tokens,
                assigned_driver=item["assigned_driver"],
                target_facility="BioPower AD Facility Alpha (East Sector)",
                audit_summary={"verdict": "PASS" if item["status"] != BatchStatus.REJECTED else "FAIL"},
                timeline=timeline
            )
            self.batches[b_id] = batch

        # Initialize Digesters
        self.digesters["DIGESTER-ALPHA-01"] = DigesterTelemetry(
            digester_id="DIGESTER-ALPHA-01",
            name="Primary Continuous Stirred Tank Reactor (CSTR Alpha)",
            status="OPTIMAL",
            operating_temp_c=37.4,
            target_temp_c=37.0,
            ph_level=7.24,
            vfa_tic_ratio=0.22,
            vfa_concentration_mg_l=820.0,
            tic_alkalinity_mg_l=3720.0,
            biogas_production_m3_h=342.5,
            ch4_concentration_pct=62.8,
            h2s_ppm=64.0,
            co2_concentration_pct=36.4,
            organic_loading_rate_kg_vs_m3_d=3.8,
            hydraulic_retention_time_days=24.5,
            active_feedstock_mass_tons=1240.0,
            bio_fertilizer_digestate_m3=410.0,
            health_score_pct=98.2,
            alerts=[
                {"level": "INFO", "msg": "Optimal methanogenic steady state. Gas methane purity at 62.8%."}
            ]
        )

        self.digesters["DIGESTER-BETA-02"] = DigesterTelemetry(
            digester_id="DIGESTER-BETA-02",
            name="Thermophilic High-Rate Digester (Beta-02)",
            status="WARNING",
            operating_temp_c=54.8,
            target_temp_c=55.0,
            ph_level=6.92,
            vfa_tic_ratio=0.34,
            vfa_concentration_mg_l=1450.0,
            tic_alkalinity_mg_l=4250.0,
            biogas_production_m3_h=510.2,
            ch4_concentration_pct=58.2,
            h2s_ppm=185.0,
            co2_concentration_pct=40.8,
            organic_loading_rate_kg_vs_m3_d=5.2,
            hydraulic_retention_time_days=16.0,
            active_feedstock_mass_tons=890.0,
            bio_fertilizer_digestate_m3=285.0,
            health_score_pct=84.5,
            alerts=[
                {"level": "WARNING", "msg": "VFA/TIC ratio elevated (0.34). Organic loading rate approaching upper ceiling."}
            ]
        )

    def create_batch(self, req: CreateBatchRequest) -> BatchResponse:
        b_id = f"BATCH-2026-{uuid.uuid4().hex[:6].upper()}"
        calc = bmp_engine.calculate(req.feedstock)
        
        purity = req.feedstock.purity_factor
        contamination = round(100.0 - purity, 2)
        initial_status = BatchStatus.DISPATCH_READY if contamination <= 15.0 else BatchStatus.REJECTED
        
        timeline = [
            {"step": "LOGGED", "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"), "desc": "Waste batch logged by Kitchen Station"},
            {"step": "AI_AUDITED", "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"), "desc": f"CV Audit: Purity {purity}%, Contamination {contamination}%"}
        ]
        if initial_status == BatchStatus.DISPATCH_READY:
            timeline.append({"step": "DISPATCH_READY", "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"), "desc": "Verified below 15% contamination. QR issued."})
        else:
            timeline.append({"step": "REJECTED", "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"), "desc": "Rejected: Contamination >15%. Manual sorting mandatory."})

        batch = BatchResponse(
            batch_id=b_id,
            qr_code_id=f"QR-{b_id}",
            created_at=datetime.now(timezone.utc).isoformat(),
            generator_name=req.generator_name,
            generator_type=req.generator_type,
            location_address=req.location_address,
            latitude=req.latitude,
            longitude=req.longitude,
            total_weight_kg=calc.total_feedstock_kg,
            verified_scale_weight_kg=None,
            purity_pct=purity,
            contamination_pct=contamination,
            status=initial_status,
            methane_potential_m3=calc.methane_yield_m3,
            avoided_co2e_kg=calc.avoided_co2e_kg,
            green_tokens_earned=calc.green_energy_tokens,
            assigned_driver=None,
            target_facility="BioPower AD Facility Alpha (East Sector)",
            audit_summary={"purity": purity, "verdict": "PASS" if initial_status != BatchStatus.REJECTED else "FAIL"},
            timeline=timeline
        )
        self.batches[b_id] = batch
        return batch

    def update_batch_status(self, batch_id: str, new_status: BatchStatus, driver_name: Optional[str] = None, notes: Optional[str] = None) -> BatchResponse:
        if batch_id not in self.batches:
            raise KeyError(f"Batch {batch_id} not found")
        batch = self.batches[batch_id]
        batch.status = new_status
        if driver_name:
            batch.assigned_driver = driver_name
        
        desc = f"Status advanced to {new_status.value}"
        if notes:
            desc += f" - {notes}"
        batch.timeline.append({
            "step": new_status.value,
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "desc": desc
        })
        return batch

    def verify_scale_weight(self, batch_id: str, scale_weight: float, driver_id: str, notes: Optional[str] = None) -> BatchResponse:
        if batch_id not in self.batches:
            raise KeyError(f"Batch {batch_id} not found")
        batch = self.batches[batch_id]
        batch.verified_scale_weight_kg = scale_weight
        batch.status = BatchStatus.IN_TRANSIT
        batch.assigned_driver = driver_id
        
        batch.timeline.append({
            "step": "IN_TRANSIT",
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "desc": f"Driver {driver_id} verified digital scale weight: {scale_weight} kg. Pickup confirmed."
        })
        return batch

    def get_all_batches(self) -> List[BatchResponse]:
        return list(self.batches.values())

    def get_batch(self, batch_id: str) -> Optional[BatchResponse]:
        return self.batches.get(batch_id)

    def get_digester_telemetry(self, digester_id: str = "DIGESTER-ALPHA-01") -> DigesterTelemetry:
        if digester_id not in self.digesters:
            digester_id = "DIGESTER-ALPHA-01"
        telemetry = self.digesters[digester_id]
        
        # Add subtle micro-fluctuations for realistic live SCADA streaming
        drift_ph = round(telemetry.ph_level + (random.random() - 0.5) * 0.02, 2)
        drift_temp = round(telemetry.operating_temp_c + (random.random() - 0.5) * 0.05, 1)
        drift_gas = round(telemetry.biogas_production_m3_h + (random.random() - 0.5) * 2.0, 1)
        
        telemetry.ph_level = max(6.4, min(7.8, drift_ph))
        telemetry.operating_temp_c = drift_temp
        telemetry.biogas_production_m3_h = max(0.0, drift_gas)
        
        return telemetry

# Global singleton
logistics_engine = LogisticsAndSCADAEngine()
