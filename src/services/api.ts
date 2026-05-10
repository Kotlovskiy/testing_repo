export interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
}

export class ApiService {
    private baseUrl: string;

    constructor(baseUrl: string = 'http://localhost:5122/api') {
        this.baseUrl = baseUrl;
    }

    private buildUrl(endpoint: string, params?: Record<string, any>): string {
        const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        url.searchParams.set(key, value.join(','));
                    } else {
                        url.searchParams.set(key, String(value));
                    }
                }
            });
        }
        return url.toString();
    }

    async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { method = 'GET', body, headers = {} } = options;

        const requestHeaders: HeadersInit = {
            'Content-Type': 'application/json',
            ...headers
        };

        const config: RequestInit = {
            method,
            headers: requestHeaders
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, config);

        if (!response.ok) {
            let errorMessage = `HTTP error ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch {
                // Ignore parse error
            }
            throw new Error(errorMessage);
        }

        if (response.status === 204) {
            return null as T;
        }

        return response.json();
    }

    async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        return this.request<T>(endpoint + this.buildQueryString(params));
    }

    async post<T>(endpoint: string, body?: any): Promise<T> {
        return this.request<T>(endpoint, { method: 'POST', body });
    }

    async put<T>(endpoint: string, body?: any): Promise<T> {
        return this.request<T>(endpoint, { method: 'PUT', body });
    }

    async delete(endpoint: string): Promise<boolean> {
        await this.request(endpoint, { method: 'DELETE' });
        return true;
    }

    private buildQueryString(params?: Record<string, any>): string {
        if (!params) return '';
        
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    searchParams.set(key, value.join(','));
                } else {
                    searchParams.set(key, String(value));
                }
            }
        });
        
        const queryString = searchParams.toString();
        return queryString ? `?${queryString}` : '';
    }
}

export const apiService = new ApiService();