import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(form);
      loginUser(res.data);
      const role = res.data.role;
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'BANK_TELLER') navigate('/teller');
      else navigate('/client');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>🏦</div>
          <h1 style={styles.title}>BankSystem</h1>
          <p style={styles.subtitle}>Secure Banking Portal</p>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              type="text"
              value={form.username}
              onChange={e => setForm({...form, username: e.target.value})}
              placeholder="Enter username"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              placeholder="Enter password"
              required
            />
          </div>
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '48px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
  },
  header: { textAlign: 'center', marginBottom: '32px' },
  logo: { fontSize: '48px', marginBottom: '12px' },
  title: { color: '#fff', fontSize: '28px', margin: 0, fontWeight: 700 },
  subtitle: { color: 'rgba(255,255,255,0.5)', marginTop: '6px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: 500 },
  input: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '10px',
    padding: '14px 16px',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
  },
  btn: {
    background: 'linear-gradient(135deg, #e94560, #0f3460)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '15px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '8px',
  },
  error: {
    background: 'rgba(233, 69, 96, 0.2)',
    border: '1px solid rgba(233, 69, 96, 0.5)',
    color: '#ff6b6b',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'center',
  },
};
