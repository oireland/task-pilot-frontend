// A helper function to add the auth token to every API request
async function fetcher(url: string, options: RequestInit = {}) {
  // Use the standard Headers object for type safety
  const headers = new Headers(options.headers);

  // Get the token from localStorage and add it to the Authorization header
  const token = localStorage.getItem("task_pilot_auth_token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // THE FIX: Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Request failed with status ${response.status}`
    );
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
  post: (url: string, body: any) =>
    fetcher(url, { method: "POST", body: JSON.stringify(body) }),
  // New method specifically for FormData
  postForm: (url: string, formData: FormData) =>
    fetcher(url, { method: "POST", body: formData }),
  put: (url: string, body: any) =>
    fetcher(url, { method: "PUT", body: JSON.stringify(body) }),
  delete: (url: string) => fetcher(url, { method: "DELETE" }),
};
