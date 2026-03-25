from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow React (running on port 5173) to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/audit")
async def audit_expense(
    file: UploadFile = File(...), 
    purpose: str = Form(...)
):
    # For now, we just acknowledge receipt
    return {
        "status": "Received",
        "filename": file.filename,
        "purpose_captured": purpose,
        "message": "AI Auditor is ready for Phase 2!"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)