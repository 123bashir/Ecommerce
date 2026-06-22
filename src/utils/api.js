import { MOCK_CATEGORIES, MOCK_PRODUCTS } from './mockData';
import { getStoredUser } from './session';

export const FILE_BASE_URL = '';

// Helper to simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const apiGet = async (endpoint, params = {}) => {
  await delay();
  console.log(`Mock GET: ${endpoint}`, params);

  if (endpoint.includes('/categories')) return { success: true, data: MOCK_CATEGORIES };

  if (endpoint.includes('/products/totalProduct')) {
    let filteredProducts = [...MOCK_PRODUCTS];
    if (params?.category_id && params.category_id !== 'All') {
      filteredProducts = filteredProducts.filter(p => String(p.category_id) === String(params.category_id));
    }
    if (params?.search) {
      const query = params.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }
    return { success: true, data: filteredProducts };
  }

  if (endpoint.includes('/products/product/')) {
    const id = endpoint.split('/').pop();
    const product = MOCK_PRODUCTS.find(p => String(p.id) === String(id) || String(p.product_id) === String(id));
    return { success: true, data: product };
  }

  if (endpoint.includes('/orders/my-orders') || endpoint.includes('/pickup/my-pickups')) {
    return { success: true, data: [] }; // Mock empty orders
  }

  if (endpoint.includes('/cart')) {
    return { success: true, data: [] }; // Mock empty cart
  }

  return { success: true, data: null };
};

export const apiPost = async (endpoint, body = {}) => {
  await delay();
  console.log(`Mock POST: ${endpoint}`, body);

  if (endpoint.includes('/login')) {
    // Mock successful login for any credentials
    return {
      success: true,
      data: {
        id: 1,
        firstName: 'IB',
        lastName: 'User',
        email: body.email || 'user@example.com',
        token: 'mock-jwt-token'
      }
    };
  }

  if (endpoint.includes('/register')) {
    return { success: true, message: 'User registered successfully' };
  }

  return { success: true, data: body };
};

export const apiPut = async (endpoint, body = {}) => {
  await delay();
  console.log(`Mock PUT: ${endpoint}`, body);
  return { success: true, data: body };
};

export const apiPatch = async (endpoint, body = {}) => {
  await delay();
  console.log(`Mock PATCH: ${endpoint}`, body);
  return { success: true, data: body };
};

export const apiDelete = async (endpoint) => {
  await delay();
  console.log(`Mock DELETE: ${endpoint}`);
  return { success: true, message: 'Deleted successfully' };
};

