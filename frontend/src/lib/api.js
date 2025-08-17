const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001/api/v1';

async function parseJsonSafely(res) {
  const text = await res.text();                      // read once
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { return JSON.parse(text); }
    catch (e) { throw new Error('Invalid JSON from server'); }
  }
  // Not JSON → show first part of the HTML/text so we know what happened
  throw new Error(`Expected JSON, got: ${text.slice(0, 200)}`);
}

export async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await parseJsonSafely(res);
  if (!res.ok) throw new Error(data?.error || res.statusText);
  return data;
}

export { API_BASE };