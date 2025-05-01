// Improved fetch wrapper for handling API requests with proper error handling
import { toast } from 'sonner';

type FetchMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions extends Omit<RequestInit, 'method' | 'body'> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: any;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';
}

async function handleResponse<T>(response: Response, responseType?: string): Promise<T> {
  // If response is not ok, handle the error
  if (!response.ok) {
    let errorData;
    try {
      // Try to parse error as JSON first
      errorData = await response.json();
    } catch {
      // If not JSON, get as text
      errorData = await response.text();
    }

    const error = new Error(
      typeof errorData === 'object' && errorData?.message
        ? errorData.message
        : `API request failed with status ${response.status}`
    );

    // Attach response data and status to the error
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  // Parse response data based on responseType or content type
  if (responseType) {
    switch (responseType) {
      case 'json':
        return await response.json() as T;
      case 'text':
        return await response.text() as unknown as T;
      case 'blob':
        return await response.blob() as unknown as T;
      case 'arrayBuffer':
        return await response.arrayBuffer() as unknown as T;
      case 'formData':
        return await response.formData() as unknown as T;
      default:
        return await response.json() as T;
    }
  } else {
    // Default behavior based on content type
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (isJson) {
      return await response.json() as T;
    } else {
      return await response.text() as unknown as T;
    }
  }
}

export async function apiFetch<T = any>(
  url: string,
  method: FetchMethod = 'GET',
  options: FetchOptions = {}
): Promise<T> {
  const {
    params,
    body,
    showErrorToast = true,
    showSuccessToast = false,
    successMessage,
    responseType,
    ...fetchOptions
  } = options;

  // Add query parameters to the URL if provided
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    url = `${url}?${searchParams.toString()}`;
  }

  // Prepare headers with defaults
  const headers = new Headers(fetchOptions.headers);
  if (!headers.has('Content-Type') && body && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Prepare request body
  let requestBody: any = undefined;
  if (body) {
    requestBody = body instanceof FormData
      ? body
      : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      method,
      headers,
      body: requestBody,
      // Disable SSR caching for API calls
      next: { revalidate: 0 },
    });

    const data = await handleResponse<T>(response, responseType);

    // Show success toast if requested
    if (showSuccessToast && successMessage) {
      toast.success(successMessage);
    }

    return data;
  } catch (error) {
    // Log error
    console.error(`API ${method} request failed for ${url}:`, error);

    // Show error toast by default
    if (showErrorToast) {
      toast.error('Operation failed', {
        description: error instanceof Error
          ? error.message
          : 'An unexpected error occurred',
      });
    }

    throw error;
  }
}

// Convenience methods for different HTTP verbs
export function get<T = any>(url: string, options?: FetchOptions) {
  return apiFetch<T>(url, 'GET', options);
}

export function post<T = any>(url: string, body?: any, options?: FetchOptions) {
  return apiFetch<T>(url, 'POST', { ...options, body });
}

export function put<T = any>(url: string, body?: any, options?: FetchOptions) {
  return apiFetch<T>(url, 'PUT', { ...options, body });
}

export function patch<T = any>(url: string, body?: any, options?: FetchOptions) {
  return apiFetch<T>(url, 'PATCH', { ...options, body });
}

export function del<T = any>(url: string, options?: FetchOptions) {
  return apiFetch<T>(url, 'DELETE', options);
}