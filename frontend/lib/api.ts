import { API_BASE_URL, ERROR_MESSAGES } from './constants';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ApiCallOptions extends RequestInit {
  endpoint: string;
  includeToken?: boolean;
}

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getToken(): Promise<string | null> {
  try {
    if (typeof window === 'undefined') {
      return null;
    }

    // Better Auth stores session in cookies automatically
    // Try to get token from sessionStorage first (legacy)
    const sessionData = sessionStorage.getItem('auth_session');
    if (sessionData) {
      const session = JSON.parse(sessionData);
      return session.token || null;
    }

    // If not in sessionStorage, token will be sent via cookies automatically
    return null;
  } catch (error) {
    console.error('Failed to get token:', error);
    return null;
  }
}

export async function apiCall<T = unknown>(
  endpoint: string,
  options: Omit<ApiCallOptions, 'endpoint'> = {}
): Promise<T> {
  const { includeToken = true, ...requestOptions } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...requestOptions.headers,
  };

  // Add Bearer token if includeToken is true
  if (includeToken && typeof window !== 'undefined') {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...requestOptions,
      headers,
    });

    const contentType = response.headers.get('content-type');
    let data: unknown;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle 401 Unauthorized
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('auth_session');
        window.location.href = '/signin';
      }
      throw new ApiError(ERROR_MESSAGES.unauthenticated, 401, data);
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      throw new ApiError(ERROR_MESSAGES.unauthorized, 403, data);
    }

    // Handle 404 Not Found
    if (response.status === 404) {
      throw new ApiError(ERROR_MESSAGES.notFound, 404, data);
    }

    // Handle 4xx Client Errors
    if (!response.ok && response.status >= 400 && response.status < 500) {
      const message = typeof data === 'object' && data !== null && 'message' in data
        ? (data as { message: string }).message
        : ERROR_MESSAGES.validationError;
      throw new ApiError(message, response.status, data);
    }

    // Handle 5xx Server Errors
    if (!response.ok && response.status >= 500) {
      throw new ApiError(ERROR_MESSAGES.serverError, response.status, data);
    }

    // Return data if response is ok
    if (response.ok) {
      return data as T;
    }

    throw new ApiError('Unknown error occurred', response.status, data);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new ApiError(ERROR_MESSAGES.networkError, 0, error);
    }

    throw new ApiError(ERROR_MESSAGES.serverError, 500, error);
  }
}

export async function apiGet<T = unknown>(
  endpoint: string,
  options: Omit<ApiCallOptions, 'method' | 'endpoint'> = {}
): Promise<T> {
  return apiCall<T>(endpoint, { ...options, method: 'GET' });
}

export async function apiPost<T = unknown>(
  endpoint: string,
  data?: unknown,
  options: Omit<ApiCallOptions, 'method' | 'endpoint'> = {}
): Promise<T> {
  console.log(`[API] POST ${endpoint}`, data);
  const result = await apiCall<T>(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
  console.log(`[API] POST ${endpoint} response:`, result);
  return result;
}

export async function apiPut<T = unknown>(
  endpoint: string,
  data?: unknown,
  options: Omit<ApiCallOptions, 'method' | 'endpoint'> = {}
): Promise<T> {
  console.log(`[API] PUT ${endpoint}`, data);
  const result = await apiCall<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
  console.log(`[API] PUT ${endpoint} response:`, result);
  return result;
}

export async function apiPatch<T = unknown>(
  endpoint: string,
  data?: unknown,
  options: Omit<ApiCallOptions, 'method' | 'endpoint'> = {}
): Promise<T> {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function apiDelete<T = unknown>(
  endpoint: string,
  options: Omit<ApiCallOptions, 'method' | 'endpoint'> = {}
): Promise<T> {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'DELETE',
  });
}

export { ApiError };
