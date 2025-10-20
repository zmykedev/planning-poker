import useStore from '../store';

// Store original fetch
const originalFetch = window.fetch;

// Create intercepted fetch
const interceptedFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const response = await originalFetch(input, init);

  // Check for status 498 and handle logout
  if (!response.ok && response.status === 498) {
    console.warn('🔒 Status 498 detected globally, logging out...', {
      status: response.status,
      url: response.url,
      method: init?.method || 'GET',
    });

    // Clear session and redirect to login
    const { logout } = useStore.getState();
    logout();

    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  return response;
};

// Replace global fetch with intercepted version
export const setupAuthInterceptor = () => {
  if (typeof window !== 'undefined') {
    window.fetch = interceptedFetch;
  }
};

// Function to restore original fetch (useful for cleanup)
export const teardownAuthInterceptor = () => {
  if (typeof window !== 'undefined') {
    window.fetch = originalFetch;
  }
};
