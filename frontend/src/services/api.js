const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8080';
const ASSET_ORIGIN = import.meta.env.VITE_ASSET_ORIGIN || API_ORIGIN;
const API_BASE_URL = `${API_ORIGIN}/api`;

export function getAssetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/assets/')) return path;
  if (path.startsWith('/uploads/')) return `${ASSET_ORIGIN}${path}`;
  return `${ASSET_ORIGIN}/uploads/${path}`;
}

function getToken() {
  return localStorage.getItem('sifr_token');
}

let refreshPromise = null;

async function attemptRefresh() {
  const refreshToken = localStorage.getItem('sifr_refresh_token');
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).then(async (res) => {
      if (!res.ok) throw new Error('Refresh failed');
      return res.json();
    }).then((data) => {
      localStorage.setItem('sifr_token', data.token);
      localStorage.setItem('sifr_refresh_token', data.refreshToken);
      return data.token;
    }).catch(() => {
      localStorage.removeItem('sifr_token');
      localStorage.removeItem('sifr_refresh_token');
      localStorage.removeItem('sifr_user');
      window.dispatchEvent(new Event('auth-cleared'));
      return null;
    }).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401 && token && !endpoint.includes('/auth/refresh')) {
    const newToken = await attemptRefresh();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

async function uploadRequest(endpoint, formData) {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (res.status === 401 && token && !endpoint.includes('/auth/refresh')) {
    const newToken = await attemptRefresh();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Upload failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
  upload: (endpoint, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadRequest(endpoint, formData);
  },
};
