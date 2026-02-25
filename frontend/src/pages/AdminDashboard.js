import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  adminDashboard, getAllUsers, createUser, deleteUser,
  getAllBanks, addBank, deleteBank, getAllAccountsAdmin,
  deleteAccount, getAllTransactionsAdmin
} from '../services/api';

const S = {
  app: { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#f0f2f5' },
  sidebar: { width: '260px', background: 'linear-gradient(180deg, #1a1a2e, #0f3460)', color: '#fff', display: 'flex', flexDirection: 'column', padding: '0' },
  sideHeader: { padding: '28px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  logo: { fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' },
  role: { fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' },
  nav: { padding: '16px 0', flex: 1 },
  navItem: (active) => ({
    padding: '14px 24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    fontWeight: active ? 600 : 400,
    background: active ? 'rgba(233,69,96,0.2)' : 'transparent',
    borderLeft: active ? '3px solid #e94560' : '3px solid transparent',
    color: active ? '#fff' : 'rgba(255,255,255,0.6)',
    transition: 'all 0.2s',
  }),
  main: { flex: 1, overflow: 'auto' },
  topbar: { background: '#fff', padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  content: { padding: '28px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '28px' },
  statCard: (color) => ({ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}` }),
  statValue: { fontSize: '28px', fontWeight: 700, color: '#1a1a2e' },
  statLabel: { fontSize: '13px', color: '#888', marginTop: '4px' },
  card: { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '24px' },
  cardTitle: { fontSize: '18px', fontWeight: 600, color: '#1a1a2e', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', background: '#f8f9fa', fontSize: '13px', fontWeight: 600, color: '#555', borderBottom: '2px solid #e9ecef' },
  td: { padding: '12px 16px', borderBottom: '1px solid #f0f2f5', fontSize: '14px', color: '#333' },
  btn: (color) => ({ background: color || '#e94560', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }),
  input: { border: '1px solid #ddd', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  badge: (type) => ({
    padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
    background: type === 'DEPOSIT' ? '#d4edda' : '#f8d7da',
    color: type === 'DEPOSIT' ? '#155724' : '#721c24',
  }),
  logoutBtn: { background: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', fontWeight: 600 },
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '', email: '', role: 'CLIENT' });
  const [newBank, setNewBank] = useState({ bankName: '', address: '', pincode: '', ifscCode: '' });
  const [msg, setMsg] = useState('');

  const handleLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    if (tab === 'dashboard') adminDashboard().then(r => setStats(r.data)).catch(() => {});
    if (tab === 'users') getAllUsers().then(r => setUsers(r.data)).catch(() => {});
    if (tab === 'banks') getAllBanks().then(r => setBanks(r.data)).catch(() => {});
    if (tab === 'accounts') getAllAccountsAdmin().then(r => setAccounts(r.data)).catch(() => {});
    if (tab === 'transactions') getAllTransactionsAdmin().then(r => setTransactions(r.data)).catch(() => {});
  }, [tab]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser(newUser);
      setMsg('User created!');
      getAllUsers().then(r => setUsers(r.data));
      setNewUser({ username: '', password: '', name: '', email: '', role: 'CLIENT' });
    } catch (err) { setMsg(err.response?.data || 'Error'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await deleteUser(id);
    setUsers(users.filter(u => u.id !== id));
  };

  const handleAddBank = async (e) => {
    e.preventDefault();
    try {
      const r = await addBank(newBank);
      setBanks([...banks, r.data]);
      setNewBank({ bankName: '', address: '', pincode: '', ifscCode: '' });
      setMsg('Bank added!');
    } catch (err) { setMsg('Error adding bank'); }
  };

  const handleDeleteBank = async (id) => {
    if (!window.confirm('Delete this bank?')) return;
    await deleteBank(id);
    setBanks(banks.filter(b => b.id !== id));
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm('Deactivate this account?')) return;
    await deleteAccount(id);
    setAccounts(accounts.map(a => a.id === id ? {...a, isActive: false} : a));
  };

  const navItems = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'users', icon: '👥', label: 'Users' },
    { key: 'banks', icon: '🏦', label: 'Banks' },
    { key: 'accounts', icon: '💳', label: 'Accounts' },
    { key: 'transactions', icon: '💸', label: 'Transactions' },
  ];

  return (
    <div style={S.app}>
      <div style={S.sidebar}>
        <div style={S.sideHeader}>
          <div style={S.logo}>🏦 BankAdmin</div>
          <div style={S.role}>Administrator</div>
        </div>
        <nav style={S.nav}>
          {navItems.map(item => (
            <div key={item.key} style={S.navItem(tab === item.key)} onClick={() => { setTab(item.key); setMsg(''); }}>
              <span>{item.icon}</span> {item.label}
            </div>
          ))}
        </nav>
      </div>
      <div style={S.main}>
        <div style={S.topbar}>
          <h2 style={{ margin: 0, color: '#1a1a2e', fontSize: '20px' }}>
            {navItems.find(n => n.key === tab)?.label}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#555', fontWeight: 500 }}>👤 {user?.name}</span>
            <button style={S.logoutBtn} onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <div style={S.content}>
          {msg && <div style={{ background: '#d4edda', color: '#155724', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{msg}</div>}

          {tab === 'dashboard' && (
            <div style={S.statsGrid}>
              <div style={S.statCard('#0f3460')}><div style={S.statValue}>{stats.totalUsers || 0}</div><div style={S.statLabel}>Total Users</div></div>
              <div style={S.statCard('#e94560')}><div style={S.statValue}>{stats.totalAccounts || 0}</div><div style={S.statLabel}>Total Accounts</div></div>
              <div style={S.statCard('#53d8fb')}><div style={S.statValue}>{stats.totalTransactions || 0}</div><div style={S.statLabel}>Transactions</div></div>
              <div style={S.statCard('#28a745')}><div style={S.statValue}>₹{Number(stats.totalBalance || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div><div style={S.statLabel}>Total Balance</div></div>
            </div>
          )}

          {tab === 'users' && (
            <div>
              <div style={S.card}>
                <div style={S.cardTitle}>Add New User</div>
                <form onSubmit={handleCreateUser}>
                  <div style={S.formGrid}>
                    {[['Username', 'username', 'text'], ['Password', 'password', 'password'], ['Full Name', 'name', 'text'], ['Email', 'email', 'email']].map(([label, key, type]) => (
                      <div key={key}>
                        <label style={{ fontSize: '13px', color: '#555', marginBottom: '6px', display: 'block' }}>{label}</label>
                        <input style={S.input} type={type} value={newUser[key]} onChange={e => setNewUser({...newUser, [key]: e.target.value})} required />
                      </div>
                    ))}
                    <div>
                      <label style={{ fontSize: '13px', color: '#555', marginBottom: '6px', display: 'block' }}>Role</label>
                      <select style={S.input} value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                        <option value="CLIENT">Client</option>
                        <option value="BANK_TELLER">Bank Teller</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                  </div>
                  <button style={{...S.btn(), marginTop: '16px'}} type="submit">Create User</button>
                </form>
              </div>
              <div style={S.card}>
                <div style={S.cardTitle}>All Users ({users.length})</div>
                <table style={S.table}>
                  <thead><tr>{['ID', 'Name', 'Username', 'Email', 'Role', 'Action'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>{users.map(u => (
                    <tr key={u.id}>
                      <td style={S.td}>{u.id}</td><td style={S.td}>{u.name}</td><td style={S.td}>{u.username}</td>
                      <td style={S.td}>{u.email}</td><td style={S.td}><span style={{...S.badge(u.role), background: u.role === 'ADMIN' ? '#cce5ff' : u.role === 'BANK_TELLER' ? '#fff3cd' : '#d4edda', color: '#333'}}>{u.role}</span></td>
                      <td style={S.td}><button style={S.btn('#dc3545')} onClick={() => handleDeleteUser(u.id)}>Delete</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'banks' && (
            <div>
              <div style={S.card}>
                <div style={S.cardTitle}>Add Bank</div>
                <form onSubmit={handleAddBank}>
                  <div style={S.formGrid}>
                    {[['Bank Name', 'bankName'], ['Address', 'address'], ['Pincode', 'pincode'], ['IFSC Code', 'ifscCode']].map(([label, key]) => (
                      <div key={key}>
                        <label style={{ fontSize: '13px', color: '#555', marginBottom: '6px', display: 'block' }}>{label}</label>
                        <input style={S.input} value={newBank[key]} onChange={e => setNewBank({...newBank, [key]: e.target.value})} required />
                      </div>
                    ))}
                  </div>
                  <button style={{...S.btn(), marginTop: '16px'}} type="submit">Add Bank</button>
                </form>
              </div>
              <div style={S.card}>
                <div style={S.cardTitle}>All Banks</div>
                <table style={S.table}>
                  <thead><tr>{['ID', 'Bank Name', 'Address', 'Pincode', 'IFSC', 'Action'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>{banks.map(b => (
                    <tr key={b.id}>
                      <td style={S.td}>{b.id}</td><td style={S.td}>{b.bankName}</td><td style={S.td}>{b.address}</td>
                      <td style={S.td}>{b.pincode}</td><td style={S.td}>{b.ifscCode}</td>
                      <td style={S.td}><button style={S.btn('#dc3545')} onClick={() => handleDeleteBank(b.id)}>Delete</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'accounts' && (
            <div style={S.card}>
              <div style={S.cardTitle}>All Accounts ({accounts.length})</div>
              <table style={S.table}>
                <thead><tr>{['Acc No.', 'Name', 'Type', 'Balance', 'Status', 'Action'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>{accounts.map(a => (
                  <tr key={a.id}>
                    <td style={S.td}>{a.accountNumber}</td><td style={S.td}>{a.name}</td>
                    <td style={S.td}>{a.accountType}</td>
                    <td style={S.td}>₹{Number(a.balance).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td style={S.td}><span style={{ color: a.isActive ? '#28a745' : '#dc3545', fontWeight: 600 }}>{a.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td style={S.td}>{a.isActive && <button style={S.btn('#dc3545')} onClick={() => handleDeleteAccount(a.id)}>Deactivate</button>}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {tab === 'transactions' && (
            <div style={S.card}>
              <div style={S.cardTitle}>All Transactions ({transactions.length})</div>
              <table style={S.table}>
                <thead><tr>{['ID', 'Account', 'Type', 'Amount', 'Balance After', 'Date'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>{transactions.map(t => (
                  <tr key={t.id}>
                    <td style={S.td}>{t.id}</td><td style={S.td}>{t.accountNumber}</td>
                    <td style={S.td}><span style={S.badge(t.transactionType)}>{t.transactionType}</span></td>
                    <td style={S.td}>₹{Number(t.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td style={S.td}>₹{Number(t.balanceAfter).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td style={S.td}>{new Date(t.createdAt).toLocaleString()}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
