// API Configuration
// Production: Vercel API
const API_BASE_URL = 'https://yellow-card-f.vercel.app';

// For local development, uncomment this line:
// const API_BASE_URL = 'http://localhost:3000';

window.API_CONFIG = {
  baseUrl: API_BASE_URL,
  endpoints: {
    policies: `${API_BASE_URL}/api/policies`,
    verify: `${API_BASE_URL}/api/policies/verify`,
    check: `${API_BASE_URL}/api/policies/check`,
    login: `${API_BASE_URL}/api/auth/login`,
    logout: `${API_BASE_URL}/api/auth/logout`,
    me: `${API_BASE_URL}/api/auth/me`
  }
};
