# TravelGenie 🌍

AI-powered travel concierge — recommends hotels & places near you using Google Places API.

## Project Structure

```
TravelGenie/
├── frontend/          # React + Vite app
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── .env           # VITE_API_URL=http://localhost:8000
│   └── .env.example
│
├── backend/           # FastAPI Python server
│   ├── main.py
│   ├── requirements.txt
│   ├── .env           # GOOGLE_PLACES_API_KEY=...
│   └── .env.example
│
└── README.md
```

---

## 🚀 Getting Started

### Backend (FastAPI)

```bash
cd backend

# 1. Create & activate virtual environment (recommended)
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set your API key
copy .env.example .env
# Edit .env and add your GOOGLE_PLACES_API_KEY

# 4. Run the server
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
API docs: http://localhost:8000/docs

---

### Frontend (React + Vite)

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Configure API URL
copy .env.example .env
# Edit .env if your backend runs on a different port/host

# 3. Run dev server
npm run dev
```

Frontend runs at: http://localhost:5173

---

## 🌐 Deployment

### Frontend → Vercel / Netlify
- Set `VITE_API_URL` to your deployed backend URL in the platform's environment variables
- Build command: `npm run build`
- Output directory: `dist`

### Backend → Render / Railway / Fly.io
- Set `GOOGLE_PLACES_API_KEY` as an environment secret
- Start command: `uvicorn main:app --host 0.0.0.0 --port 8000`

---

## API Endpoints

| Method | Path    | Description                                 |
|--------|---------|---------------------------------------------|
| GET    | `/`     | Health check                                |
| POST   | `/plan` | Get hotel + park recommendations (optional body: `{ lat, lng }`) |
| POST   | `/book` | Confirm a booking                           |
