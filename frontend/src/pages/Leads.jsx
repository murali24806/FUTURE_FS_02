import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost'];
const SOURCES = ['website', 'referral', 'social_media', 'email', 'cold_call', 'other'];
const PRIORITIES = ['low', 'medium', 'high'];

function AddLeadModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', source: 'website', status: 'new', priority: 'medium', value: '', message: '' });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.name || !form.email) return toast.error('Name and email are required');
    setLoading(true);
    try {
      await axios.post('/api/leads', form);
      toast.success('Lead added!');
      onSave();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Add New Lead</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group"><label className="form-label">Full Name *</label><input className="input" value={form.name} onChange={e => f('name', e.target.value)} placeholder="John Doe" /></div>
            <div className="form-group"><label className="form-label">Email *</label><input className="input" type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="john@example.com" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Phone</label><input className="input" value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="+1 555 0000" /></div>
            <div className="form-group"><label className="form-label">Company</label><input className="input" value={form.company} onChange={e => f('company', e.target.value)} placeholder="Acme Inc." /></div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Source</label>
              <select className="input" value={form.source} onChange={e => f('source', e.target.value)}>
                {SOURCES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="input" value={form.priority} onChange={e => f('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="input" value={form.status} onChange={e => f('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Deal Value ($)</label><input className="input" type="number" value={form.value} onChange={e => f('value', e.target.value)} placeholder="0" /></div>
          </div>
          <div className="form-group"><label className="form-label">Message / Notes</label><textarea className="input" rows={3} value={form.message} onChange={e => f('message', e.target.value)} placeholder="Initial inquiry..." /></div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={submit} className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Add Lead'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', source: '', priority: '' });
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, search, ...filters };
      const { data } = await axios.get('/api/leads', { params });
      setLeads(data.leads);
      setTotal(data.total);
    } catch (e) { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  }, [page, search, filters]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this lead?')) return;
    try { await axios.delete(`/api/leads/${id}`); toast.success('Deleted'); fetchLeads(); }
    catch (e) { toast.error('Failed to delete'); }
  };

  const quickStatus = async (id, status, e) => {
    e.stopPropagation();
    try { await axios.put(`/api/leads/${id}`, { status }); fetchLeads(); }
    catch { toast.error('Update failed'); }
  };

  const ff = (k, v) => { setFilters(p => ({ ...p, [k]: v })); setPage(1); };
  const totalPages = Math.ceil(total / 15);

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Leads</h2>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>{total} total leads</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Lead</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input className="input" style={{ maxWidth: 240 }} placeholder="🔍 Search name, email, company..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select className="input" style={{ maxWidth: 140 }} value={filters.status} onChange={e => ff('status', e.target.value)}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input" style={{ maxWidth: 150 }} value={filters.source} onChange={e => ff('source', e.target.value)}>
          <option value="">All Sources</option>
          {SOURCES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select className="input" style={{ maxWidth: 140 }} value={filters.priority} onChange={e => ff('priority', e.target.value)}>
          <option value="">All Priority</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {(filters.status || filters.source || filters.priority || search) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilters({ status: '', source: '', priority: '' }); setSearch(''); setPage(1); }}>Clear</button>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
        ) : leads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text3)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
            <div>No leads found. Add your first lead!</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Company</th><th>Source</th><th>Priority</th><th>Status</th><th>Value</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/leads/${lead._id}`)}>
                    <td style={{ color: 'var(--text)', fontWeight: 500 }}>{lead.name}</td>
                    <td>{lead.email}</td>
                    <td>{lead.company || '—'}</td>
                    <td style={{ textTransform: 'capitalize', fontSize: 12 }}>{lead.source?.replace('_', ' ')}</td>
                    <td><span className={`priority-${lead.priority}`} style={{ fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{lead.priority}</span></td>
                    <td><span className={`badge badge-${lead.status}`}>{lead.status}</span></td>
                    <td style={{ color: 'var(--green)' }}>{lead.value > 0 ? `$${lead.value.toLocaleString()}` : '—'}</td>
                    <td>{format(new Date(lead.createdAt), 'MMM d')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                        <select
                          className="input btn-sm"
                          style={{ padding: '3px 6px', fontSize: 11, width: 'auto' }}
                          value={lead.status}
                          onChange={e => quickStatus(lead._id, e.target.value, e)}
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {user?.role === 'admin' && (
                          <button className="btn btn-danger btn-sm" onClick={e => handleDelete(lead._id, e)}>✕</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ color: 'var(--text2)', fontSize: 13, display: 'flex', alignItems: 'center' }}>Page {page} of {totalPages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      {showAdd && <AddLeadModal onClose={() => setShowAdd(false)} onSave={() => { setShowAdd(false); fetchLeads(); }} />}
    </div>
  );
}
