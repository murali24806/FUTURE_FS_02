import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function AddAgentModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'agent' });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.name || !form.email || !form.password) return toast.error('All fields required');
    setLoading(true);
    try {
      await axios.post('/api/auth/create-agent', form);
      toast.success('Agent created!');
      onSave();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Add New Agent</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group"><label className="form-label">Full Name *</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Jane Smith" /></div>
          <div className="form-group"><label className="form-label">Email *</label><input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="jane@company.com" /></div>
          <div className="form-group"><label className="form-label">Password *</label><input className="input" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 6 characters" /></div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={submit} className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Agent'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const fetchAgents = async () => {
    try {
      const { data } = await axios.get('/api/auth/agents');
      setAgents(data);
    } catch { toast.error('Failed to load agents'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAgents(); }, []);

  const toggleAgent = async (id) => {
    try {
      const { data } = await axios.patch(`/api/auth/agents/${id}/toggle`);
      toast.success(data.isActive ? 'Agent activated' : 'Agent deactivated');
      fetchAgents();
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Agents</h2>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>{agents.length} team members</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Agent</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {agents.map(agent => (
                  <tr key={agent._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #4f8ef7, #a855f7)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0
                        }}>{agent.name?.[0]?.toUpperCase()}</div>
                        <span style={{ color: 'var(--text)', fontWeight: 500 }}>{agent.name}</span>
                      </div>
                    </td>
                    <td>{agent.email}</td>
                    <td>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: agent.role === 'admin' ? 'rgba(168,85,247,0.15)' : 'rgba(79,142,247,0.15)',
                        color: agent.role === 'admin' ? 'var(--purple)' : 'var(--accent)',
                        textTransform: 'uppercase', letterSpacing: '0.5px'
                      }}>{agent.role}</span>
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: agent.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                        color: agent.isActive ? 'var(--green)' : 'var(--red)',
                      }}>{agent.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td>{format(new Date(agent.createdAt), 'MMM d, yyyy')}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${agent.isActive ? 'btn-danger' : 'btn-ghost'}`}
                        onClick={() => toggleAgent(agent._id)}
                      >{agent.isActive ? 'Deactivate' : 'Activate'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && <AddAgentModal onClose={() => setShowAdd(false)} onSave={() => { setShowAdd(false); fetchAgents(); }} />}
    </div>
  );
}
