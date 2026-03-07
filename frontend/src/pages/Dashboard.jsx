import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const StatCard = ({ label, value, color, icon }) => (
  <div className="card animate-in" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{
      width: 46, height: 46, borderRadius: 12,
      background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 20, flexShrink: 0
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Syne', color: '#fff' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  </div>
);

const SOURCE_COLORS = { website: '#4f8ef7', referral: '#22c55e', social_media: '#a855f7', email: '#f59e0b', cold_call: '#ef4444', other: '#6b7280' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ color: 'var(--text2)', marginBottom: 4 }}>{label}</div>
      <div style={{ color: 'var(--accent)', fontWeight: 600 }}>{payload[0].value} leads</div>
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/dashboard/stats').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 60 }}><div className="spinner" /></div>;
  if (!data) return <div style={{ color: 'var(--text2)' }}>Failed to load dashboard. Check backend connection.</div>;

  const { totals, recentLeads, leadsBySource, monthlyLeads } = data;

  const monthlyData = monthlyLeads.map(m => ({
    name: `${['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m._id.month]}`,
    leads: m.count
  }));

  const pieData = leadsBySource.map(s => ({
    name: s._id.replace('_', ' '),
    value: s.count,
    color: SOURCE_COLORS[s._id] || '#6b7280'
  }));

  const statusBadge = (s) => <span className={`badge badge-${s}`}>{s}</span>;

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Dashboard</h2>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Welcome back! Here's your CRM overview.</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Leads" value={totals.totalLeads} color="#4f8ef7" icon="📊" />
        <StatCard label="New" value={totals.newLeads} color="#4f8ef7" icon="🆕" />
        <StatCard label="Contacted" value={totals.contactedLeads} color="#f59e0b" icon="📞" />
        <StatCard label="Qualified" value={totals.qualifiedLeads} color="#a855f7" icon="✅" />
        <StatCard label="Converted" value={totals.convertedLeads} color="#22c55e" icon="🎯" />
        <StatCard label="Active Agents" value={totals.totalAgents} color="#22c55e" icon="👥" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, color: 'var(--text2)' }}>LEADS BY MONTH</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="name" stroke="var(--text3)" fontSize={11} />
              <YAxis stroke="var(--text3)" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="leads" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, color: 'var(--text2)' }}>LEADS BY SOURCE</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={60} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                {pieData.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text2)', textTransform: 'capitalize', flex: 1 }}>{s.name}</span>
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', paddingTop: 40 }}>No data yet</div>}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)' }}>RECENT LEADS</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leads')}>View All</button>
        </div>
        {recentLeads.length === 0 ? (
          <div style={{ color: 'var(--text3)', textAlign: 'center', padding: '24px 0' }}>No leads yet. Add your first lead!</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Source</th><th>Status</th><th>Added</th></tr>
              </thead>
              <tbody>
                {recentLeads.map(lead => (
                  <tr key={lead._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/leads/${lead._id}`)}>
                    <td style={{ color: 'var(--text)', fontWeight: 500 }}>{lead.name}</td>
                    <td>{lead.email}</td>
                    <td style={{ textTransform: 'capitalize' }}>{lead.source?.replace('_', ' ')}</td>
                    <td>{statusBadge(lead.status)}</td>
                    <td>{format(new Date(lead.createdAt), 'MMM d, yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
