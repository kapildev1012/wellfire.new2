import axios from 'axios';

// Create axios instance with optimized defaults
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "https://wellfire-backend-s1qt.onrender.com",
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// In-memory cache for API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache key generator
const getCacheKey = (url, params = {}) => {
  const paramString = Object.keys(params).length > 0 ? JSON.stringify(params) : '';
  return `${url}${paramString}`;
};

// Check if cache entry is still valid
const isCacheValid = (cacheEntry) => {
  return Date.now() - cacheEntry.timestamp < CACHE_DURATION;
};

// Enhanced GET request with caching
const cachedGet = async (url, config = {}) => {
  const cacheKey = getCacheKey(url, config.params);
  
  // Check cache first
  if (cache.has(cacheKey)) {
    const cacheEntry = cache.get(cacheKey);
    if (isCacheValid(cacheEntry)) {
      console.log(`Cache hit for: ${url}`);
      return Promise.resolve(cacheEntry.data);
    } else {
      // Remove expired cache entry
      cache.delete(cacheKey);
    }
  }

  try {
    console.log(`Fetching from API: ${url}`);
    const response = await api.get(url, config);
    
    // Cache successful responses
    if (response.data.success) {
      cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });
    }
    
    return response;
  } catch (error) {
    console.error(`API Error for ${url}:`, error);
    throw error;
  }
};

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Investment products
  getInvestmentProducts: () => cachedGet('/api/investment-product/list'),
  
  // Regular products
  getProducts: () => cachedGet('/api/product/list'),
  
  // User cart
  getUserCart: () => api.get('/api/cart'),
  
  // Reviews
  getProductReviews: (productId) => cachedGet(`/api/review/${productId}`),
  
  // Newsletter
  subscribeNewsletter: (email) => api.post('/api/newsletter/subscribe', { email }),
  
  // Clear cache (useful for forced refresh)
  clearCache: () => {
    cache.clear();
    console.log('API cache cleared');
  },
  
  // Get cache stats
  getCacheStats: () => ({
    size: cache.size,
    keys: Array.from(cache.keys())
  }),

  // Preload critical data
  preloadCriticalData: async () => {
    try {
      const promises = [
        apiService.getInvestmentProducts(),
        apiService.getProducts()
      ];
      
      await Promise.allSettled(promises);
      console.log('Critical data preloaded');
    } catch (error) {
      console.error('Error preloading data:', error);
    }
  }
};

export default api;
