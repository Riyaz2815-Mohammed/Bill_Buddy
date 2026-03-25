from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import json
from dotenv import load_dotenv

load_dotenv()

import sys
print(f"UVICORN IS RUNNING ON: {sys.executable}")

try:
    from mistralai.client import Mistral
    HAS_MISTRAL = True
except ImportError:
    HAS_MISTRAL = False
    print(f"WARNING: mistralai package not installed or incompatible in environment: {sys.executable}.")

class ScanRequest(BaseModel):
    base64_image: str

class BillItemResponse(BaseModel):
    name: str
    price: float
    
class ScanResponse(BaseModel):
    title: Optional[str] = "SCANNED BILL"
    items: List[BillItemResponse]

router = APIRouter()
OCR_API_KEY = os.getenv("OCR_API", os.getenv("MISTRAL_API_KEY"))

@router.post("/scan", response_model=ScanResponse)
async def scan_bill(data: ScanRequest):
    if not OCR_API_KEY:
        raise HTTPException(status_code=500, detail="OCR_API key is not configured correctly.")
        
    if not HAS_MISTRAL:
        print("Mistral AI SDK missing. Returning mock data.")
        return ScanResponse(title="MOCK RECEIPT", items=[
            BillItemResponse(name="Mock Pizza", price=450.0),
            BillItemResponse(name="Mock Coke", price=60.0),
        ])

    try:
        encoded_string = data.base64_image
        
        client = Mistral(api_key=OCR_API_KEY)
        
        # 1. OCR process to extract markdown from receipt
        ocr_response = client.ocr.process(
            model="mistral-ocr-latest",
            document={
                "type": "image_url",
                "image_url": f"data:image/jpeg;base64,{encoded_string}"
            }
        )
        
        extracted_text = ocr_response.pages[0].markdown

        # 2. Extract JSON mapping from the raw markdown
        messages = [
            {
                "role": "system",
                "content": "You are a receipt parser. Given OCR text, respond ONLY with a raw JSON object containing 'title' (string) and 'items' (array of objects with 'name' and 'price' as floats). DO NOT wrap with ```json."
            },
            {
                "role": "user",
                "content": extracted_text
            }
        ]
        
        response = client.chat.complete(
            model="mistral-small-latest",
            messages=messages,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        data_json = json.loads(content.strip())
        
        # Support both formats: direct array or {title, items}
        if isinstance(data_json, list):
            items = data_json
            title = "SCANNED BILL"
        else:
            items = data_json.get("items", [])
            title = data_json.get("title", "SCANNED BILL")
        
        return ScanResponse(
            title=title,
            items=[BillItemResponse(name=i["name"], price=float(i["price"])) for i in items]
        )
    except Exception as e:
        print(f"OCR gracefully failed: {e}")
        return ScanResponse(title="FAILED SCAN", items=[
            BillItemResponse(name="Mock Pizza", price=450.0),
            BillItemResponse(name="Mock Coke", price=60.0),
        ])

