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

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

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

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

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
