import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { config, getApiTimeout, getTokenKey, isFeatureEnabled } from "@/config";

// Request headers
export const getDefaultHeaders = (token?: string) => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  ...(token && { Authorization: `Bearer ${token}` }),
});

// API configuration using centralized config
export const getApiConfig = () => ({
  baseURL: config.environment.API_BASE_URL,
  timeout: getApiTimeout(),
  retryAttempts: config.api.RETRY_ATTEMPTS,
  retryDelay: config.api.RETRY_DELAY,
  enableLogging: isFeatureEnabled("ENABLE_API_LOGGING"),
});

const apiConfig = getApiConfig();

// Create axios instance with centralized configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (requestConfig) => {
    try {
      const token = await AsyncStorage.getItem(getTokenKey());
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }

      // Log API calls if logging is enabled
      if (apiConfig.enableLogging) {
        console.log(
          `🌐 API ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`
        );
        if (requestConfig.data) {
          console.log("📤 Request data:", requestConfig.data);
        }
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
    }
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses if logging is enabled
    if (apiConfig.enableLogging) {
      console.log(`✅ API Response ${response.status}:`, response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle 401 unauthorized errors
    if (error.response?.status === 401 && originalRequest) {
      console.log('🚨 401 Unauthorized - Token expired or invalid');
      try {
        await AsyncStorage.removeItem(getTokenKey());

        // Clear auth state in store
        try {
          const { useAuthStore } = await import('../stores/authStore');
          useAuthStore.getState().logout();
          console.log('✅ Auth state cleared due to 401 error');
        } catch (storeError) {
          console.error('Error clearing auth store:', storeError);
        }
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
    const response = await apiClient.get(url);

    // Handle different response formats
    if (response.data && typeof response.data === "object") {
      // If response has a 'data' property, use it
      if ("data" in response.data) {
        return response.data.data;
      }
      // Otherwise, return the response data directly
      return response.data;
    }

    return response.data;
  },

  // POST request
  post: async <T>(url: string, data?: any): Promise<T> => {
    const response = await apiClient.post(url, data);

    // Handle different response formats
    if (response.data && typeof response.data === "object") {
      // If response has a 'data' property, use it
      if ("data" in response.data) {
        return response.data.data;
      }
      // Otherwise, return the response data directly
      return response.data;
    }

    return response.data;
  },

  // PUT request
  put: async <T>(url: string, data?: any): Promise<T> => {
    const response = await apiClient.put(url, data);

    // Handle different response formats
    if (response.data && typeof response.data === "object") {
      // If response has a 'data' property, use it
      if ("data" in response.data) {
        return response.data.data;
      }
      // Otherwise, return the response data directly
      return response.data;
    }

    return response.data;
  },

  // DELETE request
  delete: async <T>(url: string): Promise<T> => {
    const response = await apiClient.delete(url);

    // Handle different response formats
    if (response.data && typeof response.data === "object") {
      // If response has a 'data' property, use it
      if ("data" in response.data) {
        return response.data.data;
      }
      // Otherwise, return the response data directly
      return response.data;
    }

    return response.data;
  },
};

// Token management utilities using centralized configuration
export const tokenManager = {
  setToken: async (token: string): Promise<void> => {
    await AsyncStorage.setItem(getTokenKey(), token);
  },

  getToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem(getTokenKey());
  },

  removeToken: async (): Promise<void> => {
    await AsyncStorage.removeItem(getTokenKey());
  },
};

export default apiClient;
