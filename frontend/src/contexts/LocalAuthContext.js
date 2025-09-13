import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on app start
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user_data');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    
    setLoading(false);
  }, []);

  const signup = async (email, password, name) => {
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const signin = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (data.success) {
        const userData = {
          user_id: data.user_id,
          name: data.name,
          email: data.email,
          role: data.role
        };
        
        setToken(data.token);
        setCurrentUser(userData);
        
        // Store in localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        return { success: true, user: userData };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      setCurrentUser(null);
      setToken(null);
      
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const makeAuthenticatedRequest = async (url, method = 'GET', body = null) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const config = {
        method,
        headers,
      };

      if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(`http://localhost:5000${url}`, config);
      const data = await response.json();

      if (response.status === 401) {
        // Token expired or invalid
        await logout();
        throw new Error('Session expired. Please login again.');
      }

      return data;
    } catch (error) {
      console.error('Request error:', error);
      throw error;
    }
  };

  const addDepartment = async (name, password, confirmPassword) => {
    return await makeAuthenticatedRequest(
      '/api/departments',
      'POST',
      { name, password, confirm_password: confirmPassword }
    );
  };
  const value = {
    currentUser,
    token,
    loading,
    signup,
    signin,
    logout,
    makeAuthenticatedRequest,
    addDepartment
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
