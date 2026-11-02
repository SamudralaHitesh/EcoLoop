from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.app.models.schemas import (
    BatchResponse, CreateBatchRequest, ScaleVerificationRequest, BatchStatus
)
from backend.app.services.logistics_engine import logistics_engine

router = APIRouter(prefix="/batches", tags=["Logistics & Batch Lifecycle Engine"])

@router.get("/", response_model=List[BatchResponse])
async def list_all_batches(status: Optional[str] = Query(None)):
    batches = logistics_engine.get_all_batches()
    if status:
        batches = [b for b in batches if b.status.value == status]
    return batches

@router.post("/create", response_model=BatchResponse)
async def create_batch(req: CreateBatchRequest):
    return logistics_engine.create_batch(req)

@router.get("/{batch_id}", response_model=BatchResponse)
async def get_batch_detail(batch_id: str):
    batch = logistics_engine.get_batch(batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail=f"Batch {batch_id} not found")
    return batch

@router.post("/verify-scale", response_model=BatchResponse)
async def verify_scale_weight(req: ScaleVerificationRequest):
    try:
        return logistics_engine.verify_scale_weight(
            batch_id=req.batch_id,
            scale_weight=req.scale_weight_kg,
            driver_id=req.driver_id,
            notes=req.notes
        )
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Batch {req.batch_id} not found")

@router.post("/{batch_id}/transition", response_model=BatchResponse)
async def transition_status(batch_id: str, new_status: BatchStatus, driver_name: Optional[str] = None, notes: Optional[str] = None):
    try:
        return logistics_engine.update_batch_status(
            batch_id=batch_id,
            new_status=new_status,
            driver_name=driver_name,
            notes=notes
        )
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Batch {batch_id} not found")
