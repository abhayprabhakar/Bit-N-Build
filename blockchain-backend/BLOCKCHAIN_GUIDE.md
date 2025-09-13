# Blockchain - Guide To Integrate

## Project Structure
```
Bit-N-Build/
├── .env                    # Shared environment variables
├── backend/               # Python backend (existing)
├── frontend/              # React frontend (existing)
└── blockchain-backend/    # Blockchain module
```

## Quick Setup

### One-time Setup
1. Copy `.env.example` to `.env` in root directory
2. Navigate to blockchain folder: `cd blockchain-backend`
3. Install dependencies: `npm run setup`

### Daily Development (Blockchain Team)
**Run these 3 terminals in `blockchain-backend/` folder:**

```bash
RUN IN ORDER I REPEAT RUN IN ORDER

# Terminal 1 - Blockchain
npm run blockchain

# Terminal 2 - Deploy (first time only)
npm run deploy

# Terminal 3 - API Server  
npm run dev
```

**Test everything works:** Then come back to terminal 2 or a new terminal to run the `npm run test-api`

## API Endpoints for Frontend

**Base URL:** `http://localhost:3001/api`

### Get All Transactions
```javascript
fetch('http://localhost:3001/api/transactions')
  .then(res => res.json())
  .then(data => console.log(data.transactions));
```

### Add New Transaction
```javascript
fetch('http://localhost:3001/api/transactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fromDept: "Finance Department",
    toDept: "Engineering Department",
    amount: "1000000",
    purpose: "Lab Equipment Purchase"
  })
});
```

### Health Check
```javascript
fetch('http://localhost:3001/api/health')
```

## For Frontend Developers

### React Integration Example
```javascript
import React, { useState, useEffect } from 'react';

function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:3001/api/transactions')
      .then(res => res.json())
      .then(data => setTransactions(data.transactions));
  }, []);

  const addTransaction = async (formData) => {
    await fetch('http://localhost:3001/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    // Refresh list
    window.location.reload();
  };

  return (
    <div>
      {transactions.map(tx => (
        <div key={tx.id}>
          {tx.fromDept} → {tx.toDept}: ₹{tx.amount}
        </div>
      ))}
    </div>
  );
}
```

## Troubleshooting

- **"API not working"** → Restart 3 terminals
- **"Cannot find module"** → Run `npm install --legacy-peer-deps` in `blockchain-backend/`
- **Contract address changes** → Restart all 3 terminals, run `npm run deploy`

## 📝 What You Need to Know

- **Frontend:** Treat it like any REST API - no blockchain knowledge needed
- **Blockchain:** Keep 3 terminals running during development
- **All data is permanent** - transactions cannot be deleted/modified
- **API returns standard JSON** - easy to integrate with any frontend
