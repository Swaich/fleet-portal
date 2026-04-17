"use client";
import { useState, useEffect } from 'react';

export default function MsFleetPortal() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tech: 'Luis', date: new Date().toISOString().split('T')[0],
    company: '', location: '', issue: '', etaTo: '', etaFrom: '', arrival: '', finished: ''
  });

  const techs = ["Luis", "Christopher", "Alfredo", "Ali", "Victor", "Butta", "Nerlin", "Carlos"];

  const loadData = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (Array.isArray(data)) setJobs(data);
    } catch (e) { console.error("Database Connection Error"); }
  };

  useEffect(() => { loadData(); }, []);

  const submitJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const start = new Date(`2000-01-01T${formData.arrival}:00`);
      const end = new Date(`2000-01-01T${formData.finished}:00`);
      let hours = (end - start) / 3600000;
      if (hours < 0) hours += 24;

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, totalHours: hours.toFixed(2) }),
      });

      if (res.ok) {
        setFormData({ ...formData, company: '', location: '', issue: '', etaTo: '', etaFrom: '', arrival: '', finished: '' });
        loadData();
      }
    } catch (err) { alert("Error connecting to server"); } finally { setLoading(false); }
  };

  const grouped = jobs.reduce((acc, job) => {
    (acc[job.date] = acc[job.date] || []).push(job);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ background: '#002b5c', color: 'white', padding: '20px', borderRadius: '10px', marginBottom: '25px', borderBottom: '5px solid #4ade80', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '28px', letterSpacing: '1px' }}>M'S FLEET SERVICE</h1>
        <p style={{ margin: '5px 0 0', color: '#4ade80', fontWeight: 'bold' }}>DISPATCH & PAYROLL SYSTEM</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '20px' }}>
        {/* INPUT BOX */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <h3 style={{marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px'}}>Log New Dispatch</h3>
          <form onSubmit={submitJob}>
            <label style={{fontSize: '12px', fontWeight: 'bold'}}>Technician</label>
            <select value={formData.tech} onChange={e => setFormData({...formData, tech: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px' }}>
              {techs.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '15px' }} />
            <input type="text" placeholder="Fleet Name" required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px' }}/>
            <input type="text" placeholder="Location" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px' }}/>
            <textarea placeholder="Job Details" value={formData.issue} onChange={e => setFormData({...formData, issue: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '15px', height: '60px' }}/>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><small>Arrival</small><input type="time" required value={formData.arrival} onChange={e => setFormData({...formData, arrival: e.target.value})} style={{ width: '100%' }}/></div>
              <div><small>Finish</small><input type="time" required value={formData.finished} onChange={e => setFormData({...formData, finished: e.target.value})} style={{ width: '100%' }}/></div>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: '#002b5c', color: 'white', border: 'none', borderRadius: '8px', marginTop: '20px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? "SAVING..." : "COMMIT TO DATABASE"}
            </button>
          </form>
        </div>

        {/* FEED & PAYROLL */}
        <div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
            <h3 style={{marginTop: 0}}>Daily History</h3>
            {Object.keys(grouped).map(date => (
              <div key={date} style={{ marginBottom: '15px' }}>
                <div style={{ background: '#f8f9fa', padding: '8px', fontWeight: 'bold', borderLeft: '4px solid #002b5c' }}>{date}</div>
                {grouped[date].map((j, i) => (
                  <div key={i} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                    <span><strong>{j.tech}</strong>: {j.company}</span>
                    <span style={{ fontWeight: 'bold', color: j.hourType === 'Regular' ? 'green' : 'orange' }}>{j.totalHours}h ({j.hourType})</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ background: '#1e293b', color: 'white', padding: '25px', borderRadius: '12px' }}>
            <h3 style={{marginTop: 0, color: '#4ade80'}}>Monthly Payroll Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
              {techs.map(t => {
                const filtered = jobs.filter(j => j.tech === t);
                const reg = filtered.filter(j => j.hourType === "Regular").reduce((a, b) => a + parseFloat(b.totalHours), 0);
                const aft = filtered.filter(j => j.hourType === "After Hours").reduce((a, b) => a + parseFloat(b.totalHours), 0);
                return (
                  <div key={t} style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 'bold' }}>{t}</div>
                    <div style={{fontSize: '13px'}}>Reg: {reg.toFixed(2)}h</div>
                    <div style={{fontSize: '13px', color: '#fbbf24'}}>After: {aft.toFixed(2)}h</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
