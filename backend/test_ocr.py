import os
from dotenv import load_dotenv
from mistralai.client import Mistral
import json

load_dotenv()
API_KEY = os.getenv("OCR_API", os.getenv("MISTRAL_API_KEY"))

def test_ocr():
    client = Mistral(api_key=API_KEY)
    
    # Dummy base64 1x1 pixel JPEG
    test_image_base64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
    
    try:
        print("Testing mistral-ocr-latest...")
        response = client.ocr.process(
            model="mistral-ocr-latest",
            document={
                "type": "image_url",
                "image_url": f"data:image/jpeg;base64,{test_image_base64}"
            }
        )
        print("OCR Process succeeded!")
        
        markdown_text = response.pages[0].markdown
        print(f"Markdown Context: {markdown_text}")
        
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    test_ocr()
