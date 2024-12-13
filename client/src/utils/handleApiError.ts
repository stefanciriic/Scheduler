const handleApiError = (error: unknown): string => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string; errors?: Record<string, string> } } };
  
      if (axiosError.response?.data?.errors) {
        return Object.values(axiosError.response.data.errors).join(' ');
      }
  
      if (axiosError.response?.data?.message) {
        return axiosError.response.data.message;
      }
    }
  
    return 'An unexpected error occurred. Please try again.';
  };
  
  export default handleApiError;
  