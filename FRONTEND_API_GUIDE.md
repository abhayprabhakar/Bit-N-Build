# Frontend Developer API Guide
## Transparency Ledger System

This guide provides everything frontend developers need to integrate with the Transparency Ledger API.

## Quick Start

### Base URL
```
http://localhost:5000
```

### Authentication Flow
1. **Login** → Get JWT token
2. **Store token** in localStorage
3. **Include token** in all protected API calls

---

## 🔐 Authentication APIs

### 1. User Login
```javascript
// POST /api/login
const login = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('authToken', data.token);
    return data.user;
  }
  throw new Error(data.message);
};

// Usage
try {
  const user = await login('admin@transparency.com', 'admin123');
  console.log('Logged in:', user);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

### 2. User Registration
```javascript
// POST /api/register
const register = async (userData) => {
  const response = await fetch('http://localhost:5000/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  return await response.json();
};

// Usage
const newUser = await register({
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
  role: "ProjectManager"
});
```

### 3. Get User Profile
```javascript
// GET /api/profile
const getUserProfile = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch('http://localhost:5000/api/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

---

## 🏢 Department APIs

### 1. Get All Departments
```javascript
// GET /api/departments
const getDepartments = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch('http://localhost:5000/api/departments', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.departments; // Array of departments
};

// Usage for dropdown/select
const departments = await getDepartments();
// departments = [
//   { id: 1, name: "Finance", allocated_budget: 1000000 },
//   { id: 2, name: "IT", allocated_budget: 500000 }
// ]
```

### 2. Create Department
```javascript
// POST /api/departments
const createDepartment = async (deptData) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch('http://localhost:5000/api/departments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(deptData)
  });
  
  return await response.json();
};

// Usage
const newDept = await createDepartment({
  name: "Human Resources",
  description: "Manages employee relations and recruitment",
  allocated_budget: 750000.00
});
```

### 3. Get Department Details
```javascript
// GET /api/departments/{id}
const getDepartmentDetails = async (deptId) => {
  const response = await fetch(`http://localhost:5000/api/departments/${deptId}`);
  return await response.json();
};
```

---

## 💰 Transaction APIs

### 1. Create Transaction
```javascript
// POST /api/transactions
const createTransaction = async (transactionData) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch('http://localhost:5000/api/transactions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(transactionData)
  });
  
  return await response.json();
};

// Usage
const newTransaction = await createTransaction({
  dept_id: 1,
  amount: 5000.00,
  purpose: "Office supplies procurement - From: Budget Allocation, To: Office Management",
  status: "Pending"
});
```

### 2. Approve Transaction
```javascript
// PUT /api/transactions/{id}/approve
const approveTransaction = async (transactionId, status, comments = '') => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`http://localhost:5000/api/transactions/${transactionId}/approve`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status, comments })
  });
  
  return await response.json();
};

// Usage
await approveTransaction(123, 'Approved', 'Budget approved for Q4');
```

---

## 🌐 Public APIs (No Authentication Required)

### 1. Get Public Transactions
```javascript
// GET /api/public/transactions
const getPublicTransactions = async () => {
  const response = await fetch('http://localhost:5000/api/public/transactions');
  const data = await response.json();
  return data.transactions;
};

// Perfect for public transparency page
const publicTransactions = await getPublicTransactions();
// Returns only approved transactions with public info
```

### 2. Verify Ledger Integrity
```javascript
// GET /api/ledger/verify
const verifyLedger = async () => {
  const response = await fetch('http://localhost:5000/api/ledger/verify');
  return await response.json();
};

// Usage - show integrity status to users
const integrity = await verifyLedger();
console.log('Ledger valid:', integrity.valid);
```

---

## 🛠️ Utility Functions for Frontend

### Authentication Helper
```javascript
class AuthAPI {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  async makeAuthenticatedRequest(endpoint, options = {}) {
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const defaultHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    if (response.status === 401) {
      localStorage.removeItem('authToken');
      throw new Error('Session expired');
    }

    return await response.json();
  }

  logout() {
    localStorage.removeItem('authToken');
  }
}

// Usage
const auth = new AuthAPI();

