# The Transparency Ledger - Backend

A Flask-based backend for tracking institutional finances with hierarchical departments and immutable transaction ledgers.

## Features

- **User Management**: Role-based access control (Admin, Department Head, Project Manager)
- **Hierarchical Departments**: Nested department structure with budget allocation
- **Immutable Ledger**: SHA-256 chained transactions for tamper-evident audit trails
- **Public Transparency**: APIs for public access to financial data
- **Budget Tracking**: Real-time budget allocation and spending tracking

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Initialize Database

```bash
python init_db.py
```

This will create:
- SQLite database with all tables
- Default admin user
- Sample departments and users

### 3. Run the Server

```bash
python app.py
```

The server will start on `http://127.0.0.1:5000`

## Default Login Credentials

- **Admin**: `admin@transparency.com` / `admin123`
- **Dept Head 1**: `engineering@transparency.com` / `password123`
- **Dept Head 2**: `finance@transparency.com` / `password123`
- **Project Manager**: `pm@transparency.com` / `password123`

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Department Management
- `POST /api/departments` - Create new department
- `GET /api/departments` - List all departments
- `GET /api/departments/<dept_id>` - Get department details

### Transaction Management
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/<id>/approve` - Approve transaction

### Public Ledger
- `GET /api/ledger` - Get public transaction ledger
- `GET /api/ledger/verify` - Verify ledger integrity

### Reporting
- `GET /api/reports/department/<dept_id>/budget` - Department budget report
- `GET /api/users` - List all users

## Database Schema

The backend uses SQLite (easily switchable to PostgreSQL) with three main tables:

1. **Users** - System users with roles
2. **Departments** - Hierarchical department structure
3. **Transactions** - Immutable transaction ledger with SHA-256 chaining

## Security Features

- Password hashing with bcrypt
- Cryptographic transaction chaining
- Input sanitization
- CORS enabled for frontend integration

## File Structure

```
backend/
├── app.py              # Main Flask application
├── models.py           # Database models
├── utils.py            # Utility functions
├── init_db.py          # Database initialization
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

## Transaction Hash Chain

Each transaction is cryptographically linked to the previous one using SHA-256 hashing:

1. Transaction data is serialized
2. Combined with previous transaction hash
3. SHA-256 hash computed
4. Stored as current_hash

This creates an immutable audit trail where any tampering breaks the chain.

## API Usage Examples

### Create Department
```bash
curl -X POST http://127.0.0.1:5000/api/departments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "IT Department",
    "description": "Information Technology services",
    "head_user_id": "user-id-here",
    "allocated_budget": 100000.00
  }'
```

### Create Transaction
```bash
curl -X POST http://127.0.0.1:5000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "dept_id": "dept-id-here",
    "amount": -5000.00,
    "purpose": "Software licenses",
    "created_by_id": "user-id-here"
  }'
```

### Verify Ledger Integrity
```bash
curl http://127.0.0.1:5000/api/ledger/verify
```

This will return whether the transaction chain is intact and valid.
