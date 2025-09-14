# Docker: Run Full Stack

This project includes dockerized services for:
- blockchain node (Hardhat)
- blockchain API (Express)
- Python backend (Flask)
- React frontend (Vite dev server)

## Prerequisites
- Docker Desktop

## Quick Start

1) Copy the sample `.env` (already included). Optional: set `GEMINI_API_KEY` if you want the chatbot to work.

2) Start everything:

```powershell
cd "c:\Users\abhay\Documents\VS Code\Bitnbuild\Bit-N-Build"
docker compose up --build
```

Services & URLs:
- Frontend: http://localhost:3000
- Flask API: http://localhost:5000
- Blockchain API: http://localhost:3001
- Hardhat RPC: http://localhost:8545

Notes:
- The deploy step runs once at startup and updates `CONTRACT_ADDRESS` in `.env`.
- Volumes mount the repo into containers, so code changes reflect without rebuilds.
- Frontend runs in dev mode for live reload.

## Stopping
```powershell
docker compose down
```

## Troubleshooting
- If blockchain API cannot connect: ensure `blockchain-node` service is running.
- If frontend can’t reach Flask, check CORS and that ports are mapped as above.
- Chatbot requires `GEMINI_API_KEY` in `.env`; without it you’ll get an error from `/api/chatbot`.