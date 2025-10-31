import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import config from '@/config';
import { ApiResponse } from '@/types';

class ApiClient {
  private client: AxiosInstance;
  private sessionId: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: config.API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        if (this.sessionId) {
          config.headers['x-session-id'] = this.sessionId;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        const sessionId = response.headers['x-session-id'];
        if (sessionId && !this.sessionId) {
          this.sessionId = sessionId;
        }
        return response;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  setSessionId(sessionId: string) {
    this.sessionId = sessionId;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();

export const useApiClient = () => {
  return apiClient;
};
