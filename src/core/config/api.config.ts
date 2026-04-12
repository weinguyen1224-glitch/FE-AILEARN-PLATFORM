const getBaseURL = () => {
  if (process.env.NODE_ENV === 'development') {
    return process.env.DEV_API_URL || 'http://localhost:3000';
  }
  if (process.env.NODE_ENV === 'test') {
    return process.env.TEST_API_URL || 'http://localhost:3000';
  }
  return process.env.PROD_API_URL || 'https://api.production.com';
};

export const API_CONFIG = {
  baseURL: getBaseURL(),
  timeout: 30000,
};

export default API_CONFIG;
