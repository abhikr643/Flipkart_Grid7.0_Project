# 🔍 FINAL_GRID7.0_PROJECT — Autosuggest + SRP System

This project implements a **Search Suggestion System** with **Search Results Page (SRP)** functionality using:

- FastAPI for backend (autosuggest, search, history, trending)
- React for frontend
- SymSpell, fuzzy matching, and semantic ranking

---

## 📁 Project Structure

```
FINAL_GRID7.0_PROJECT/
│
├── app/               # FastAPI backend source code (main.py, logic)
├── data/              # Input files (products.json, queries.json)
├── frontend/          # React frontend code
├── venv/              # Python virtual environment (auto-created)
├── requirements.txt   # Python dependencies
└── README.md          # Project documentation
```

---

## 🚀 Backend Setup (FastAPI + Uvicorn)

### 1️⃣ Create and Activate Virtual Environment

Open a terminal in the project root:

```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

---

### 2️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

Your `requirements.txt` should include:

```txt
fastapi
uvicorn
symspellpy
rapidfuzz
sentence-transformers
scikit-learn
torch
```

---

### 3️⃣ Run the Backend Server

```bash
uvicorn app.main:app --reload
```

The API will be live at:  
[http://127.0.0.1:8000](http://127.0.0.1:8000)

Test endpoints in Swagger UI:  
[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🎨 Frontend Setup (React)

### 1️⃣ Navigate to the Frontend Directory

```bash
cd frontend
```

### 2️⃣ Install Node Modules

Make sure you have Node.js and npm installed:

```bash
npm install
```

### 3️⃣ Start the Dev Server

```bash
npm start
```

This runs the frontend on:  
[http://localhost:3000](http://localhost:3000)

---

## 🔄 Enable CORS (If Not Already)

In `app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔁 Quick Run Summary

```bash
# Backend
cd FINAL_GRID7.0_PROJECT
.\venv\Scripts\Activate.ps1 # or source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm start
```

---

## 📦 Frontend Build (Production)

```bash
npm run build
```

Outputs to: `frontend/build/`

---

## 📌 Notes

- All query and product data should be placed in the `data/` folder.
- On first run, backend may build trie/symspell from `queries.json`.
- Make sure FastAPI runs on port `8000`, and React on `3000` (adjust CORS accordingly).
- Avoid pushing `venv/` and `.env` files to version control.

---

## 📬 Contact

For questions, issues, or suggestions, please raise an issue on the repository or contact the maintainer.