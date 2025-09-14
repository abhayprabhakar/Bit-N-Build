# 🚀 Transparency Ledger – Institutional Money Tracking Platform

## Overview

Transparency Ledger is a full-stack, blockchain-powered platform for **transparent, auditable, and community-driven financial management** in institutions. It features hierarchical departments, immutable ledgers, anomaly detection, public feedback, multi-currency support, and a smart chatbot for instant answers.

---

## Table of Contents

1. Features
2. Project Structure
3. Setup & Installation
4. Running the Platform
5. API Overview
6. Frontend Guide
7. Backend Guide
8. Blockchain Module
9. Highlighted Hackathon Features
10. Development & Contribution
11. Default Credentials
12. License

---

## Features

- **Role-Based Access:** Admin, Department Head, Project Manager, and Public.
- **Hierarchical Departments:** Nested structure with budget allocation and tracking.
- **Immutable Ledger:** All transactions are cryptographically chained (blockchain).
- **Budget Tracking:** Real-time allocation, spending, and anomaly alerts.
- **Public Transparency:** Public can view all approved transactions.
- **Multi-Currency Support:** Toggle between INR and USD.
- **Search & Filter:** 🔎 Quickly find transactions by department/vendor.
- **Anomaly Detection:** 🪫 Alerts for budget overruns and suspicious activity.
- **Community Feedback:** 💭 Any user can leave feedback on budget items.
- **Chatbot Helper:** 🤖 Ask questions like “Where did the sports budget go?” and get instant answers.
- **API-First:** RESTful APIs for all operations.
- **Secure:** JWT authentication, hashed passwords, and input validation.

---

## Project Structure

```
Bit-N-Build/
├── .env
├── backend/                # Python Flask backend (API, DB, Auth)
│   ├── app.py
│   ├── models.py
│   ├── local_auth.py
│   ├── ...
│   └── API_Documentation.md
├── frontend/               # React frontend (UI, logic)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── assets/
│   │   │   ├── components/
│   │   │   │   ├── AdminDashboard.js
│   │   │   │   ├── PublicTransactions.js
│   │   │   │   └── ...
│   │   │   └── contexts/
│   │   │       └── LocalAuthContext.js
│   │   └── ...
│   ├── public/
│   └── README.md
├── blockchain-backend/     # Node.js/Hardhat blockchain module
│   ├── api/
│   │   └── server.js
│   ├── contracts/
│   ├── scripts/
│   ├── test/
│   └── BLOCKCHAIN_GUIDE.md
├── API_DOCUMENTATION.md    # Unified API docs
├── FRONTEND_API_GUIDE.md   # Frontend integration guide
└── Transparency_Ledger_API.postman_collection.json
```

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/bit-n-build.git
cd bit-n-build
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in required values (see BLOCKCHAIN_GUIDE.md for blockchain config).

### 3. Install Dependencies

#### Backend (Python)
```bash
cd backend
pip install -r requirements.txt
```

#### Frontend (React)
```bash
cd ../frontend
npm install
```

#### Blockchain Backend (Node.js)
```bash
cd ../blockchain-backend
npm run setup
```

---

## Running the Platform

**You need 3 terminals for full functionality:**

### 1. Blockchain Backend

```bash
cd blockchain-backend
npm run blockchain   # Terminal 1: Start local blockchain
npm run deploy      # Terminal 2: Deploy contracts (first time only)
npm run dev         # Terminal 3: Start blockchain API server
```

### 2. Backend API

```bash
cd backend
python app.py
```

### 3. Frontend

```bash
cd frontend
npm run dev
```

---

## API Overview

- **Base URL:** `http://localhost:5000`
- **Authentication:** JWT Bearer Token
- **API Docs:** See API_DOCUMENTATION.md and API_Documentation.md
- **Postman Collection:** Transparency_Ledger_API.postman_collection.json

### Key Endpoints

- `/api/login` – User login
- `/api/register` – User registration
- `/api/departments` – CRUD for departments
- `/api/transactions` – Create/view transactions
- `/api/public/transactions` – Public ledger
- `/api/ledger/verify` – Verify blockchain integrity
- `/api/chatbot` – 🤖 Chatbot Q&A

---

## Frontend Guide

- Built with **React** and **Material UI**.
- All API calls use JWT from `localStorage`.
- **AdminDashboard.js**: Main dashboard for admins and departments.
- **PublicTransactions.js**: Public view of all approved transactions.
- **LocalAuthContext.js**: Handles authentication and user context.

### Notable UI Features

- **Search & Filter:** 🔎 Instantly filter transactions by department, vendor, or purpose.
- **Multi-Currency:** 💲 Toggle between INR and USD.
- **Feedback Button:** 💭 Leave feedback on any transaction.
- **Chatbot:** 🤖 Ask natural language questions about budgets and spending.

---

## Backend Guide

- Built with **Flask** (Python).
- **models.py**: SQLAlchemy models for users, departments, transactions.
- **local_auth.py**: JWT authentication and user management.
- **app.py**: Main API routes and business logic.
- **init_db.py**: Initialize database with default data.

### Key Features

- **Role-based access control** for all endpoints.
- **Immutable ledger**: All transactions are chained and auditable.
- **Anomaly detection**: 🪫 Alerts for budget overruns and suspicious activity.
- **Community feedback**: 💭 API for posting and retrieving feedback.

---

## Blockchain Module

- Located in `blockchain-backend/`
- Uses **Hardhat** for local Ethereum blockchain simulation.
- **api/server.js**: Exposes blockchain data via REST API.
- **contracts/**: Solidity smart contracts for transaction chaining.
- **scripts/**: Deployment and test scripts.

### Quick Start

See BLOCKCHAIN_GUIDE.md for full instructions.

---

## Highlighted Hackathon Features

### 🔎 Search & Filter

- **Find transactions instantly** by department, vendor, or purpose.
- **Advanced filters** for amount, date, status, and more.

### 🪫 Anomaly Challenge

- **Automatic anomaly detection** for budget overruns.
- **Real-time alerts** shown on the dashboard.

### 💭 Community Feedback Add-On

- **Feedback button** on every transaction.
- **Any user** can leave comments or suggestions on budget items.
- **Feedback is visible** to admins and department heads for transparency.

### 🤖 Chatbot Helper

- **Integrated chat interface** lets users ask questions like:
  - “Where did the sports budget go?”
  - “Show me all transactions for CSE department.”
- **Instant, AI-powered answers** using Gemini API.

### 💲 Multi-Currency Support

- **Toggle view** between INR and USD.
- **All amounts** update instantly across the dashboard.

---

## Development & Contribution

1. **Fork and clone** the repo.
2. **Set up your `.env`** as described above.
3. **Run all three stacks** (blockchain, backend, frontend).
4. **Submit pull requests** with clear descriptions.
5. **Write tests** for new features.

---

## Default Credentials

| Role           | Email                      | Password   |
|----------------|---------------------------|------------|
| Admin          | admin@transparency.com     | admin123   |


---

## License

MIT License.  
See LICENSE for details.

---

## Acknowledgements

- Built for BitNBuild GDGC Hackathon
- Powered by Flask, React, Hardhat, and Gemini

---

## Contact

For support, open an issue or contact the team.
