const API_URL = import.meta.env.VITE_API_URL || '/api';
const DEFAULT_TIMEOUT_MS = 15000; // 15s timeout per request

/**
 * Core API request with timeout, automatic JSON handling, and error normalization.
 * @param {string} path - API path relative to API_URL
 * @param {RequestInit & { timeout?: number }} options
 */
export async function apiRequest(path, options = {}) {
  const { timeout = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;

  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeout);

  const headers = {
    'X-Requested-With': 'XMLHttpRequest',
    ...(fetchOptions.body ? { 'Content-Type': 'application/json' } : {}),
    ...(fetchOptions.headers || {})
  };

  try {
    const response = await fetch(`${API_URL}${path}`, {
      credentials: 'include',
      ...fetchOptions,
      headers,
      signal: controller.signal
    });

    clearTimeout(timerId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    clearTimeout(timerId);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('Request timed out. Please try again.');
      timeoutErr.status = 408;
      throw timeoutErr;
    }
    throw err;
  }
}

export const postJson = (path, body, options = {}) =>
  apiRequest(path, { method: 'POST', body: JSON.stringify(body), ...options });

export const patchJson = (path, body, options = {}) =>
  apiRequest(path, { method: 'PATCH', body: JSON.stringify(body), ...options });

export const deleteJson = (path, options = {}) =>
  apiRequest(path, { method: 'DELETE', ...options });

export default apiRequest;