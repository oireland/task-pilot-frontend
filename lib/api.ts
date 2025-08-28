// A helper function to add the auth token to every API request
async function fetcher(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);

  const token = localStorage.getItem("task_pilot_auth_token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    headers,
  });

  // --- IMPROVED ERROR HANDLING ---
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      // First, try to parse the error response as JSON
      const errorData = await response.json();
      // Use the 'message' or 'error' field from the JSON if available
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (jsonError) {
      // If parsing as JSON fails, the error might be plain text
      try {
        const textError = await response.text();
        if (textError) {
          errorMessage = textError;
        }
      } catch (textError) {
        // Ignore if reading as text also fails, fallback to the status code message
      }
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  } else {
    return;
  }
}

// An object that exports convenient methods for each HTTP verb
export const api = {
  get: (url: string) => fetcher(url, { method: "GET" }),
  post: (url: string, body?: any) =>
    fetcher(url, { method: "POST", body: JSON.stringify(body) }),
  postForm: (url: string, formData: FormData) =>
    fetcher(url, { method: "POST", body: formData }),
  put: (url: string, body?: any) =>
    fetcher(url, { method: "PUT", body: JSON.stringify(body) }),
  patch: (url: string, body?: any) =>
    fetcher(url, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (url: string, body?: any) =>
    fetcher(url, { method: "DELETE", body: JSON.stringify(body) }),
};
