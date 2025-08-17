import React, { useState } from 'react';
import { post } from '../lib/api';

const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

export default function RegisterDonor() {
  const [form, setForm] = useState({
    name: '', gender: 'Male', age: '', address: '',
    email: '', contactNumber: '', bloodType: 'O+', lastDonationDate: ''
  });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus('Submitting...');
    try {
      // ensure age is a number (backend expects Number)
      const payload = { ...form, age: form.age ? Number(form.age) : undefined };
      await post('/donors', payload);

      setStatus('✅ Donor registered!');
      setForm({
        name: '', gender: 'Male', age: '', address: '',
        email: '', contactNumber: '', bloodType: 'O+', lastDonationDate: ''
      });
    } catch (err) {
      setStatus('❌ ' + (err?.message || 'Failed to register'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '24px auto', padding: 16 }}>
      <h2>Register as Donor</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input name="name" placeholder="Full name" value={form.name} onChange={onChange} required />

        <select name="gender" value={form.gender} onChange={onChange} required>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
          <option>Prefer not to say</option>
        </select>

        <input type="number" name="age" placeholder="Age" value={form.age} onChange={onChange} required min={18} max={65} />

        <input name="address" placeholder="Address" value={form.address} onChange={onChange} required />

        <input type="email" name="email" placeholder="Email" value={form.email} onChange={onChange} required />

        <input name="contactNumber" placeholder="Contact number" value={form.contactNumber} onChange={onChange} required />

        <select name="bloodType" value={form.bloodType} onChange={onChange} required>
          {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
        </select>

        <label>
          Date of most recent donation:
          <input type="date" name="lastDonationDate" value={form.lastDonationDate} onChange={onChange} />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Register'}
        </button>
      </form>
      {status && <p style={{ marginTop: 10 }}>{status}</p>}
    </div>
  );
}
