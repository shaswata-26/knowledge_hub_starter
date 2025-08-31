import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import api, { setToken } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch user profile
      getUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  // const login = async (email, password) => {

  //   try {
  //     const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
  //       email,
  //       password
  //     });

  //     const { token, ...userData } = response.data;
  //     localStorage.setItem('token', token);
  //     axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  //     setUser(userData);
  //     return { success: true };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.response?.data?.message || 'Login failed'
  //     };
  //   }
  // };








const login = async (email, password) => {
  try {
    // Use your api instance instead of axios directly
    const response = await api.post('/auth/login', {
      email,
      password
    });

    const { token, ...userData } = response.data;
    
    // Use your setToken function instead of manual handling
    setToken(token);
    setUser(userData);
    
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed'
    };
  }
};





  // const register = async (name, email, password, role) => {
  //   try {
  //     const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, {
  //       name,
  //       email,
  //       password,
  //       role
  //     });

  //     const { token, ...userData } = response.data;
  //     localStorage.setItem('token', token);
  //     axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  //     setUser(userData);
  //     return { success: true };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.response?.data?.message || 'Registration failed'
  //     };
  //   }
  // };



// In your AuthContext.js, update the register function
const register = async (name, email, password, role) => {
  try {
    console.log('AuthProvider register called with:', { name, email, role });
    
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      role: role || 'user'
    });

    console.log('AuthProvider registration response:', response.data);
    
    if (response.data && response.data.token) {
      const { token, ...userData } = response.data;
      setToken(token);
      setUser(userData);
      console.log('Registration successful, user set:', userData);
      return { success: true };
    } else {
      console.error('Registration failed: No token in response', response.data);
      return { 
        success: false, 
        message: response.data?.message || 'Registration failed: No token received' 
      };
    }
  } catch (error) {
    console.error('AuthProvider registration error:', error);
    console.error('Error response:', error.response);
    
    let errorMessage = 'Registration failed';
    
    if (error.response) {
      // Server responded with error status
      errorMessage = error.response.data?.message || 
                    `Server error: ${error.response.status}`;
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'No response from server. Check if backend is running.';
    } else {
      // Something else happened
      errorMessage = error.message || 'Registration failed';
    }
    
    return { success: false, message: errorMessage };
  }
};








  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const getUserProfile = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/profile`);
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to get user profile:', error);
      localStorage.removeItem('token');
      setLoading(false);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};