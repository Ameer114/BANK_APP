import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getMyAccounts, getBalance, getTransactions, setPin, withdrawClient } from '../services/api';

const S = {
  app: { minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)' },
  header: { background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', color: '#fff', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '22px', fontWeight: 700 },
  tabs: { display: 'flex', gap: '0', padding: '0 32px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  tab: (active) => ({ padding: '16px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: active ? 600 : 400, color: active ? '#0f3460' : '#888', borderBottom: active ? '3px solid #0f3460' : '3px solid transparent' }),
  content: { padding: '28px 32px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' },
  accCard: { background: 'linear-gradient(135deg, #1a1a2e, #0f3460)', color: '#fff', borderRadius: '16px', padding: '28px', position: 'relative', overflow: 'hidden' },
  accNum: { fontSize: '13px', opacity: 0.7, marginBottom: '8px' },
  balance: { fontSize: '32px', fontWeight: 700, marginBottom: '4px' },
  accName: { opacity: 0.8, fontSize: '14px' },
  accType: { position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' },
  card: { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '20px' },
  cardTitle: { fontSize: '17px', fontWeight: 600, color: '#1a1a2e', marginBottom: '20px' },
  input: { border: '1px solid #ddd', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', width: '100%', boxSizing: 'border-box', outline: 'none' },
  label: { fontSize: '13px', color: '#555', marginBottom: '6px', display: 'block' },
  btn: (color) => ({ background: color || '#0f3460', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 28px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }),
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', background: '#f8f9fa', fontSize: '13px', fontWeight: 600, color: '#555', borderBottom: '2px solid #e9ecef' },
  td: { padding: '12px 16px', borderBottom: '1px solid #f0f2f5', fontSize: '14px' },
  logoutBtn: { background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', fontWeight: 600 },
};

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('accounts');
  const [accounts, setAccounts] = useState([]);
  const [selectedAcc, setSelectedAcc] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [balanceData, setBalanceData] = useState(null);
  const [pinForm, setPinForm] = useState({ accountNumber: '', newPin: '' });
  const [wdForm, setWdForm] = useState({ accountNumber: '', amount: '', pin: '', description: '' });
  const [msg, setMsg] = useState({ text: '', ok: true });

  const showMsg = (text, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg({ text: '', ok: true }), 3000); };

  useEffect(() => {
    getMyAccounts().then(r => { setAccounts(r.data); if (r.data.length > 0) setSelectedAcc(r.data[0].accountNumber); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedAcc) {
      getTransactions(selectedAcc).then(r => setTransactions(r.data)).catch(() => {});
      getBalance(selectedAcc).then(r => setBalanceData(r.data)).catch(() => {});
    }
  }, [selectedAcc]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      await withdrawClient({ ...wdForm, amount: Number(wdForm.amount) });
      showMsg('Withdrawal successful!');
      setWdForm({ accountNumber: '', amount: '', pin: '', description: '' });
      getMyAccounts().then(r => setAccounts(r.data));
    } catch (err) { showMsg(err.response?.data || 'Withdrawal failed', false); }
  };

  const handleSetPin = async (e) => {
    e.preventDefault();
    try {
      await setPin(pinForm);
      showMsg('PIN set successfully!');
      setPinForm({ accountNumber: '', newPin: '' });
    } catch (err) { showMsg('Failed to set PIN', false); }
  };

  return (
    <div style={S.app}>
      <div style={S.header}>
        <div style={S.logo}>🏦 My Banking</div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span>Welcome, {user?.name} 👋</span>
          <button style={S.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>Logout</button>
        </div>
      </div>
      <div style={S.tabs}>
        {[['accounts', '💳 My Accounts'], ['transactions', '📊 Transactions'], ['withdraw', '⬆️ Withdraw'], ['pin', '🔐 Set PIN']].map(([key, label]) => (
          <div key={key} style={S.tab(tab === key)} onClick={() => setTab(key)}>{label}</div>
        ))}
      </div>
      <div style={S.content}>
        {msg.text && <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '16px', background: msg.ok ? '#d4edda' : '#f8d7da', color: msg.ok ? '#155724' : '#721c24' }}>{msg.text}</div>}

        {tab === 'accounts' && (
          <div>
            <div style={S.grid}>
              {accounts.map(a => (
                <div key={a.id} style={S.accCard} onClick={() => setSelectedAcc(a.accountNumber)}>
                  <div style={S.accType}>{a.accountType}</div>
                  <div style={S.accNum}>Acc: {a.accountNumber}</div>
                  <div style={S.balance}>₹{Number(a.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  <div style={S.accName}>{a.name}</div>
                  <div style={{ marginTop: '12px', fontSize: '12px', opacity: 0.6 }}>{a.isActive ? '● Active' : '● Inactive'}</div>
                </div>
              ))}
            </div>
            {accounts.length === 0 && <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>No accounts found. Please contact your bank teller.</div>}
          </div>
        )}

        {tab === 'transactions' && (
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={S.cardTitle}>Transaction History</div>
              <select style={{ ...S.input, width: '200px' }} value={selectedAcc} onChange={e => setSelectedAcc(e.target.value)}>
                {accounts.map(a => <option key={a.id} value={a.accountNumber}>{a.accountNumber}</option>)}
              </select>
            </div>
            {balanceData && <div style={{ background: '#e8f4f8', padding: '14px 20px', borderRadius: '10px', marginBottom: '20px', fontWeight: 600, color: '#0f3460' }}>Current Balance: ₹{Number(balanceData.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>}
            <table style={S.table}>
              <thead><tr>{['Type', 'Amount', 'Balance After', 'Description', 'Date'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>{transactions.map(t => (
                <tr key={t.id}>
                  <td style={S.td}><span style={{ color: t.transactionType === 'DEPOSIT' ? '#28a745' : '#e94560', fontWeight: 600 }}>{t.transactionType === 'DEPOSIT' ? '⬇️' : '⬆️'} {t.transactionType}</span></td>
                  <td style={S.td}>₹{Number(t.amount).toLocaleString('en-IN')}</td>
                  <td style={S.td}>₹{Number(t.balanceAfter).toLocaleString('en-IN')}</td>
                  <td style={S.td}>{t.description || '-'}</td>
                  <td style={S.td}>{new Date(t.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {transactions.length === 0 && <tr><td colSpan="5" style={{ ...S.td, textAlign: 'center', color: '#888' }}>No transactions found</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'withdraw' && (
          <div style={{ maxWidth: '440px' }}>
            <div style={S.card}>
              <div style={S.cardTitle}>Withdraw Funds</div>
              <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={S.label}>Select Account</label>
                  <select style={S.input} value={wdForm.accountNumber} onChange={e => setWdForm({...wdForm, accountNumber: e.target.value})} required>
                    <option value="">-- Select Account --</option>
                    {accounts.filter(a => a.isActive).map(a => <option key={a.id} value={a.accountNumber}>{a.accountNumber} (₹{Number(a.balance).toLocaleString('en-IN')})</option>)}
                  </select>
                </div>
                <div><label style={S.label}>Amount (₹)</label><input style={S.input} type="number" min="1" value={wdForm.amount} onChange={e => setWdForm({...wdForm, amount: e.target.value})} required /></div>
                <div><label style={S.label}>PIN</label><input style={S.input} type="password" maxLength="4" value={wdForm.pin} onChange={e => setWdForm({...wdForm, pin: e.target.value})} required /></div>
                <div><label style={S.label}>Description</label><input style={S.input} value={wdForm.description} onChange={e => setWdForm({...wdForm, description: e.target.value})} /></div>
                <button style={S.btn('#e94560')} type="submit">Withdraw</button>
              </form>
            </div>
          </div>
        )}

        {tab === 'pin' && (
          <div style={{ maxWidth: '400px' }}>
            <div style={S.card}>
              <div style={S.cardTitle}>Set / Change PIN</div>
              <form onSubmit={handleSetPin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={S.label}>Select Account</label>
                  <select style={S.input} value={pinForm.accountNumber} onChange={e => setPinForm({...pinForm, accountNumber: e.target.value})} required>
                    <option value="">-- Select Account --</option>
                    {accounts.map(a => <option key={a.id} value={a.accountNumber}>{a.accountNumber}</option>)}
                  </select>
                </div>
                <div><label style={S.label}>New PIN (4 digits)</label><input style={S.input} type="password" maxLength="4" minLength="4" value={pinForm.newPin} onChange={e => setPinForm({...pinForm, newPin: e.target.value})} required /></div>
                <button style={S.btn()} type="submit">Set PIN</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
