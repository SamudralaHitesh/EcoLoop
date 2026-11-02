import base64
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from backend.app.models.schemas import VisionAuditResponse
from backend.app.services.cv_engine import vision_engine

router = APIRouter(prefix="/vision", tags=["AI Computer Vision Contamination Engine"])

@router.post("/audit", response_model=VisionAuditResponse)
async def audit_food_waste(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None)
):
    """
    Ingests kitchen food waste bin images via file upload or base64 stream.
    Applies neural localization & area coverage geometry to identify non-organic contaminants,
    compute purity score, and enforce the >15% rejection limit.
    """
    image_bytes = None
    filename = "bin_snapshot.jpg"
    
    if file:
        image_bytes = await file.read()
        filename = file.filename or "upload.jpg"
    elif image_base64:
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
        try:
            image_bytes = base64.b64decode(image_base64)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid base64 image data: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="Either 'file' or 'image_base64' must be provided.")

    try:
        result = vision_engine.analyze_frame(image_bytes=image_bytes, filename=filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CV Engine processing failed: {str(e)}")
