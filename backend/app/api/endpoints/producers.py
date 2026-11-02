import uuid
from datetime import datetime, timezone
from typing import List, Dict
from fastapi import APIRouter, HTTPException
from backend.app.models.schemas import ProducerRegistrationRequest, ProducerResponse

router = APIRouter(prefix="/producers", tags=["Commercial Producers & Restaurant Network"])

# In-memory store for registered food waste producers / restaurants / companies
PRODUCERS_STORE: Dict[str, ProducerResponse] = {
    "PROD-HOTEL-01": ProducerResponse(
        producer_id="PROD-HOTEL-01",
        qr_producer_tag="TAG-QR-PROD-HOTEL-01",
        name="Grand Horizon Palace Hotel",
        category="HOTEL",
        contact_person="Chef Marco Rossi",
        contact_email="marco.rossi@grandhorizon.com",
        contact_phone="+65 6789 0101",
        location_address="400 Marina Bay Blvd, Sector 4",
        latitude=1.2834,
        longitude=103.8607,
        avg_daily_waste_kg=550.0,
        primary_waste_type="MIXED_COOKED",
        assigned_biogas_facility="BioPower AD Mega-Facility 01 (East Hub)",
        total_diverted_mass_kg=4820.0,
        total_green_tokens_earned=915.8,
        status="ACTIVE_CERTIFIED",
        onboarded_at="2026-07-15T08:00:00Z"
    ),
    "PROD-CANTEEN-02": ProducerResponse(
        producer_id="PROD-CANTEEN-02",
        qr_producer_tag="TAG-QR-PROD-CANTEEN-02",
        name="Metro Tech Tower Canteen",
        category="CANTEEN",
        contact_person="Anita Verma (Operations Lead)",
        contact_email="anita.v@metrotech.org",
        contact_phone="+65 6789 0202",
        location_address="88 Innovation Way, Tech Park",
        latitude=1.2950,
        longitude=103.8520,
        avg_daily_waste_kg=420.0,
        primary_waste_type="CARBS_BAKERY",
        assigned_biogas_facility="BioPower AD Mega-Facility 01 (East Hub)",
        total_diverted_mass_kg=3650.0,
        total_green_tokens_earned=693.5,
        status="ACTIVE_CERTIFIED",
        onboarded_at="2026-07-20T09:30:00Z"
    ),
    "PROD-REST-03": ProducerResponse(
        producer_id="PROD-REST-03",
        qr_producer_tag="TAG-QR-PROD-REST-03",
        name="Spice Route Gourmet Bistro",
        category="RESTAURANT",
        contact_person="Rajesh Kumar (Head Chef)",
        contact_email="rajesh@spiceroute.sg",
        contact_phone="+65 6789 0303",
        location_address="12 Heritage Row, Old Town",
        latitude=1.2890,
        longitude=103.8450,
        avg_daily_waste_kg=280.0,
        primary_waste_type="FOG_GREASE",
        assigned_biogas_facility="BioPower AD Mega-Facility 01 (East Hub)",
        total_diverted_mass_kg=2140.0,
        total_green_tokens_earned=406.6,
        status="ACTIVE_CERTIFIED",
        onboarded_at="2026-08-01T11:00:00Z"
    ),
    "PROD-CATER-04": ProducerResponse(
        producer_id="PROD-CATER-04",
        qr_producer_tag="TAG-QR-PROD-CATER-04",
        name="Apex Culinary Catering Hub",
        category="CATERING",
        contact_person="David Lim (Logistics Manager)",
        contact_email="david.lim@apexcatering.com",
        contact_phone="+65 6789 0404",
        location_address="550 Airport Cargo Link, Hub 2",
        latitude=1.3500,
        longitude=103.9800,
        avg_daily_waste_kg=600.0,
        primary_waste_type="MIXED_COOKED",
        assigned_biogas_facility="BioPower AD Mega-Facility 01 (East Hub)",
        total_diverted_mass_kg=5120.0,
        total_green_tokens_earned=972.8,
        status="ACTIVE_CERTIFIED",
        onboarded_at="2026-08-05T14:15:00Z"
    )
}

@router.get("/", response_model=List[ProducerResponse])
async def list_producers():
    """
    Returns all registered commercial food waste producers (Restaurants, Hotels, Canteens, Caterers).
    """
    return list(PRODUCERS_STORE.values())

@router.post("/register", response_model=ProducerResponse)
async def register_producer(req: ProducerRegistrationRequest):
    """
    Onboards and registers a new commercial restaurant or food company to the BioWaste Neural-Grid.
    Generates cryptographic QR bin tags and initializes the producer's carbon ledger.
    """
    producer_id = f"PROD-{req.category[:4]}-{uuid.uuid4().hex[:5].upper()}"
    qr_tag = f"TAG-QR-{producer_id}"

    new_producer = ProducerResponse(
        producer_id=producer_id,
        qr_producer_tag=qr_tag,
        name=req.name,
        category=req.category,
        contact_person=req.contact_person,
        contact_email=req.contact_email,
        contact_phone=req.contact_phone,
        location_address=req.location_address,
        latitude=req.latitude,
        longitude=req.longitude,
        avg_daily_waste_kg=req.avg_daily_waste_kg,
        primary_waste_type=req.primary_waste_type,
        assigned_biogas_facility=req.assigned_biogas_facility,
        total_diverted_mass_kg=0.0,
        total_green_tokens_earned=0.0,
        status="ACTIVE_CERTIFIED",
        onboarded_at=datetime.now(timezone.utc).isoformat()
    )

    PRODUCERS_STORE[producer_id] = new_producer
    return new_producer

@router.get("/{producer_id}", response_model=ProducerResponse)
async def get_producer_detail(producer_id: str):
    if producer_id not in PRODUCERS_STORE:
        raise HTTPException(status_code=404, detail=f"Producer {producer_id} not found")
    return PRODUCERS_STORE[producer_id]
