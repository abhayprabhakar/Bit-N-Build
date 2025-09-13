# 🌐 Transparency Ledger API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:5000`  
**Authentication:** JWT Bearer Token  
**Content-Type:** `application/json`

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Department Management](#department-management)
4. [Transaction Management](#transaction-management)
5. [Public Endpoints](#public-endpoints)
6. [Reporting](#reporting)
7. [Setup & Utilities](#setup--utilities)
8. [Error Codes](#error-codes)
9. [Request Examples](#request-examples)

---

## 🔐 Authentication

### Register User
**POST** `/api/register`

Creates a new user account in the system.

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required, unique)",
  "password": "string (required, min 6 chars)",
  "role": "string (required: Admin|DeptHead|ProjectManager)"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "user_id": "uuid",
  "message": "User registered successfully"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@company.com",
    "password": "securepass123",
    "role": "Admin"
  }'
```

---

### Login User
**POST** `/api/login`

Authenticates user and returns JWT token.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user_id": "uuid",
  "role": "Admin",
  "name": "John Doe",
  "email": "john@company.com",
  "token": "jwt_token_string",
  "message": "Login successful"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@company.com",
    "password": "securepass123"
  }'
```

---

## 👥 User Management

### Get User Profile
**GET** `/api/profile`  
**Auth Required:** JWT Token

Returns current authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "user_id": "uuid",
    "name": "John Doe",
    "email": "john@company.com",
    "role": "Admin",
    "created_at": "2025-09-13T10:30:00"
  }
}
```

---

### Get All Users
**GET** `/api/users`

Returns list of all users in the system (no authentication required for transparency).

**Response (200 OK):**
```json
[
  {
    "user_id": "uuid",
    "name": "John Doe",
    "email": "john@company.com",
    "role": "Admin",
    "created_at": "2025-09-13T10:30:00"
  }
]
```

---

## 🏢 Department Management

### Create Department
**POST** `/api/departments`  
**Auth Required:** JWT Token

Creates a new department in the system.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "parent_dept_id": "uuid (optional)",
  "head_user_id": "uuid (optional)",
  "allocated_budget": "number (optional, default: 0.00)"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "dept_id": "uuid",
  "message": "Department created successfully"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/departments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Finance Department",
    "description": "Manages financial operations",
    "allocated_budget": 1000000.00
  }'
```

---

### Get All Departments
**GET** `/api/departments`  
**Auth Required:** JWT Token

Returns list of all departments.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "departments": [
    {
      "dept_id": "uuid",
      "name": "Finance Department",
      "description": "Manages financial operations",
      "parent_dept_id": null,
      "head_user_id": "uuid",
      "allocated_budget": 1000000.00,
      "created_at": "2025-09-13T10:30:00"
    }
  ]
}
```

---

### Get Department Details
**GET** `/api/departments/<dept_id>`

Returns detailed information about a specific department.

**Response (200 OK):**
```json
{
  "success": true,
  "department": {
    "dept_id": "uuid",
    "name": "Finance Department",
    "description": "Manages financial operations",
    "parent_dept_id": null,
    "head_user_id": "uuid",
    "allocated_budget": 1000000.00,
    "created_at": "2025-09-13T10:30:00",
    "head_user": {
      "name": "John Doe",
      "email": "john@company.com"
    },
    "transaction_count": 15,
    "total_spent": 450000.00
  }
}
```

---

## 💰 Transaction Management

### Create Transaction
**POST** `/api/transactions`  
**Auth Required:** JWT Token

Creates a new transaction in the ledger.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "dept_id": "uuid (required)",
  "amount": "number (required)",
  "purpose": "string (required)",
  "status": "string (optional: Pending|Approved|Rejected|Settled, default: Pending)",
  "invoice_url": "string (optional)"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "transaction_id": 123,
  "current_hash": "sha256_hash_string",
  "previous_hash": "sha256_hash_string",
  "message": "Transaction created successfully"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "dept_id": "uuid",
    "amount": 5000.00,
    "purpose": "Office supplies procurement",
    "status": "Pending"
  }'
```

---

### Approve Transaction
**PUT** `/api/transactions/<transaction_id>/approve`  
**Auth Required:** JWT Token

Approves or rejects a transaction.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "status": "string (required: Approved|Rejected)",
  "comments": "string (optional)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "transaction_id": 123,
  "status": "Approved",
  "message": "Transaction approved successfully"
}
```

---

## 🌍 Public Endpoints

### Get Public Transactions
**GET** `/api/public/transactions`  
**Auth Required:** None

Returns all transactions for public transparency (read-only).

**Response (200 OK):**
```json
{
  "success": true,
  "transactions": [
    {
      "transaction_id": 123,
      "amount": 5000.00,
      "purpose": "Office supplies procurement",
      "department": "Finance Department",
      "status": "Approved",
      "created_at": "2025-09-13T10:30:00",
      "transaction_hash": "sha256_hash_string"
    }
  ],
  "total_count": 1
}
```

**Example:**
```bash
curl http://localhost:5000/api/public/transactions
```

---

## 📊 Reporting

### Department Budget Report
**GET** `/api/reports/department/<dept_id>/budget`

Returns budget allocation and spending report for a department.

**Response (200 OK):**
```json
{
  "success": true,
  "department": {
    "name": "Finance Department",
    "allocated_budget": 1000000.00,
    "total_spent": 450000.00,
    "remaining_budget": 550000.00,
    "utilization_percentage": 45.0
  },
  "transactions": [
    {
      "transaction_id": 123,
      "amount": 5000.00,
      "purpose": "Office supplies",
      "status": "Approved",
      "created_at": "2025-09-13T10:30:00"
    }
  ]
}
```

---

## 🔍 Ledger Verification

### Get Full Ledger
**GET** `/api/ledger`

Returns the complete transaction ledger with hash chain.

**Response (200 OK):**
```json
{
  "success": true,
  "ledger": [
    {
      "transaction_id": 123,
      "amount": 5000.00,
      "purpose": "Office supplies",
      "department": "Finance Department",
      "created_at": "2025-09-13T10:30:00",
      "current_hash": "sha256_hash",
      "previous_hash": "sha256_hash",
      "creator": "John Doe"
    }
  ],
  "total_transactions": 1
}
```

---

### Verify Ledger Integrity
**GET** `/api/ledger/verify`

Verifies the cryptographic integrity of the entire transaction chain.

**Response (200 OK):**
```json
{
  "success": true,
  "integrity_status": "VALID",
  "total_transactions": 100,
  "verified_transactions": 100,
  "broken_chains": [],
  "verification_time": "2025-09-13T10:30:00",
  "message": "Ledger integrity verified successfully"
}
```

**Response (200 OK - Integrity Issues):**
```json
{
  "success": false,
  "integrity_status": "COMPROMISED",
  "total_transactions": 100,
  "verified_transactions": 95,
  "broken_chains": [
    {
      "transaction_id": 45,
      "expected_hash": "abc123...",
      "actual_hash": "def456...",
      "error": "Hash mismatch detected"
    }
  ],
  "verification_time": "2025-09-13T10:30:00",
  "message": "Ledger integrity compromised"
}
```

---

## 🛠️ Setup & Utilities

### Create Sample Data
**POST** `/api/setup/sample-data`

Creates sample departments and transactions for testing purposes.

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Sample data created successfully",
  "transactions_created": 6,
  "departments_created": 2
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/setup/sample-data
```

---

## ⚠️ Error Codes

### HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required or invalid |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Internal Server Error | Server error |

### Error Response Format

```json
{
  "success": false,
  "message": "Descriptive error message",
  "error_code": "SPECIFIC_ERROR_CODE (optional)",
  "details": "Additional error details (optional)"
}
```

### Common Error Messages

| Error | Description | Solution |
|-------|-------------|----------|
| `Invalid credentials` | Login failed | Check email/password |
| `Token expired` | JWT token expired | Login again |
| `Department not found` | Invalid dept_id | Use valid department ID |
| `Insufficient permissions` | Role-based access denied | Use admin account |
| `Email already exists` | Registration conflict | Use different email |

---

## 📝 Request Examples

### PowerShell Examples

```powershell
# Login and store token
$login = Invoke-RestMethod -Uri "http://localhost:5000/api/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@company.com","password":"password123"}'
$token = $login.token
$headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}

# Create department
$deptBody = @{name="IT Department"; description="Technology operations"; allocated_budget=500000} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/departments" -Method POST -Headers $headers -Body $deptBody

# Create transaction
$transBody = @{dept_id="uuid"; amount=1500.00; purpose="Software licenses"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/transactions" -Method POST -Headers $headers -Body $transBody

# Get public transactions
Invoke-RestMethod -Uri "http://localhost:5000/api/public/transactions" -Method GET
```

### JavaScript/Fetch Examples

```javascript
// Login
const loginResponse = await fetch('http://localhost:5000/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@company.com',
    password: 'password123'
  })
});
const loginData = await loginResponse.json();
const token = loginData.token;

// Create transaction
const transactionResponse = await fetch('http://localhost:5000/api/transactions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    dept_id: 'uuid',
    amount: 2500.00,
    purpose: 'Equipment purchase'
  })
});

// Get public data
const publicData = await fetch('http://localhost:5000/api/public/transactions').then(r => r.json());
```

---

## 🔑 Authentication Flow

1. **Register** a user account (`POST /api/register`)
2. **Login** to get JWT token (`POST /api/login`)
3. **Include token** in all protected requests:
   ```
   Authorization: Bearer <your_jwt_token>
   ```
4. **Token expires** after 24 hours - login again to refresh

---

## 🏗️ Development Notes

- **Base URL:** Change `localhost:5000` to your production domain
- **CORS:** Enabled for cross-origin requests
- **Database:** SQLite for development, easily switchable to PostgreSQL
- **Security:** Passwords hashed with werkzeug, JWT tokens for stateless auth
- **Transparency:** All transactions publicly viewable for accountability
- **Integrity:** Cryptographic hash chaining prevents tampering

---

**Last Updated:** September 13, 2025  
**API Version:** 1.0.0  
**Contact:** For support, create an issue in the repository.
