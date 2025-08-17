import React from 'react';
import { Link } from 'react-router-dom';

const card = {
  display: 'block',
  padding: '20px',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  textDecoration: 'none',
  color: '#111827',
  boxShadow: '0 4px 12px rgba(17,24,39,.06)'
};

export default function Dashboard() {
  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Blood Donation Coordination</h1>
      <p style={{ color: '#4b5563', marginBottom: 24 }}>
        Choose an action to get started:
      </p>

      <div style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))'
      }}>
        <Link to="/register" style={card}>
          <h3 style={{ marginTop: 0 }}>Register / Sign Up</h3>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Add a new donor to the database.
          </p>
        </Link>

        <Link to="/requests/new" style={card}>
          <h3 style={{ marginTop: 0 }}>Post Requirement</h3>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Create a blood requirement and view matching donors.
          </p>
        </Link>
      </div>
    </div>
  );
}