// Make authenticated requests easily
const departments = await auth.makeAuthenticatedRequest('/api/departments');
const profile = await auth.makeAuthenticatedRequest('/api/profile');
```

### Transaction Form Helper
```javascript
const TransactionAPI = {
  async create(formData) {
    const auth = new AuthAPI();
    return await auth.makeAuthenticatedRequest('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  },

  async approve(id, status, comments) {
    const auth = new AuthAPI();
    return await auth.makeAuthenticatedRequest(`/api/transactions/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ status, comments })
    });
  }
};
```

---

## 📊 Data Formats

### User Object
```javascript
{
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  role: "Admin", // "Admin", "DeptHead", "ProjectManager"
  created_at: "2024-01-15T10:30:00Z"
}
```

### Department Object
```javascript
{
  id: 1,
  name: "Finance Department",
  description: "Manages financial operations",
  allocated_budget: 1000000.00,
  used_budget: 250000.00,
  created_at: "2024-01-15T10:30:00Z"
}
```

### Transaction Object
```javascript
{
  id: 1,
  dept_id: 1,
  user_id: 1,
  amount: 5000.00,
  purpose: "Office supplies procurement",
  status: "Approved", // "Pending", "Approved", "Rejected"
  transaction_hash: "abc123...",
  previous_hash: "def456...",
  created_at: "2024-01-15T10:30:00Z",
  approved_at: "2024-01-15T11:00:00Z",
  approved_by: 2,
  comments: "Approved for office supplies"
}
```

---

## ⚠️ Error Handling

### Common Error Responses
```javascript
// 401 Unauthorized
{
  "success": false,
  "message": "Invalid or expired token"
}

// 400 Bad Request
{
  "success": false,
  "message": "Missing required field: dept_id"
}

// 403 Forbidden
{
  "success": false,
  "message": "Insufficient permissions"
}

// 404 Not Found
{
  "success": false,
  "message": "Department not found"
}
```

### Error Handling Pattern
```javascript
const handleAPICall = async (apiFunction) => {
  try {
    const result = await apiFunction();
    return { success: true, data: result };
  } catch (error) {
    console.error('API Error:', error);
    return { 
      success: false, 
      error: error.message || 'An error occurred' 
    };
  }
};

// Usage
const { success, data, error } = await handleAPICall(() => 
  createTransaction(formData)
);

if (success) {
  console.log('Transaction created:', data);
} else {
  alert('Error: ' + error);
}
```

---

## 🚀 React Integration Examples

### Custom Hook for Departments
```javascript
import { useState, useEffect } from 'react';

export const useDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const auth = new AuthAPI();
        const result = await auth.makeAuthenticatedRequest('/api/departments');
        setDepartments(result.departments);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  return { departments, loading, error };
};
```

### Transaction Form Component
```javascript
const TransactionForm = () => {
  const { departments } = useDepartments();
  const [formData, setFormData] = useState({
    dept_id: '',
    amount: '',
    purpose: '',
    status: 'Pending'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await TransactionAPI.create(formData);
      alert('Transaction created successfully!');
      // Reset form or redirect
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select 
        value={formData.dept_id} 
        onChange={(e) => setFormData({...formData, dept_id: e.target.value})}
        required
      >
        <option value="">Select Department</option>
        {departments.map(dept => (
          <option key={dept.id} value={dept.id}>
            {dept.name} (Budget: ${dept.allocated_budget})
          </option>
        ))}
      </select>
      
      <input
        type="number"
        placeholder="Amount"
        value={formData.amount}
        onChange={(e) => setFormData({...formData, amount: e.target.value})}
        required
      />
      
      <textarea
        placeholder="Purpose"
        value={formData.purpose}
        onChange={(e) => setFormData({...formData, purpose: e.target.value})}
        required
      />
      
      <button type="submit">Create Transaction</button>
    </form>
  );
};
```

---

## 🔧 Development Setup

1. **Start Backend**: `python backend/app.py`
2. **Backend runs on**: `http://localhost:5000`
3. **Test with**: Import the Postman collection provided
4. **Default Admin**: `admin@transparency.com` / `admin123`

## 📞 Support

- All API responses include `success` boolean
- Error messages are in `message` field
- JWT tokens expire in 24 hours
- Public endpoints don't require authentication
- Protected endpoints return 401 if token is invalid/expired

This guide covers all the APIs your frontend team needs to build the transparency ledger interface!
