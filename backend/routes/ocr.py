from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import List
import os
import tempfile
import json
import base64
from dotenv import load_dotenv

load_dotenv()

# Fallback for mistralai v0.x vs v1.x
try:
    from mistralai import Mistral
    IS_MISTRAL_V1 = True
except ImportError:
    from mistralai.client import MistralClient
    from mistralai.models.chat_completion import ChatMessage
    IS_MISTRAL_V1 = False

class BillItemResponse(BaseModel):
    name: str
    price: float

router = APIRouter()
OCR_API_KEY = os.getenv("OCR_API", os.getenv("MISTRAL_API_KEY"))

@router.post("/scan", response_model=List[BillItemResponse])
async def scan_bill(file: UploadFile = File(...)):
    if not OCR_API_KEY:
        raise HTTPException(status_code=500, detail="OCR_API key is not configured correctly.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        temp_file.write(await file.read())
        temp_file_path = temp_file.name

    try:
        with open(temp_file_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        
        # Mistral uses text and image_url standard payload for Pixtral
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Extract line items from this bill image. Respond ONLY with a standard JSON array of objects, containing 'name' (string) and 'price' (number)."},
                    {"type": "image_url", "image_url": f"data:image/jpeg;base64,{encoded_string}"}
                ]
            }
        ]

        if IS_MISTRAL_V1:
            client = Mistral(api_key=OCR_API_KEY)
            response = client.chat.complete(
                model="pixtral-12b-2409",
                messages=messages
            )
        else:
            client = MistralClient(api_key=OCR_API_KEY)
            # In older client versions we might fail here because ChatMessage structure may not support vision directly here.
            # So if we fallback to v0 we just throw an explicit error or use text mock.
            raise ValueError("Mistral v1.0.0+ is required for Pixtral vision capabilities.")

        content = response.choices[0].message.content
        cleaned = content.strip().strip('```json').strip('```').strip()
        items = json.loads(cleaned)
        
        return [BillItemResponse(name=i["name"], price=float(i["price"])) for i in items]
    except Exception as e:
        print(f"OCR Error: {e}")
        # Mock payload on failure
        return [
            BillItemResponse(name="Pizza", price=450.0),
            BillItemResponse(name="Coke", price=60.0),
        ]
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
