const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'rmi_auth_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  let data = null;
  const text = await response.text();

  if (text) {
    data = JSON.parse(text);
  }

  if (!response.ok) {
    const message = data?.message || 'Something went wrong. Please try again.';
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function register(data) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function login(data) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getCurrentUser() {
  return request('/auth/me');
}

export function updateProfile(data) {
  return request('/auth/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function getMarketData(filters = {}) {
  const params = new URLSearchParams();

  if (filters.product) params.set('product', filters.product);
  if (filters.location) params.set('location', filters.location);
  if (filters.category) params.set('category', filters.category);

  const query = params.toString();
  return request(`/market-data${query ? `?${query}` : ''}`);
}

export function getMarketDataById(id) {
  return request(`/market-data/${id}`);
}

export function createMarketData(data) {
  return request('/market-data', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateMarketData(id, data) {
  return request(`/market-data/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteMarketData(id) {
  return request(`/market-data/${id}`, {
    method: 'DELETE',
  });
}

export function getDashboardSummary() {
  return request('/analytics/summary');
}

export function getProductAnalytics(product) {
  return request(`/analytics/product/${encodeURIComponent(product)}`);
}

export function getProducts() {
  return request('/analytics/products');
}

export function getListings(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  });
  const query = params.toString();
  return request(`/listings${query ? `?${query}` : ''}`);
}

export function getListing(id) {
  return request(`/listings/${id}`);
}

export function getMyListings() {
  return request('/listings/mine');
}

export function createListing(data) {
  return request('/listings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateListing(id, data) {
  return request(`/listings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteListing(id) {
  return request(`/listings/${id}`, {
    method: 'DELETE',
  });
}

export function createPurchaseRequest(data) {
  return request('/purchase-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getMyPurchaseRequests() {
  return request('/purchase-requests/my');
}

export function getSellingRequests() {
  return request('/purchase-requests/selling');
}

export function updatePurchaseRequestStatus(id, status) {
  return request(`/purchase-requests/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export function askAI(payload) {
  return request('/ai/ask', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getSellAdvice(payload) {
  return request('/ai/sell-advice', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getStockAdvice() {
  return request('/ai/stock-advice', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function getNotifications(skip = 0, limit = 20) {
  const params = new URLSearchParams();
  params.set('skip', skip);
  params.set('limit', limit);
  return request(`/notifications?${params.toString()}`);
}

export function getUnreadNotificationCount() {
  return request('/notifications/unread-count');
}

export function markNotificationAsRead(id) {
  return request(`/notifications/${id}/read`, {
    method: 'PUT',
  });
}

export function markAllNotificationsAsRead() {
  return request('/notifications/read-all', {
    method: 'PATCH',
  });
}
