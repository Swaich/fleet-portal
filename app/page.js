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
      const res = await fetch('/api/jobs', { cache: 'no-store' });
      const data = await res.json();
      setJobs(data);
    } catch (e) { console.error("Database error"); }
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
    } catch (err) { alert("Check Connection"); } finally { setLoading(false); }
  };

  const grouped = jobs.reduce((acc, job) => {
    (acc[job.date] = acc[job.date] || []).push(job);
    return acc;
  }, {});

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ background: '#002b5c', color: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px' }}>
        <h1>M'S FLEET SERVICE</h1>
        <p style={{ color: '#4ade80', fontWeight: 'bold' }}>MANAGEMENT PORTAL</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <form onSubmit={submitJob}>
            <select value={formData.tech} onChange={e => setFormData({...formData, tech: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
              {techs.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
            <input type="text" placeholder="Fleet Name" required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}/>
            <input type="text" placeholder="Location" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}/>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><small>Arrival</small><input type="time" required value={formData.arrival} onChange={e => setFormData({...formData, arrival: e.target.value})} style={{ width: '100%' }}/></div>
              <div><small>Finish</small><input type="time" required value={formData.finished} onChange={e => setFormData({...formData, finished: e.target.value})} style={{ width: '100%' }}/></div>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: '#002b5c', color: 'white', border: 'none', borderRadius: '5px', marginTop: '10px', cursor: 'pointer' }}>
              {loading ? "SAVING..." : "SUBMIT"}
            </button>
          </form>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '10px' }}>
          <h3>Dispatch History</h3>
          {Object.keys(grouped).map(date => (
            <div key={date} style={{ marginBottom: '15px' }}>
              <div style={{ fontWeight: 'bold', borderBottom: '2px solid #002b5c' }}>{date}</div>
              {grouped[date].map((j, i) => (
                <div key={i} style={{ padding: '8px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{j.tech} - {j.company}</span>
                  <span style={{ color: j.hourType === 'Regular' ? 'green' : 'orange', fontWeight: 'bold' }}>{j.totalHours}h ({j.hourType})</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
