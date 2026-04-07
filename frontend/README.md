AI Expense Auditor
● The Problem
Manual auditing of employee expense reports is a slow, error-prone process that often leads to reimbursement delays and policy violations. Organizations struggle to verify receipt authenticity and compliance with company spending rules at scale.

● The Solution
The AI Expense Auditor automates the verification process by using Computer Vision and LLMs to "read" receipts. It instantly extracts merchant data, amounts, and dates, then flags suspicious or non-compliant expenses for human review, allowing auditors to approve or reject claims with a single click.

● Tech Stack
Programming Languages: Python (Backend), JavaScript (Frontend)
Frameworks: FastAPI, React.js (Vite)
Styling: Tailwind CSS v4, Lucide React (Icons), React Hot Toast (Notifications)
Database: SQLite (via SQLAlchemy)
AI/ML: Google Gemini API (for Receipt OCR & Policy Analysis)
Utilities: Axios (API calls), React Router (Navigation)

● Setup Instructions
1. Backend Setup
# Navigate to backend folder
cd expense-auditor/backend
# Create and activate virtual environment
python -m venv venv
source venv/Scripts/activate  # On Windows
# Install dependencies
pip install fastapi uvicorn sqlalchemy google-generativeai python-multipart
# Run the server
uvicorn main:app --reload
2. Frontend Setup
# Navigate to frontend folder
cd expense-auditor/frontend
# Install dependencies
npm install
# Run the development server
npm run dev