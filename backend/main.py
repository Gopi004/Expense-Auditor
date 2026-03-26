import os
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# Initialize the modern Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
# --- ADD THESE LINES TO DEBUG ---
print("--- AVAILABLE MODELS ---")
for m in client.models.list():
    print(m.name)
print("------------------------")
# --------------------------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_POLICY = """
- Dinner limit: $50
- Lunch limit: $25
- No alcohol allowed.
- Receipts older than 30 days are rejected.
"""

@app.post("/audit")
async def audit_expense(file: UploadFile = File(...), purpose: str = Form(...)):
    image_bytes = await file.read()
    
    # Using Gemini 3 Flash (The latest version for 2026)
    prompt = f"""
    Analyze this receipt against this policy:
    {BASE_POLICY}
    
    Employee Justification: {purpose}
    
    1. Perform OCR: Extract Merchant, Date (DD-MM-YYYY), Total Amount (float), and Currency.
    2. Validation: Check if the receipt is blurry. If so, set is_blurry: true.
    3. Policy Check: Compare the 'Total Amount' against the policy limits.
    4. Logic Check: Does the 'Business Purpose' provided by the user make sense for this merchant?

    Return ONLY a JSON object with these keys: 
    {{
    "merchant": string,
    "date": string, 
    "amount": float, 
    "currency": string, 
    "is_blurry": boolean,
    "status": "Approved" | "Flagged" | "Rejected",
    "reason": string
    }}
    """

    response = client.models.generate_content(
        model="models/gemini-2.5-flash", # Use 'gemini-1.5-flash'
        contents=[
            prompt,
            types.Part.from_bytes(data=image_bytes, mime_type=file.content_type)
        ]
    )
    
    return {"analysis": response.text}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)