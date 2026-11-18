// FreightIQ Marine :: API client
const FIQ = (function () {
  const BASE = '/FreightIQ-Marine/backend/api/';
  let csrfToken = sessionStorage.getItem('fiq_csrf') || '';

  function setCsrf(token) {
    csrfToken = token;
    sessionStorage.setItem('fiq_csrf', token);
  }

  async function get(endpoint, params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(BASE + endpoint + (qs ? '?' + qs : ''), { credentials: 'same-origin' });
    return handle(res);
  }

  async function post(endpoint, body = {}) {
    const res = await fetch(BASE + endpoint, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, csrf_token: csrfToken }),
    });
    return handle(res);
  }

  async function handle(res) {
    let data;
    try { data = await res.json(); } catch { data = { error: 'Unexpected server response.' }; }
    if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status, data });
    return data;
  }

  return { get, post, setCsrf, get csrfToken() { return csrfToken; } };
})();
