# The Transparency Ledger - API Documentation

## Overview
The Transparency Ledger Backend provides a comprehensive REST API for managing institutional finances with hierarchical departments and immutable transaction ledgers. All responses are in JSON format.

**Base URL:** `http://127.0.0.1:5000`

---

## Authentication Endpoints

### 1. User Registration
**POST** `/api/register`

Register a new user in the system.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securepassword123",
  "role": "DeptHead"
}
```

**Roles Available:**
- `Admin` - Full system access
- `DeptHead` - Department management
- `ProjectManager` - Limited project access

**Success Response (201):**
```json
{
  "success": true,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "User registered successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

### 2. User Login
**POST** `/api/login`

Authenticate a user and get their details.

**Request Body:**
```json
{
  "email": "admin@transparency.com",
  "password": "admin123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "role": "Admin",
  "name": "System Administrator",
  "message": "Login successful"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

## Department Management Endpoints

### 3. Create Department
**POST** `/api/departments`

Create a new department in the organizational hierarchy.

**Request Body:**
```json
{
  "name": "IT Department",
  "description": "Information Technology services and support",
  "parent_dept_id": "550e8400-e29b-41d4-a716-446655440000",
  "head_user_id": "660e8400-e29b-41d4-a716-446655440001",
  "allocated_budget": 100000.00
}
```

**Fields:**
- `name` (required): Department name
- `description` (optional): Department description
- `parent_dept_id` (optional): Parent department ID for hierarchy
- `head_user_id` (required): User ID of department head
- `allocated_budget` (optional): Budget allocated to department

**Success Response (201):**
```json
{
  "success": true,
  "dept_id": "770e8400-e29b-41d4-a716-446655440002",
  "message": "Department created successfully"
}
```

### 4. Get All Departments
**GET** `/api/departments`

Retrieve all departments in the system.

**Success Response (200):**
```json
[
  {
    "dept_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Engineering Department",
    "description": "Handles all engineering projects",
    "parent_dept_id": null,
    "head_user_id": "660e8400-e29b-41d4-a716-446655440001",
    "head_user_name": "John Smith",
    "allocated_budget": 1000000.00,
    "created_at": "2025-09-13T10:30:00.000000"
  }
]
```

### 5. Get Department Details
**GET** `/api/departments/{dept_id}`

Get detailed information about a specific department including sub-departments.

**URL Parameters:**
- `dept_id`: Department UUID

**Success Response (200):**
```json
{
  "dept_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Engineering Department",
  "description": "Handles all engineering projects",
  "parent_dept_id": null,
  "head_user_id": "660e8400-e29b-41d4-a716-446655440001",
  "head_user_name": "John Smith",
  "allocated_budget": 1000000.00,
  "created_at": "2025-09-13T10:30:00.000000",
  "sub_departments": [
    {
      "dept_id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Software Development",
      "head_user_name": "Mike Davis",
      "allocated_budget": 600000.00
    }
  ]
}
```

---

## Transaction Management Endpoints

### 6. Create Transaction
**POST** `/api/transactions`

Create a new financial transaction in the immutable ledger.

**Request Body:**
```json
{
  "dept_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": -5000.00,
  "purpose": "Office supplies and equipment purchase",
  "created_by_id": "660e8400-e29b-41d4-a716-446655440001",
  "status": "Pending",
  "invoice_url": "https://example.com/invoice123.pdf"
}
```

**Fields:**
- `dept_id` (required): Department making the transaction
- `amount` (required): Transaction amount (negative for expenses, positive for income)
- `purpose` (required): Description of transaction purpose
- `created_by_id` (required): User creating the transaction
- `status` (optional): Transaction status (defaults to "Pending")
- `invoice_url` (optional): URL to supporting documentation

**Transaction Statuses:**
- `Pending` - Awaiting approval
- `Approved` - Approved and processed
- `Rejected` - Rejected by approver
- `Settled` - Transaction completed

**Success Response (201):**
```json
{
  "success": true,
  "transaction_id": 1,
  "current_hash": "a1b2c3d4e5f6...",
  "message": "Transaction created successfully"
}
```

### 7. Approve Transaction
**PUT** `/api/transactions/{transaction_id}/approve`

Approve a pending transaction.

**URL Parameters:**
- `transaction_id`: Transaction ID (integer)

**Request Body:**
```json
{
  "approved_by_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transaction approved successfully"
}
```

---

## Public Ledger Endpoints

### 8. Get Public Ledger
**GET** `/api/ledger`

Retrieve the complete public transaction ledger.

**Success Response (200):**
```json
[
  {
    "transaction_id": 1,
    "dept_id": "550e8400-e29b-41d4-a716-446655440000",
    "dept_name": "Engineering Department",
    "amount": -5000.00,
    "purpose": "Office supplies purchase",
    "status": "Approved",
    "created_by": "John Smith",
    "approved_by": "Sarah Johnson",
    "created_at": "2025-09-13T14:30:00.000000",
    "current_hash": "a1b2c3d4e5f6..."
  }
]
```

### 9. Verify Ledger Integrity
**GET** `/api/ledger/verify`

Verify the integrity of the transaction chain using cryptographic hashes.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Ledger integrity verified",
  "is_valid": true,
  "total_transactions": 15
}
```

**Integrity Failure Response (200):**
```json
{
  "success": false,
  "message": "Chain broken at transaction 8",
  "is_valid": false
}
```

---

## Reporting Endpoints

### 10. Department Budget Report
**GET** `/api/reports/department/{dept_id}/budget`

Get comprehensive budget report for a department including sub-department spending.

**URL Parameters:**
- `dept_id`: Department UUID

**Success Response (200):**
```json
{
  "dept_id": "550e8400-e29b-41d4-a716-446655440000",
  "dept_name": "Engineering Department",
  "allocated_budget": 1000000.00,
  "total_received": 50000.00,
  "total_spent": 125000.00,
  "remaining_budget": 925000.00,
  "sub_department_spending": {
    "Software Development": 75000.00,
    "Hardware Engineering": 50000.00
  },
  "transaction_count": 12
}
```

### 11. Get All Users
**GET** `/api/users`

Retrieve all users in the system.

**Success Response (200):**
```json
[
  {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "System Administrator",
    "email": "admin@transparency.com",
    "role": "Admin",
    "created_at": "2025-09-13T09:00:00.000000"
  }
]
```

---

## Error Responses

All endpoints may return these common error responses:

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Invalid input data or missing required fields"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error description"
}
```

---

## Usage Examples

### Example 1: Complete Workflow
```bash
# 1. Login as admin
curl -X POST http://127.0.0.1:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@transparency.com","password":"admin123"}'

