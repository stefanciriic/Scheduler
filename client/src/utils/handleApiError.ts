interface ApiErrorResponse {
  message?: string;
  errorCode?: string;
  errors?: Record<string, string>;
  error?: string; // Alternative error field
}

interface AxiosErrorResponse {
  response?: {
    data?: ApiErrorResponse | string; // data can be object or string
    status?: number;
    statusText?: string;
  };
  message?: string;
}

const handleApiError = (error: unknown): string => {
    // Log the full error for debugging
    console.error('API Error (full):', JSON.stringify(error, null, 2));
    
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as AxiosErrorResponse;
      
      // Log response for debugging
      if (axiosError.response) {
        console.error('Response Status:', axiosError.response.status);
        console.error('Response Data:', axiosError.response.data);
      }
      
      const data = axiosError.response?.data;
      
      // If data is a string, return it directly
      if (typeof data === 'string') {
        return data;
      }
      
      // If data is an object, check for different error formats
      if (data && typeof data === 'object') {
        // Check for field validation errors (map of field -> error message)
        if (data.errors && Object.keys(data.errors).length > 0) {
          return Object.values(data.errors).join(', ');
        }
        
        // Check for general error message (our ApiErrorResponse format)
        if (data.message && data.message.trim() !== '') {
          return data.message;
        }
        
        // Check for alternative "error" field
        if (data.error && data.error.trim() !== '') {
          return data.error;
        }
      }
      
      // Check for axios error message
      if (axiosError.message && axiosError.message.trim() !== '') {
        return axiosError.message;
      }
      
      // Fallback to status text
      if (axiosError.response?.statusText) {
        return axiosError.response.statusText;
      }
    }
    
    // If error is a string
    if (typeof error === 'string') {
      return error;
    }
  
    return 'An unexpected error occurred. Please try again.';
  };
  
  export default handleApiError;
  