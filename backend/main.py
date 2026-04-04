import os
from fastapi import FastAPI, UploadFile, File, Form, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
from google.genai import types
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import json
from datetime import datetime

load_dotenv()

# 1. Database Setup
DB_URL = "sqlite:///./expenses.db"
engine = create_engine(DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 2. Define the Table
class ExpenseClaim(Base):
    __tablename__ = "claims"
    id = Column(Integer, primary_key=True, index=True)
    merchant = Column(String)
    amount = Column(Float)
    currency = Column(String)
    status = Column(String) # Approved, Flagged, Rejected
    reason = Column(String)

Base.metadata.create_all(bind=engine)

# Initialize the modern Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_POLICY = """
- Dinner limit: $50 or Rs. 1000
- Lunch limit: $25 or Rs. 500
- No alcohol allowed.
- Receipts older than 30 days are rejected.
"""

@app.get("/admin/all-claims")
async def get_all_claims(x_user_role: str = Header(None)):
    if x_user_role != "auditor":
        raise HTTPException(status_code=403, detail="Only auditors can see this.")
    
    db = SessionLocal()
    try:
        claims= db.query(ExpenseClaim).order_by(ExpenseClaim.id.desc()).all()
        return {"claims": [
            {
                "id": c.id,
                "merchant": c.merchant,
                "amount": c.amount,
                "currency": c.currency,
                "status": c.status,
                "reason": c.reason
            }
            for c in claims
        ]}
    except Exception as e:
        print(f"Error fetching claims: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching claims: {str(e)}")
    finally:
        db.close()

@app.post("/audit")
async def audit_expense(file: UploadFile = File(...), purpose: str = Form(...)):
    try:
        image_bytes = await file.read()

        mime_type = file.content_type

        print(f"Processing file: {file.filename} with type: {mime_type}")
        
        # Using Gemini 3 Flash (The latest version for 2026)
        prompt = f"""
        Analyze this receipt against this policy:
        {BASE_POLICY}
        
        Employee Justification: {purpose}
        
        1. Perform OCR: Extract Merchant, Date (DD-MM-YYYY), Total Amount (float), and Currency. Compare the date against today's date {datetime.now().strftime('%d-%m-%Y')} to check if it's older than 30 days.
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
            model="models/gemini-2.5-flash", # Use 'gemini-2.5-flash'
            contents=[
                prompt,
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
            ]
        )

        response_text = response.text.replace("```json", "").replace("```", "").strip()
        auditData = json.loads(response_text)

        db = SessionLocal()
        new_claim = ExpenseClaim(
            merchant=auditData['merchant'],
            currency=auditData['currency'],
            amount=auditData['amount'],
            status=auditData['status'],
            reason=auditData['reason']
        )
        db.add(new_claim)
        db.commit()
        db.close()
        
        return {"analysis": auditData}
    except Exception as e:
        print(f"Error during audit: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)