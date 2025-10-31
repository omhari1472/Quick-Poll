// Determine environment: check for Vercel domain or use NODE_ENV
const isProduction = () => {
  // Check if NEXT_PUBLIC_API_URL is set (always use it if provided)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return true;
  }
  
  // Check if we're in browser and on Vercel domain
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return hostname.includes('vercel.app') || hostname.includes('quick-poll');
  }
  
  // Fall back to NODE_ENV (server-side)
  return process.env.NODE_ENV === 'production';
};

// Always prioritize NEXT_PUBLIC_* env vars first, then use defaults based on environment
const config = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 
    (isProduction() 
      ? 'https://poll-backend-py4a.onrender.com/api' 
      : 'http://localhost:8787/api'),
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 
    (isProduction() 
      ? 'https://poll-backend-py4a.onrender.com' 
      : 'http://localhost:8787'),
};

export default config;
