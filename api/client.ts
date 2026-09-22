import axios, { InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';

const API_URL = Platform.OS === 'web' 
  ? 'http://localhost:3001/api' 
  : 'http://192.168.100.131:3001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    console.log(`[Axios] Petición a: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: any) => Promise.reject(error)
);

export default apiClient;