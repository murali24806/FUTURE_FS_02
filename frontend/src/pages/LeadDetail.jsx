import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost'];

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [note, setNote] = useState('');
  const [followUp, setFollowUp] = useState({ date: '', note: '' });
  const [saving, setSaving] = useState(false);

  const fetchLead = async () => {
    try {
      const { data } = await axios.get(`/api/leads/${id}`);
      setLead(data); setEditForm(data);
    } catch { toast.error('Lead not found'); navigate('/leads'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLead(); }, [id]);

  const saveEdit = async () => {
    setSaving(true);
    try {
      await axios.put(`/api/leads/${id}`, editForm);
      toast.success('Lead updated!');
      setEditing(false);
      fetchLead();
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    try {
      await axios.post(`/api/leads/${id}/notes`, { text: note });
      setNote(''); fetchLead(); toast.success('Note added');
    } catch { toast.error('Failed to add note'); }
  };

  const addFollowUp = async () => {
    if (!followUp.date) return toast.error('Select a date');
    try {
      await axios.post(`/api/leads/${id}/followups`, followUp);
      setFollowUp({ date: '', note: '' }); fetchLead(); toast.success('Follow-up scheduled');
    } catch { toast.error('Failed to schedule'); }
  };

  const completeFollowUp = async (fid) => {
    try {
      await axios.patch(`/api/leads/${id}/followups/${fid}`);
      fetchLead();
    } catch { toast.error('Failed to update'); }
  };

  const ef = (k, v) => setEditForm(p => ({ ...p, [k]: v }));

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 60 }}><div className="spinner" /></div>;
  if (!lead) return null;

  return (
    <div className="animate-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leads')}>← Back</button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>{lead.name}</h2>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>{lead.email} {lead.company ? `• ${lead.company}` : ''}</p>
        </div>
        <span className={`badge badge-${lead.status}`} style={{ fontSize: 13, padding: '5px 14px' }}>{lead.status}</span>
        <button className="btn btn-primary" onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit Lead'}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Details */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', marginBottom: 16 }}>LEAD INFORMATION</h3>
            {editing ? (
              <>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Name</label><input className="input" value={editForm.name || ''} onChange={e => ef('name', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Email</label><input className="input" value={editForm.email || ''} onChange={e => ef('email', e.target.value)} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Phone</label><input className="input" value={editForm.phone || ''} onChange={e => ef('phone', e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Company</label><input className="input" value={editForm.company || ''} onChange={e => ef('company', e.target.value)} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="input" value={editForm.status} onChange={e => ef('status', e.target.value)}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="input" value={editForm.priority} onChange={e => ef('priority', e.target.value)}>
                      {['low', 'medium', 'high'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Deal Value ($)</label><input className="input" type="number" value={editForm.value || ''} onChange={e => ef('value', e.target.value)} /></div>
                <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
                {[
                  ['Phone', lead.phone || '—'],
                  ['Company', lead.company || '—'],
                  ['Source', (lead.source || '').replace('_', ' ')],
                  ['Priority', lead.priority],
                  ['Deal Value', lead.value > 0 ? `$${lead.value.toLocaleString()}` : '—'],
                  ['Created', format(new Date(lead.createdAt), 'MMM d, yyyy')],
                  ['Assigned To', lead.assignedTo?.name || 'Unassigned'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{k}</div>
                    <div style={{ color: 'var(--text)', fontWeight: 500, textTransform: k === 'Source' || k === 'Priority' ? 'capitalize' : 'none' }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Initial message */}
          {lead.message && (
            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', marginBottom: 12 }}>INITIAL MESSAGE</h3>
              <p style={{ color: 'var(--text2)', lineHeight: 1.7, fontSize: 13 }}>{lead.message}</p>
            </div>
          )}

          {/* Notes */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', marginBottom: 16 }}>NOTES ({lead.notes?.length || 0})</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..." onKeyDown={e => e.key === 'Enter' && addNote()} />
              <button className="btn btn-primary" onClick={addNote} style={{ flexShrink: 0 }}>Add</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(lead.notes || []).slice().reverse().map((n, i) => (
                <div key={i} style={{ padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8, borderLeft: '3px solid var(--accent)' }}>
                  <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 6 }}>{n.text}</p>
                  <p style={{ fontSize: 11, color: 'var(--text3)' }}>{n.addedBy} • {format(new Date(n.createdAt), 'MMM d, yyyy h:mm a')}</p>
                </div>
              ))}
              {lead.notes?.length === 0 && <p style={{ color: 'var(--text3)', fontSize: 13 }}>No notes yet.</p>}
            </div>
          </div>
        </div>

        {/* Right - Follow-ups */}
        <div>
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', marginBottom: 16 }}>FOLLOW-UPS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <input className="input" type="datetime-local" value={followUp.date} onChange={e => setFollowUp(p => ({ ...p, date: e.target.value }))} />
              <input className="input" value={followUp.note} onChange={e => setFollowUp(p => ({ ...p, note: e.target.value }))} placeholder="Follow-up note..." />
              <button className="btn btn-primary" onClick={addFollowUp} style={{ width: '100%', justifyContent: 'center' }}>Schedule Follow-up</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(lead.followUps || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date)).map((f, i) => (
                <div key={i} style={{
                  padding: '10px 12px', borderRadius: 8,
                  background: f.completed ? 'rgba(34,197,94,0.08)' : 'var(--bg3)',
                  border: `1px solid ${f.completed ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`,
                  opacity: f.completed ? 0.7 : 1
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: f.completed ? 'var(--green)' : 'var(--accent)' }}>
                      {format(new Date(f.date), 'MMM d, yyyy h:mm a')}
                    </span>
                    {!f.completed && (
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => completeFollowUp(f._id)}>✓ Done</button>
                    )}
                    {f.completed && <span style={{ fontSize: 11, color: 'var(--green)' }}>✓ Done</span>}
                  </div>
                  {f.note && <p style={{ fontSize: 12, color: 'var(--text2)' }}>{f.note}</p>}
                  <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>by {f.addedBy}</p>
                </div>
              ))}
              {lead.followUps?.length === 0 && <p style={{ color: 'var(--text3)', fontSize: 13 }}>No follow-ups scheduled.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
