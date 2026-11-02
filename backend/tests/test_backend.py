import pytest
import io
import numpy as np
import cv2
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.bmp_carbon_engine import bmp_engine
from backend.app.models.schemas import FeedstockInput, BatchStatus
from backend.app.services.cv_engine import vision_engine
from backend.app.services.rag_copilot import rag_copilot
from backend.app.models.schemas import CopilotQuery

client = TestClient(app)

def test_root_and_health():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "OPERATIONAL"
    
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"

def test_bmp_carbon_engine_precision():
    feedstock = FeedstockInput(
        fog_kg=100.0,
        meat_proteins_kg=50.0,
        carbs_starches_kg=100.0,
        mixed_cooked_kg=200.0,
        raw_greens_kg=50.0,
        purity_factor=95.0
    )
    result = bmp_engine.calculate(feedstock)
    
    # Check total weight = 500 kg
    assert result.total_feedstock_kg == 500.0
    assert result.net_organic_kg == 475.0
    
    # Check stoichiometric calculations
    # FOG: 100 * 0.85 * 0.95 = 80.75
    # Meat: 50 * 0.49 * 0.95 = 23.275
    # Carbs: 100 * 0.37 * 0.95 = 35.15
    # Mixed: 200 * 0.25 * 0.95 = 47.5
    # Greens: 50 * 0.18 * 0.95 = 8.55
    # Total CH4 = 80.75 + 23.275 + 35.15 + 47.5 + 8.55 = 195.225 m3
    assert abs(result.methane_yield_m3 - 195.225) < 0.01
    
    # Avoided CO2e = 475 * 1.90 = 902.5 kg
    assert abs(result.avoided_co2e_kg - 902.5) < 0.01
    assert result.green_energy_tokens > 0.0

def test_bmp_endpoint():
    payload = {
        "fog_kg": 10.0,
        "meat_proteins_kg": 20.0,
        "carbs_starches_kg": 30.0,
        "mixed_cooked_kg": 40.0,
        "raw_greens_kg": 50.0,
        "purity_factor": 100.0
    }
    response = client.post("/api/bmp/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_feedstock_kg"] == 150.0
    assert data["methane_yield_m3"] > 0.0
    assert data["chp_electricity_kwh"] > 0.0

def test_cv_engine_image_analysis():
    # Create a synthetic image buffer with mixed green regions and a bright red synthetic patch
    img = np.zeros((400, 400, 3), dtype=np.uint8)
    # Fill organic green background
    img[:] = (34, 139, 34)
    # Add a contaminant synthetic rectangle (bright red plastic cutlery simulation)
    cv2.rectangle(img, (100, 100), (200, 200), (0, 0, 255), -1)
    
    _, buffer = cv2.imencode('.jpg', img)
    image_bytes = buffer.tobytes()
    
    audit_res = vision_engine.analyze_frame(image_bytes)
    assert audit_res.audit_id.startswith("audit_")
    assert audit_res.image_width == 400
    assert audit_res.image_height == 400
    assert len(audit_res.detected_items) > 0
    assert audit_res.purity_pct > 0.0
    assert audit_res.annotated_image_base64.startswith("data:image/jpeg;base64,")

def test_rag_copilot_query():
    # Test souring query
    query = CopilotQuery(
        query="Our digester pH dropped to 6.3 and VFA/TIC is 0.46. How to remediate?",
        current_ph=6.3,
        current_vfa_tic=0.46
    )
    res = rag_copilot.query(query)
    assert res.stability_verdict == "CRITICAL_SOURING_RISK"
    assert len(res.actionable_remediations) > 0
    assert any("NaHCO3" in rem or "Sodium Bicarbonate" in rem for rem in res.actionable_remediations)

def test_batches_lifecycle_and_verification():
    # 1. List batches
    res = client.get("/api/batches/")
    assert res.status_code == 200
    batches = res.json()
    assert len(batches) >= 4
    
    # 2. Create a new batch
    create_payload = {
        "generator_name": "Royal Palm Convention Hall",
        "generator_type": "CATERING",
        "location_address": "77 Grand Boulevard",
        "latitude": 1.3012,
        "longitude": 103.8550,
        "feedstock": {
            "fog_kg": 15.0,
            "meat_proteins_kg": 25.0,
            "carbs_starches_kg": 60.0,
            "mixed_cooked_kg": 80.0,
            "raw_greens_kg": 40.0,
            "purity_factor": 97.0
        }
    }
    create_res = client.post("/api/batches/create", json=create_payload)
    assert create_res.status_code == 200
    new_batch = create_res.json()
    assert new_batch["status"] == "DISPATCH_READY"
    batch_id = new_batch["batch_id"]
    
    # 3. Driver scale weight verification
    scale_payload = {
        "batch_id": batch_id,
        "scale_weight_kg": 218.5,
        "driver_id": "Marcus Vance (Fleet Alpha-4)",
        "notes": "Calibrated electronic scale verified at loading dock."
    }
    verify_res = client.post("/api/batches/verify-scale", json=scale_payload)
    assert verify_res.status_code == 200
    updated_batch = verify_res.json()
    assert updated_batch["status"] == "IN_TRANSIT"
    assert updated_batch["verified_scale_weight_kg"] == 218.5

def test_digester_scada_telemetry():
    res = client.get("/api/digester/telemetry/DIGESTER-ALPHA-01")
    assert res.status_code == 200
    data = res.json()
    assert data["digester_id"] == "DIGESTER-ALPHA-01"
    assert data["ph_level"] > 6.0
    assert data["ch4_concentration_pct"] > 50.0

def test_producers_registration():
    # 1. List existing producers
    res = client.get("/api/producers/")
    assert res.status_code == 200
    producers = res.json()
    assert len(producers) >= 4

    # 2. Register a new restaurant
    new_rest = {
        "name": "Saffron Silk Indian Gourmet",
        "category": "RESTAURANT",
        "contact_person": "Chef Ananya Roy",
        "contact_email": "ananya@saffronsilk.sg",
        "contact_phone": "+65 6789 9999",
        "location_address": "88 Orchard Gateway, Sector 2",
        "latitude": 1.3005,
        "longitude": 103.8390,
        "avg_daily_waste_kg": 320.0,
        "primary_waste_type": "MIXED_COOKED",
        "assigned_biogas_facility": "BioPower AD Mega-Facility 01 (East Hub)"
    }
    reg_res = client.post("/api/producers/register", json=new_rest)
    assert reg_res.status_code == 200
    registered = reg_res.json()
    assert registered["name"] == "Saffron Silk Indian Gourmet"
    assert registered["producer_id"].startswith("PROD-")
    assert registered["qr_producer_tag"].startswith("TAG-QR-")

