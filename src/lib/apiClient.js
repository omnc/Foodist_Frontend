import { API_URL } from '../config/api';

const CSRF_KEY = 'foodist_csrf';

export function getStoredCsrf() {
  return localStorage.getItem(CSRF_KEY) || '';
}

export function setStoredCsrf(token) {
  if (token) localStorage.setItem(CSRF_KEY, token);
  else localStorage.removeItem(CSRF_KEY);
}

export function authHeaders({ token, json = false, mutating = false } = {}) {
  const headers = {};
  if (json) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  if (mutating) {
    const csrf = getStoredCsrf();
    if (csrf) headers['X-CSRF-Token'] = csrf;
  }
  return headers;
}

/** Fetch wrapper: always send cookies for dual-mode cookie sessions. */
export function apiFetch(path, init = {}) {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  return fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.headers || {}),
    },
  });
}

/** User-facing message for a failed API response; server errors include the request id for log lookup. */
export function describeApiError(response, data, fallback) {
  if (response.status >= 500) {
    const ref = data?.requestId || response.headers.get('X-Request-Id');
    return `Something went wrong on our side. Please try again.${ref ? ` (ref ${ref})` : ''}`;
  }
  return data?.error || fallback;
}
