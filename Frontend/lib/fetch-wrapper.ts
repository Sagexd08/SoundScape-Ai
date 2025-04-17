// Improved fetch wrapper for handling API requests with proper error handling
import { toast } from 'sonner';

type FetchMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions extends Omit<RequestInit, 'method' | 'body'> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: any;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  
  // Parse response data based on content type
  let data;
  if (isJson) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  // If response is not ok, throw an error with the data
  if (!response.ok) {
    const error = new Error(
      isJson && data?.message 
        ? data.message 
        : `API request failed with status ${response.status}`
    );
    
    // Attach response data and status to the error
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }

  return data as T;
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
    
    const data = await handleResponse<T>(response);
    
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