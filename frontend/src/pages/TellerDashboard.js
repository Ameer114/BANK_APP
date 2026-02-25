import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  createAccount, getAllAccountsTeller, deposit, withdrawTeller,
  getTransactionsTeller, getBalanceTeller, getAllBanks, getAllUsers
} from '../services/api';

const S = {
  app: { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#f0f2f5' },
  sidebar: { width: '240px', background: 'linear-gradient(180deg, #1a237e, #283593)', color: '#fff', padding: 0, display: 'flex', flexDirection: 'column' },
  sideHeader: { padding: '28px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  logo: { fontSize: '22px', fontWeight: 700 },
  nav: { flex: 1, padding: '16px 0' },
  navItem: (active) => ({
    padding: '14px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
    fontSize: '14px', fontWeight: active ? 600 : 400,
    background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
    borderLeft: active ? '3px solid #90caf9' : '3px solid transparent',
    color: active ? '#fff' : 'rgba(255,255,255,0.65)',
  }),
  main: { flex: 1, overflow: 'auto' },
  topbar: { background: '#fff', padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  content: { padding: '28px' },
  card: { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '24px' },
  title: { fontSize: '18px', fontWeight: 600, color: '#1a237e', marginBottom: '20px' },
  input: { border: '1px solid #ddd', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', width: '100%', outline: 'none', boxSizing: 'border-box' },
  label: { fontSize: '13px', color: '#555', marginBottom: '6px', display: 'block' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  btn: (color) => ({ background: color || '#1a237e', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '16px' }),
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', background: '#f8f9fa', fontSize: '13px', fontWeight: 600, color: '#555', borderBottom: '2px solid #e9ecef' },
  td: { padding: '12px 16px', borderBottom: '1px solid #f0f2f5', fontSize: '14px' },
  msg: (ok) => ({ padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', background: ok ? '#d4edda' : '#f8d7da', color: ok ? '#155724' : '#721c24' }),
  logoutBtn: { background: '#1a237e', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', fontWeight: 600 },
};

export default function TellerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('create');
  const [accounts, setAccounts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [accForm, setAccForm] = useState({ userId: '', bankId: '', name: '', address: '', phoneNumber: '', pin: '', accountType: 'SAVINGS', initialDeposit: '' });
  const [txnForm, setTxnForm] = useState({ accountNumber: '', amount: '', description: '' });
  const [txnType, setTxnType] = useState('deposit');
  const [searchAcc, setSearchAcc] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(null);

  const showMsg = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: '', ok: true }), 3000); };

  useEffect(() => {
    getAllBanks().then(r => setBanks(r.data)).catch(() => {});
    getAllUsers().then(r => setUsers(r.data)).catch(() => {});
    if (tab === 'accounts') getAllAccountsTeller().then(r => setAccounts(r.data)).catch(() => {});
  }, [tab]);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...accForm, userId: Number(accForm.userId), bankId: accForm.bankId ? Number(accForm.bankId) : null, initialDeposit: accForm.initialDeposit ? Number(accForm.initialDeposit) : null };
      const r = await createAccount(payload);
      showMsg(`Account created! Account No: ${r.data.accountNumber}`);
      setAccForm({ userId: '', bankId: '', name: '', address: '', phoneNumber: '', pin: '', accountType: 'SAVINGS', initialDeposit: '' });
    } catch (err) { showMsg(err.response?.data || 'Error creating account', false); }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    try {
      const payload = { accountNumber: txnForm.accountNumber, amount: Number(txnForm.amount), description: txnForm.description };
      if (txnType === 'deposit') await deposit(payload);
      else await withdrawTeller(payload);
      showMsg(`${txnType === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!`);
      setTxnForm({ accountNumber: '', amount: '', description: '' });
    } catch (err) { showMsg(err.response?.data || 'Transaction failed', false); }
  };

  const handleSearch = async () => {
    try {
      const [txns, bal] = await Promise.all([getTransactionsTeller(searchAcc), getBalanceTeller(searchAcc)]);
      setTransactions(txns.data);
      setBalance(bal.data);
    } catch { showMsg('Account not found', false); }
  };

  const navItems = [
    { key: 'create', icon: '➕', label: 'Create Account' },
    { key: 'transaction', icon: '💳', label: 'Transactions' },
    { key: 'accounts', icon: '📋', label: 'View Accounts' },
    { key: 'search', icon: '🔍', label: 'Account Search' },
  ];

  return (
    <div style={S.app}>
      <div style={S.sidebar}>
        <div style={S.sideHeader}>
          <div style={S.logo}>🏦 Teller Portal</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Bank Teller</div>
        </div>
        <nav style={S.nav}>
          {navItems.map(item => (
            <div key={item.key} style={S.navItem(tab === item.key)} onClick={() => { setTab(item.key); setMsg({ text: '', ok: true }); }}>
              <span>{item.icon}</span> {item.label}
            </div>
          ))}
        </nav>
      </div>
      <div style={S.main}>
        <div style={S.topbar}>
          <h2 style={{ margin: 0, color: '#1a237e', fontSize: '18px' }}>{navItems.find(n => n.key === tab)?.label}</h2>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ color: '#555' }}>👤 {user?.name}</span>
            <button style={S.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>Logout</button>
          </div>
        </div>
        <div style={S.content}>
          {msg.text && <div style={S.msg(msg.ok)}>{msg.text}</div>}

          {tab === 'create' && (
            <div style={S.card}>
              <div style={S.title}>Create New Bank Account</div>
              <form onSubmit={handleCreateAccount}>
                <div style={S.grid}>
                  <div>
                    <label style={S.label}>Select Customer</label>
                    <select style={S.input} value={accForm.userId} onChange={e => setAccForm({...accForm, userId: e.target.value})} required>
                      <option value="">-- Select User --</option>
                      {users.filter(u => u.role === 'CLIENT').map(u => <option key={u.id} value={u.id}>{u.name} ({u.username})</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Bank</label>
                    <select style={S.input} value={accForm.bankId} onChange={e => setAccForm({...accForm, bankId: e.target.value})}>
                      <option value="">-- Select Bank --</option>
                      {banks.map(b => <option key={b.id} value={b.id}>{b.bankName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Account Holder Name</label>
                    <input style={S.input} value={accForm.name} onChange={e => setAccForm({...accForm, name: e.target.value})} required />
                  </div>
                  <div>
                    <label style={S.label}>Phone Number</label>
                    <input style={S.input} value={accForm.phoneNumber} onChange={e => setAccForm({...accForm, phoneNumber: e.target.value})} />
                  </div>
                  <div>
                    <label style={S.label}>Account Type</label>
                    <select style={S.input} value={accForm.accountType} onChange={e => setAccForm({...accForm, accountType: e.target.value})}>
                      <option value="SAVINGS">Savings</option>
                      <option value="CURRENT">Current</option>
                      <option value="FIXED_DEPOSIT">Fixed Deposit</option>
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>Initial Deposit (₹)</label>
                    <input style={S.input} type="number" value={accForm.initialDeposit} onChange={e => setAccForm({...accForm, initialDeposit: e.target.value})} min="0" />
                  </div>
                  <div>
                    <label style={S.label}>Address</label>
                    <input style={S.input} value={accForm.address} onChange={e => setAccForm({...accForm, address: e.target.value})} />
                  </div>
                  <div>
                    <label style={S.label}>Set PIN (4 digits)</label>
                    <input style={S.input} type="password" maxLength="4" value={accForm.pin} onChange={e => setAccForm({...accForm, pin: e.target.value})} />
                  </div>
                </div>
                <button style={S.btn()} type="submit">Create Account</button>
              </form>
            </div>
          )}

          {tab === 'transaction' && (
            <div style={S.card}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                {['deposit', 'withdraw'].map(t => (
                  <button key={t} onClick={() => setTxnType(t)} style={{ padding: '10px 28px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px', background: txnType === t ? (t === 'deposit' ? '#28a745' : '#e94560') : '#f0f2f5', color: txnType === t ? '#fff' : '#555' }}>
                    {t === 'deposit' ? '⬇️ Deposit' : '⬆️ Withdraw'}
                  </button>
                ))}
              </div>
              <form onSubmit={handleTransaction}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
                  <div><label style={S.label}>Account Number</label><input style={S.input} value={txnForm.accountNumber} onChange={e => setTxnForm({...txnForm, accountNumber: e.target.value})} required /></div>
                  <div><label style={S.label}>Amount (₹)</label><input style={S.input} type="number" min="1" value={txnForm.amount} onChange={e => setTxnForm({...txnForm, amount: e.target.value})} required /></div>
                  <div><label style={S.label}>Description</label><input style={S.input} value={txnForm.description} onChange={e => setTxnForm({...txnForm, description: e.target.value})} /></div>
                  <button style={S.btn(txnType === 'deposit' ? '#28a745' : '#e94560')} type="submit">Process {txnType === 'deposit' ? 'Deposit' : 'Withdrawal'}</button>
                </div>
              </form>
            </div>
          )}

          {tab === 'accounts' && (
            <div style={S.card}>
              <div style={S.title}>All Accounts</div>
              <table style={S.table}>
                <thead><tr>{['Account No', 'Name', 'Type', 'Balance', 'Status'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>{accounts.map(a => (
                  <tr key={a.id}>
                    <td style={S.td}>{a.accountNumber}</td><td style={S.td}>{a.name}</td>
                    <td style={S.td}>{a.accountType}</td>
                    <td style={S.td}>₹{Number(a.balance).toLocaleString('en-IN')}</td>
                    <td style={S.td}><span style={{ color: a.isActive ? '#28a745' : '#dc3545', fontWeight: 600 }}>{a.isActive ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {tab === 'search' && (
            <div style={S.card}>
              <div style={S.title}>Search Account</div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <input style={{ ...S.input, maxWidth: '300px' }} placeholder="Enter account number" value={searchAcc} onChange={e => setSearchAcc(e.target.value)} />
                <button style={{ ...S.btn(), marginTop: 0 }} onClick={handleSearch}>Search</button>
              </div>
              {balance && (
                <div style={{ background: '#e8f4f8', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
                  <strong>{balance.name}</strong> | Account: {balance.accountNumber} | Balance: <strong>₹{Number(balance.balance).toLocaleString('en-IN')}</strong>
                </div>
              )}
              {transactions.length > 0 && (
                <table style={S.table}>
                  <thead><tr>{['Type', 'Amount', 'Balance After', 'Description', 'Date'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>{transactions.map(t => (
                    <tr key={t.id}>
                      <td style={S.td}><span style={{ color: t.transactionType === 'DEPOSIT' ? '#28a745' : '#dc3545', fontWeight: 600 }}>{t.transactionType}</span></td>
                      <td style={S.td}>₹{Number(t.amount).toLocaleString('en-IN')}</td>
                      <td style={S.td}>₹{Number(t.balanceAfter).toLocaleString('en-IN')}</td>
                      <td style={S.td}>{t.description || '-'}</td>
                      <td style={S.td}>{new Date(t.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
