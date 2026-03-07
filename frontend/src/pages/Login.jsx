import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('admin@crm.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(79,142,247,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.07) 0%, transparent 60%)'
    }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 20px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #4f8ef7, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800, color: 'white', margin: '0 auto 16px'
          }}>L</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>LeadFlow CRM</h1>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>Sign in to your admin panel</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '28px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email" className="input"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@crm.com" required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password" className="input"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: 8 }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, padding: '12px', background: 'rgba(79,142,247,0.08)', borderRadius: 8, border: '1px solid rgba(79,142,247,0.2)' }}>
          <p style={{ fontSize: 12, color: 'var(--text2)' }}>Default: <strong style={{ color: 'var(--accent)' }}>admin@crm.com</strong> / <strong style={{ color: 'var(--accent)' }}>Admin@123</strong></p>
        </div>
      </div>
    </div>
  );
}
