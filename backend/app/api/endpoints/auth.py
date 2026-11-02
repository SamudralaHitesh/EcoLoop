from fastapi import APIRouter, HTTPException, status, Depends
from backend.app.models.schemas import UserLogin, TokenResponse, RoleEnum
from backend.app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

DEMO_USERS = {
    "kitchen@neuralgrid.bio": {
        "id": "usr_kitchen_01",
        "username": "kitchen@neuralgrid.bio",
        "role": RoleEnum.KITCHEN,
        "full_name": "Executive Chef Marco Rossi",
        "organization": "Grand Horizon Palace Hotel Kitchens",
        "facility_id": "HOTEL-KITCHEN-04"
    },
    "driver@neuralgrid.bio": {
        "id": "usr_driver_02",
        "username": "driver@neuralgrid.bio",
        "role": RoleEnum.DRIVER,
        "full_name": "Marcus Vance",
        "organization": "BioRoute Logistics Fleet Alpha",
        "truck_id": "FLEET-TRUCK-A4"
    },
    "operator@neuralgrid.bio": {
        "id": "usr_operator_03",
        "username": "operator@neuralgrid.bio",
        "role": RoleEnum.PLANT_OPERATOR,
        "full_name": "Dr. Aris Thorne (Bioprocess Engineer)",
        "organization": "BioPower AD Mega-Facility 01",
        "facility_id": "FAC-MEGA-01"
    },
    "admin@neuralgrid.bio": {
        "id": "usr_admin_04",
        "username": "admin@neuralgrid.bio",
        "role": RoleEnum.ADMIN,
        "full_name": "Dr. Elena Vance (Lead AI Architect)",
        "organization": "BioWaste Neural-Grid Global ESG",
        "facility_id": "HQ-GLOBAL"
    }
}

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user_email = credentials.username.lower()
    user_record = DEMO_USERS.get(user_email)
    
    if not user_record:
        # Allow dynamic login with specified role
        role = credentials.role or RoleEnum.ADMIN
        user_record = {
            "id": f"usr_{role.value.lower()}_{user_email.split('@')[0]}",
            "username": credentials.username,
            "role": role,
            "full_name": f"{role.value.replace('_', ' ').title()} User",
            "organization": "BioWaste Neural-Grid Network"
        }
    
    token_data = {
        "sub": user_record["username"],
        "id": user_record["id"],
        "role": user_record["role"].value if hasattr(user_record["role"], "value") else str(user_record["role"]),
        "full_name": user_record["full_name"],
        "organization": user_record["organization"]
    }
    
    token = create_access_token(data=token_data)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user_record
    )

@router.get("/demo-users")
async def get_demo_users():
    return list(DEMO_USERS.values())
