import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ✅ After Render deploy, paste your Render URL here:
// Example: 'https://remainder-backend-xxxx.onrender.com'
export const DEPLOYED_BACKEND_URL = 'http://localhost:5000'; // <-- Change this after deploy!

const getApiUrl = () => {
  // If deployed URL is set (not localhost), always use it
  if (!DEPLOYED_BACKEND_URL.includes('localhost')) return DEPLOYED_BACKEND_URL;

  // Use localhost for Web testing
  if (Platform.OS === 'web') return 'http://localhost:5000';
  
  // Dynamically get the IP address from Expo for mobile testing
  const hostUri = Constants?.expoConfig?.hostUri;
  if (hostUri) {
    return `http://${hostUri.split(':')[0]}:5000`;
  }
  
  // Fallback to a hardcoded IP if needed
  return 'http://192.168.1.11:5000';
};

export const API_BASE_URL = getApiUrl();

// Share links always use the deployed public URL
export const SHARE_BASE_URL = DEPLOYED_BACKEND_URL;
