import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API Configuration
const API_BASE_URL = __DEV__
  ? process.env.EXPO_PUBLIC_DEV_API_URL || "http://localhost:8000/api"
  : process.env.EXPO_PUBLIC_API_URL || "https://api.mg-mart.com/api";

const API_TIMEOUT = parseInt(
  process.env.EXPO_PUBLIC_API_TIMEOUT || "10000",
  10
);
const TOKEN_KEY = "@mg-mart:auth_token";

// Create axios instance with environment-based configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle 401 unauthorized errors
    if (error.response?.status === 401 && originalRequest) {
      try {
        await AsyncStorage.removeItem(TOKEN_KEY);
        // You can add navigation to login screen here
        // navigationRef.current?.navigate('Login');
      } catch (storageError) {
        console.error("Error removing auth token:", storageError);
      }
    }

    // Transform error for consistent handling
    const errorMessage =
      (error.response?.data as ApiError)?.message ||
      error.message ||
      "An error occurred";
    const transformedError = {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    };

    return Promise.reject(transformedError);
  }
);

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

// Generic API methods
export const api = {
  // GET request
  get: async <T>(url: string): Promise<T> => {
    const response = await apiClient.get<ApiResponse<T>>(url);
    return response.data.data;
  },

  // POST request
  post: async <T>(url: string, data?: any): Promise<T> => {
    const response = await apiClient.post<ApiResponse<T>>(url, data);
    return response.data.data;
  },

  // PUT request
  put: async <T>(url: string, data?: any): Promise<T> => {
    const response = await apiClient.put<ApiResponse<T>>(url, data);
    return response.data.data;
  },

  // DELETE request
  delete: async <T>(url: string): Promise<T> => {
    const response = await apiClient.delete<ApiResponse<T>>(url);
    return response.data.data;
  },
};

// Token management utilities
export const tokenManager = {
  setToken: async (token: string): Promise<void> => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  getToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  removeToken: async (): Promise<void> => {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },
};

export default apiClient;
