from fastapi import APIRouter, UploadFile, File, HTTPException
from mistralai import Mistral
import os, base64, json

router = APIRouter()
client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))

@router.post("/scan")
async def scan_bill(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_data = await file.read()
    base64_image = base64.b64encode(image_data).decode("utf-8")

    response = client.chat.complete(
        model="pixtral-12b-2409",
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": f"data:{file.content_type};base64,{base64_image}"
                },
                {
                    "type": "text",
                    "text": """Extract all items and prices from this restaurant bill.
Return ONLY a valid JSON array like this:
[{"name": "Item Name", "price": 150, "quantity": 1}]
No extra text, no markdown, just the JSON array."""
                }
            ]
        }]
    )

    text = response.choices[0].message.content.strip()
    # Strip markdown code fences if present
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    items = json.loads(text.strip())
    return {"items": items}