# 2. Create a department
curl -X POST http://127.0.0.1:5000/api/departments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Marketing Department",
    "description": "Marketing and communications",
    "head_user_id": "user-id-here",
    "allocated_budget": 200000.00
  }'

# 3. Create a transaction
curl -X POST http://127.0.0.1:5000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "dept_id": "dept-id-here",
    "amount": -15000.00,
    "purpose": "Q3 Marketing Campaign",
    "created_by_id": "user-id-here"
  }'

# 4. View public ledger
curl http://127.0.0.1:5000/api/ledger

# 5. Verify ledger integrity
curl http://127.0.0.1:5000/api/ledger/verify
```

### Example 2: Department Hierarchy
```bash
# Create parent department
curl -X POST http://127.0.0.1:5000/api/departments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Technology Division",
    "head_user_id": "head-user-id",
    "allocated_budget": 2000000.00
  }'

# Create sub-department
curl -X POST http://127.0.0.1:5000/api/departments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Research Team",
    "parent_dept_id": "parent-dept-id",
    "head_user_id": "team-lead-id",
    "allocated_budget": 500000.00
  }'
```

---

## Security Features

### Transaction Chaining
Each transaction is cryptographically linked to the previous one using SHA-256 hashing:
1. Transaction data is serialized
2. Combined with previous transaction hash
3. SHA-256 hash computed and stored
4. Creates tamper-evident audit trail

### Data Integrity
- All transactions are immutable once created
- Hash chain verification detects any tampering
- Complete audit trail from genesis to current state

### Input Validation
- All inputs are sanitized to prevent XSS
- Database constraints prevent invalid data
- Role-based access control for sensitive operations

---

## Rate Limiting
Currently no rate limiting is implemented. In production, consider implementing:
- Request rate limiting per IP
- Authentication rate limiting
- API key management for external access

---

## Default Test Credentials

For testing and development:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@transparency.com | admin123 |
| Dept Head | engineering@transparency.com | password123 |
| Dept Head | finance@transparency.com | password123 |
| Project Manager | pm@transparency.com | password123 |
