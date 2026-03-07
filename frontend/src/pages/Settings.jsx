import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Settings</h2>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>Your account & system info</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', marginBottom: 16 }}>ACCOUNT INFO</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[['Name', user?.name], ['Email', user?.email], ['Role', user?.role]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text3)', fontSize: 13 }}>{k}</span>
                <span style={{ color: 'var(--text)', fontWeight: 500, textTransform: 'capitalize' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', marginBottom: 16 }}>MONGODB CONFIGURATION</h3>
          <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '14px', marginBottom: 14 }}>
            <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
              To connect your own MongoDB instance, update the <code style={{ color: 'var(--accent)', background: 'rgba(79,142,247,0.1)', padding: '1px 5px', borderRadius: 4 }}>MONGODB_URI</code> in <code style={{ color: 'var(--accent)', background: 'rgba(79,142,247,0.1)', padding: '1px 5px', borderRadius: 4 }}>backend/.env</code>
            </p>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.8 }}>
            <div>Format:</div>
            <code style={{ display: 'block', background: 'var(--bg3)', padding: '8px 10px', borderRadius: 6, color: 'var(--green)', marginTop: 6, fontSize: 11 }}>
              mongodb+srv://user:pass@cluster.mongodb.net/crm_db
            </code>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', marginBottom: 16 }}>API ENDPOINTS</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['POST', '/api/leads/public/submit', 'Website contact form'],
              ['GET', '/api/leads', 'Get all leads'],
              ['POST', '/api/leads', 'Create lead'],
              ['GET', '/api/dashboard/stats', 'Dashboard stats'],
            ].map(([method, path, desc]) => (
              <div key={path} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12 }}>
                <span style={{ padding: '2px 6px', borderRadius: 4, background: method === 'GET' ? 'rgba(34,197,94,0.15)' : 'rgba(79,142,247,0.15)', color: method === 'GET' ? 'var(--green)' : 'var(--accent)', fontWeight: 700, fontFamily: 'monospace', minWidth: 40, textAlign: 'center' }}>{method}</span>
                <code style={{ color: 'var(--text2)' }}>{path}</code>
                <span style={{ color: 'var(--text3)', marginLeft: 'auto' }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', marginBottom: 16 }}>WEBSITE FORM INTEGRATION</h3>
          <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>Add this fetch call to your contact form:</p>
          <pre style={{ background: 'var(--bg3)', padding: '12px', borderRadius: 8, fontSize: 11, color: 'var(--green)', overflow: 'auto', lineHeight: 1.7 }}>{`fetch('http://localhost:5000/api/leads/public/submit', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    name, email, phone, message,
    source: 'website'
  })
})`}</pre>
        </div>
      </div>
    </div>
  );
}
