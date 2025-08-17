import React, { useState } from 'react';
import { post } from '../lib/api';

const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const STATUS = [
  { label: 'Urgent', value: 'URGENT' },
  { label: 'Not urgent', value: 'NOT_URGENT' }
];

export default function CreateRequest() {
  const [form, setForm] = useState({
    patientName: '',
    bloodTypeNeeded: 'O+',
    hospitalName: '',
    status: 'URGENT'
  });
  const [statusMsg, setStatusMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [matches, setMatches] = useState([]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg('Submitting...');
    setMatches([]);
    try {
      // POST /requests -> { request, matches }
      const data = await post('/requests', form);
      setStatusMsg(`✅ Requirement posted. ${data.matches.length} matching donor(s) found.`);
      setMatches(data.matches);
    } catch (err) {
      setStatusMsg('❌ ' + (err?.message || 'Failed to create requirement'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
      <h2>Post Blood Requirement</h2>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input
          name="patientName"
          placeholder="Patient name"
          value={form.patientName}
          onChange={onChange}
          required
        />

        <select
          name="bloodTypeNeeded"
          value={form.bloodTypeNeeded}
          onChange={onChange}
          required
        >
          {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
        </select>

        <input
          name="hospitalName"
          placeholder="Hospital name"
          value={form.hospitalName}
          onChange={onChange}
          required
        />

        <select
          name="status"
          value={form.status}
          onChange={onChange}
          required
        >
          {STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit Requirement'}
        </button>
      </form>

      {statusMsg && <p style={{ marginTop: 10 }}>{statusMsg}</p>}

      {matches.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3>Matching Donors</h3>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', background: '#f9fafb' }}>
                  <th style={th}>Name</th>
                  <th style={th}>Contact Number</th>
                  <th style={th}>Email</th>
                  <th style={th}>Recent Donation</th>
                  <th style={th}>Blood Type</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((d) => (
                  <tr key={d._id} style={{ borderTop: '1px solid #eee' }}>
                    <td style={td}>{d.name || '-'}</td>
                    <td style={td}>{d.contactNumber || '-'}</td>
                    <td style={td}>{d.email || '-'}</td>
                    <td style={td}>{d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString() : '-'}</td>
                    <td style={td}>{d.bloodType || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const th = { padding: 10, fontWeight: 600, fontSize: 14, color: '#111827' };
const td = { padding: 10, fontSize: 14, color: '#374151' };
