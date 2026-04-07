# 🛡️ AI Expense Auditor

A smart, full-stack solution designed to automate financial auditing and receipt verification using Generative AI.

---

## 🔴 The Problem
Manual auditing of employee expense reports is a **slow and error-prone process**. It frequently leads to reimbursement delays and accidental policy violations. Organizations struggle to verify receipt authenticity and enforce spending rules at scale, often relying on manual data entry which is susceptible to human error.

## 🟢 The Solution
The **AI Expense Auditor** provides an end-to-end automated verification workflow:
* **Smart OCR:** Uses Google Gemini AI to "read" and extract data from uploaded receipts (Merchant, Amount, Date).
* **Policy Compliance:** Automatically flags suspicious or non-compliant expenses based on company rules.
* **Admin Control:** A dedicated dashboard for auditors to manually approve or reject flagged claims with custom feedback notes.
* **Employee History:** A persistent tracking system for employees to monitor the status of their past submissions.

---

## 💻 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React.js (Vite), Tailwind CSS v4 |
| **Backend** | FastAPI (Python) |
| **Database** | SQLite via SQLAlchemy ORM |
| **AI Model** | Google Gemini API |
| **UI Components** | Lucide React (Icons), React Hot Toast |
| **Networking** | Axios, React Router |

---

## 🚀 Setup Instructions

### 1. Backend Setup
Navigate to the backend directory and set up your virtual environment:

```bash
# Navigate to folder
cd backend

# Create and activate virtual environment
python -m venv venv

# Activate on Windows:
venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy google-generativeai python-multipart

# Start the FastAPI server
uvicorn main:app --reload
```

### 2. Frontend Setup
Navigate to the frontend directory and set up your React interface:

```bash
# Navigate to folder
cd frontend

# Install dependencies
npm install

# Start the FastAPI server
npm run dev
```