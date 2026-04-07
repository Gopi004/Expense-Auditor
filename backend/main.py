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
from passlib.context import CryptContext

load_dotenv()

# 1. Database Setup
DB_URL = "sqlite:///./expenses.db"
engine = create_engine(DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)

# 2. Define the Table
class ExpenseClaim(Base):
    __tablename__ = "claims"
    id = Column(Integer, primary_key=True, index=True)
    merchant = Column(String)
    amount = Column(Float)
    currency = Column(String)
    status = Column(String) # Approved, Flagged, Rejected
    rules_violated = Column(String) # Store which rules were violated
    reason = Column(String)
    email = Column(String) # Add email field to associate claims with users

Base.metadata.create_all(bind=engine)

# Initialize the modern Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_POLICY = """
Rule 1.1: Dinner expenses are capped at Rs. 1000 ($50).
Rule 1.2: Lunch expenses are capped at Rs. 500 ($25).
Rule 1.3: Breakfast expenses are capped at Rs. 200 ($20).
Rule 2.1: Alcohol of any kind is strictly prohibited and will result in automatic rejection.
Rule 3.1: All receipts must be submitted within 30 days of the transaction date.
Rule 4.1: Business purpose must align with the merchant (e.g., "Office supplies" for a tech store).
Rule 5.1: Uber/Lyft allowed for business only. Tips capped at 20%.
Rule 6.1: Standard rooms only. Mini-bar charges are REJECTED.
"""

@app.post("/signin")
async def signin(email: str=Form(...), password: str=Form(...), role: str=Form(...)):
    db=SessionLocal()

    exists= db.query(User).filter(User.email == email).first()
    if exists:
        db.close()
        raise HTTPException(status_code=400, detail="User already exists.")
    new_user = User(
        email=email,
        hashed_password=pwd_context.hash(password),
        role=role
    )
    db.add(new_user)
    db.commit()
    db.close()
    return {"message": "User created successfully."}

@app.post("/login")
async def login(email: str=Form(...), password: str=Form(...)):
    db=SessionLocal()
    user= db.query(User).filter(User.email == email).first()
    if not user or not pwd_context.verify(password, user.hashed_password):
        db.close()
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    db.close()
    return {"email": user.email, "role": user.role}

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
                "rules_violated": c.rules_violated,
                "reason": c.reason,
                "email": c.email
            }
            for c in claims
        ]}
    except Exception as e:
        print(f"Error fetching claims: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching claims: {str(e)}")
    finally:
        db.close()

@app.patch("/admin/update-status/{claim_id}")
async def update_status(claim_id: int, status: str=Form(...), reason:str=Form(...)):
    db=SessionLocal()
    try:
        claim=db.query(ExpenseClaim).filter(ExpenseClaim.id == claim_id).first()
        if not claim:
            raise HTTPException(status_code=404, detail="Claim not found.")
        
        claim.status=status
        claim.reason=f"Manual Review: {reason}"
        db.commit()
        return {"message": "Claim status updated successfully."}
    finally:
        db.close()

@app.get("/my-claims")
async def my_claims(email: str):
    db=SessionLocal()
    try:
        claims=db.query(ExpenseClaim).filter(ExpenseClaim.email==email).order_by(ExpenseClaim.id.desc()).all()
        return{"claims": claims}
    finally:
        db.close()

@app.post("/audit")
async def audit_expense(file: UploadFile = File(...), purpose: str = Form(...), email: str = Form(...)):
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
        "rules_violated": string, # List of rules that were violated
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
            reason=auditData['reason'],
            email=email
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