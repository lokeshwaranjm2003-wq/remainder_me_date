import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = () => {
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
