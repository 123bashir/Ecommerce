import { getStoredToken, clearStoredUser } from './session';

// Use environment variable or fallback to localhost
// For production, set VITE_API_URL in .env to https://api.almubarakcosmetics.com.ng/api
const API_BASE_URL = (import.meta.env.VITE_API_URL || "https://api.almubarakcosmetics.com.ng/api").replace(/\/$/, '');

export const FILE_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

const buildUrl = (endpoint, params = {}) => {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(`${API_BASE_URL}${normalizedEndpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    url.searchParams.append(key, value);
  });
  return url.toString();
};

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (response.status === 401 || response.status === 403) {
    const message = payload?.message || (typeof payload === 'string' ? payload : 'Unauthorized');
    
    // Only redirect and clear user if NOT on the login page
    // and if it's not a login-related error
    if (window.location.pathname !== '/login') {
      clearStoredUser();
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    
    // If we are already on login page, just throw the actual error message
    throw new Error(message);
  }

  if (!response.ok) {
    // Handle both success: false format and direct error messages
    const message = payload?.message || (typeof payload === 'string' ? payload : 'Request failed');
    throw new Error(message);
  }
  // Return the payload directly (backend returns { success: true, data: {...} } or { success: true, message: "..." })
  return payload;
};

const withAuthHeaders = (headers = {}) => {
  const token = getStoredToken();
  if (!token) return headers;
  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
};

export const apiGet = async (endpoint, params = {}, options = {}) => {
  const url = buildUrl(endpoint, params);
  const mergedHeaders = withAuthHeaders(options.headers);
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    ...options,
    headers: mergedHeaders,
  });
  return parseResponse(response);
};

export const apiPost = async (endpoint, body = {}, options = {}) => {
  const url = buildUrl(endpoint);
  const isFormData = body instanceof FormData;

  const headers = {
    ...withAuthHeaders(options.headers),
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    ...options,
    headers,
    body: isFormData ? body : JSON.stringify(body),
  });
  return parseResponse(response);
};

export const apiPut = async (endpoint, body = {}, options = {}) => {
  const url = buildUrl(endpoint);
  const isFormData = body instanceof FormData;

  const headers = {
    ...withAuthHeaders(options.headers),
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method: 'PUT',
    credentials: 'include',
    ...options,
    headers,
    body: isFormData ? body : JSON.stringify(body),
  });
  return parseResponse(response);
};

export const apiPatch = async (endpoint, body = {}, options = {}) => {
  const url = buildUrl(endpoint);
  const isFormData = body instanceof FormData;

  const headers = {
    ...withAuthHeaders(options.headers),
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method: 'PATCH',
    credentials: 'include',
    ...options,
    headers,
    body: isFormData ? body : JSON.stringify(body),
  });
  return parseResponse(response);
};

export const apiDelete = async (endpoint, options = {}) => {
  const url = buildUrl(endpoint);
  const mergedHeaders = {
    'Content-Type': 'application/json',
    ...withAuthHeaders(options.headers),
  };
  const response = await fetch(url, {
    method: 'DELETE',
    credentials: 'include',
    ...options,
    headers: mergedHeaders,
  });
  return parseResponse(response);
};

