import { getAuthToken, clearAuthData } from '../utils/crypto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      console.log('API Service initialized, backend URL:', API_BASE_URL);
      // Load encrypted token on initialization
      this.token = getAuthToken();
      console.log('🔑 Token loaded from encrypted storage:', !!this.token);
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        // The encryption module handles this, but we'll keep for compatibility
        localStorage.setItem('token', token);
        console.log('🔑 Token saved');
      } else {
        clearAuthData();
        console.log('🔑 Token cleared');
      }
    }
  }

  // ─── Private: shared request handler (protected routes) ────────────────────

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Get token from encrypted storage
    let token = this.token || getAuthToken();

    console.log(`🌐 [${options.method || 'GET'}] ${url}`);
    console.log(`🔑 Has token: ${!!token}`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔐 Authorization header added');
    } else {
      console.warn('⚠️ No token found for authenticated request');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`📡 ${response.status} ${response.statusText}`);

      // 401 → clear ALL stored auth data and redirect to login
      if (response.status === 401) {
        console.error('🔒 Unauthorized - Token may be expired');
        if (typeof window !== 'undefined') {
          clearAuthData();
          window.location.href = '/login';
        }
        throw new Error('Session expired. Please log in again.');
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        console.error('🚫 Forbidden - Insufficient permissions');
        const errorData = await response.text();
        console.error('Error details:', errorData);
        throw new Error('You do not have permission to access this resource');
      }

      if (response.status === 204) return null;

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(
          data.error || data.message || `Request failed: ${response.status} ${response.statusText}`
        );
      }

      return data;
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('❌ Request timed out');
          throw new Error('Request timed out. Please try again.');
        }
        console.error('❌ API Error:', error.message);
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }

  // ─── Private: public (no-auth) request handler ─────────────────────────────

  private async requestPublic(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;

    console.log(`🌐 [PUBLIC ${options.method || 'GET'}] ${url}`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`📡 ${response.status} ${response.statusText}`);

      if (response.status === 204) return null;

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(
          data.error || data.message || `Request failed: ${response.status} ${response.statusText}`
        );
      }

      return data;
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') throw new Error('Request timed out. Please try again.');
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /** GET — no auth (e.g. fetch plans on homepage) */
  getPublic(endpoint: string): Promise<any> {
    return this.requestPublic(endpoint, { method: 'GET' });
  }

  /** POST — no auth (e.g. login, register) */
  postPublic(endpoint: string, body: Record<string, unknown>): Promise<any> {
    return this.requestPublic(endpoint, { method: 'POST', body: JSON.stringify(body) });
  }

  /** GET — requires auth */
  get(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: 'GET' });
  }

  /** POST — requires auth */
  post(endpoint: string, body: Record<string, unknown>): Promise<any> {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
  }

  /** PUT — requires auth */
  put(endpoint: string, body: Record<string, unknown>): Promise<any> {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  }

  /** PATCH — requires auth (partial updates) */
  patch(endpoint: string, body: Record<string, unknown>): Promise<any> {
    return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
  }

  /** DELETE — requires auth */
  delete(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();
export default apiService;