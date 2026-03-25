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
    quantity: int = 1
    
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
        # Safely strip data:image/jpeg;base64, prefix if it exists
        if "," in encoded_string:
            encoded_string = encoded_string.split(",")[1]
            
        client = Mistral(api_key=OCR_API_KEY)
        
        # 1. OCR process to extract markdown from receipt
        ocr_response = client.ocr.process(
            model="mistral-ocr-latest",
            document={
                "type": "image_url",
                "image_url": f"data:image/jpeg;base64,{encoded_string}"
            }
        )
        
        if not ocr_response.pages:
            raise Exception("No pages found in OCR response")
            
        extracted_text = ocr_response.pages[0].markdown

        # 2. Extract JSON mapping from the raw markdown
        messages = [
            {
                "role": "user",
                "content": f"""Extract the line items from this receipt text. 
CRITICAL RULE: YOU MUST RETURN EXACTLY VALID JSON. DO NOT INCLUDE ANY MARKDOWN WRAPPERS OR TICK MARKS. JUST PURE JSON.
If there are no items, return empty array. 
For EACH item, find the name, the EXACT quantity (default to 1 if not explicitly listed), and the EXACT RATE/UNIT PRICE. 
DO NOT RETURN THE TOTAL AMOUNT AS THE PRICE unless quantity is 1 and rate is omitted. PRICE MUST BE THE RATE PER UNIT. 
Quantity MUST be an integer. Price MUST be a float.
Expected format:
{{
  "items": [
    {{"name": "BIRI YANI", "quantity": 1, "price": 130.00}},
    {{"name": "MT HALF KG", "quantity": 5, "price": 80.00}}
  ]
}}
Raw text:
{extracted_text}"""
            }
        ]
        
        response = client.chat.complete(
            model="mistral-small-latest",
            messages=messages,
            # Mistral-small returns the JSON string
            # response_format={"type": "json_object"} # Removed as per instruction to handle manually
        )

        content = response.choices[0].message.content.strip()
        
        # Robust JSON extraction using regex to find first { and last }
        import re
        json_match = re.search(r"(\{.*\})", content, re.DOTALL)
        if json_match:
            content = json_match.group(1)
        else:
            # Fallback if regex fails, try existing logic
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            
        parsed = json.loads(content.strip())
        items = parsed.get("items", [])
        
        # Map robust Pydantic structure
        return ScanResponse(
            title="SCANNED BILL", # Title is not extracted by the new prompt, so default
            items=[BillItemResponse(name=i["name"], price=float(i["price"]), quantity=int(i.get("quantity", 1))) for i in items]
        )
    except Exception as e:
        print(f"OCR gracefully failed: {e}")
        return ScanResponse(title="FAILED SCAN", items=[
            BillItemResponse(name="Mock Pizza", price=450.0),
            BillItemResponse(name="Mock Coke", price=60.0),
        ])

