import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);

// Admin
export const adminDashboard = () => api.get('/admin/dashboard');
export const getAllUsers = () => api.get('/admin/users');
export const createUser = (data) => api.post('/admin/users', data);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getAllBanks = () => api.get('/admin/banks');
export const addBank = (data) => api.post('/admin/banks', data);
export const updateBank = (id, data) => api.put(`/admin/banks/${id}`, data);
export const deleteBank = (id) => api.delete(`/admin/banks/${id}`);
export const getAllAccountsAdmin = () => api.get('/admin/accounts');
export const deleteAccount = (id) => api.delete(`/admin/accounts/${id}`);
export const getAllTransactionsAdmin = () => api.get('/admin/transactions');

// Teller
export const createAccount = (data) => api.post('/teller/accounts', data);
export const getAllAccountsTeller = () => api.get('/teller/accounts');
export const deposit = (data) => api.post('/teller/deposit', data);
export const withdrawTeller = (data) => api.post('/teller/withdraw', data);
export const getTransactionsTeller = (accountNumber) => api.get(`/teller/accounts/${accountNumber}/transactions`);
export const getBalanceTeller = (accountNumber) => api.get(`/teller/accounts/${accountNumber}/balance`);

// Client
export const getMyAccounts = () => api.get('/client/accounts');
export const getBalance = (accountNumber) => api.get(`/client/accounts/${accountNumber}/balance`);
export const getTransactions = (accountNumber) => api.get(`/client/accounts/${accountNumber}/transactions`);
export const setPin = (data) => api.post('/client/accounts/pin', data);
export const withdrawClient = (data) => api.post('/client/withdraw', data);

export default api;
