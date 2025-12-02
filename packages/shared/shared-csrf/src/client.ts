import type {CsrfTokenResponse} from "./types.js";

export const DEFAULT_CSRF_COOKIE_NAME = "__csrf";

export const DEFAULT_CSRF_HEADER_NAME = "x-csrf-token";

export const DEFAULT_CSRF_FIELD_NAME = "_csrf";

export async function fetchCsrfToken(
  apiBaseUrl = "http://localhost:3001",
): Promise<string> {
  const baseUrl = apiBaseUrl.replace(/\/$/, "");

  try {
    const response = await fetch(`${baseUrl}/api/csrf`, {
      method: "GET",
      credentials: "include", // Include cookies for session
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${String(response.status)}`);
    }

    const data = (await response.json()) as CsrfTokenResponse;
    return data.csrfToken;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get CSRF token: ${errorMessage}`);
  }
}

export function getCsrfTokenFromCookie(
  cookieName = DEFAULT_CSRF_COOKIE_NAME,
): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === cookieName && value !== undefined) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

export function addCsrfToFormData(
  formData: FormData,
  token: string,
  fieldName = DEFAULT_CSRF_FIELD_NAME,
): void {
  formData.set(fieldName, token);
}

export function addCsrfToHeaders(
  headers: HeadersInit,
  token: string,
  headerName = DEFAULT_CSRF_HEADER_NAME,
): HeadersInit {
  return {
    ...(headers as Record<string, string>),
    [headerName]: token,
  };
}

export function createCsrfHiddenInput(
  token: string,
  fieldName = DEFAULT_CSRF_FIELD_NAME,
): HTMLInputElement {
  if (typeof document === "undefined") {
    throw new TypeError(
      "createCsrfHiddenInput can only be used in browser environment",
    );
  }

  const input = document.createElement("input");
  input.type = "hidden";
  input.name = fieldName;
  input.value = token;
  return input;
}

export async function initCsrfProtection(
  form: HTMLFormElement,
  apiBaseUrl?: string,
  fieldName = DEFAULT_CSRF_FIELD_NAME,
): Promise<void> {
  try {
    const token = await fetchCsrfToken(apiBaseUrl);

    const existingCsrfInputs = form.querySelectorAll(
      `input[name="${fieldName}"]`,
    );
    for (const input of existingCsrfInputs) {
      input.remove();
    }

    const csrfInput = createCsrfHiddenInput(token, fieldName);
    form.appendChild(csrfInput);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to initialize CSRF protection: ${errorMessage}`);
  }
}

export async function csrfFetch(
  url: string,
  options: RequestInit = {},
  apiBaseUrl?: string,
  headerName = DEFAULT_CSRF_HEADER_NAME,
): Promise<Response> {
  try {
    const token = await fetchCsrfToken(apiBaseUrl);

    const headers = addCsrfToHeaders(options.headers ?? {}, token, headerName);

    return await fetch(url, {
      ...options,
      credentials: "include", // Include cookies
      headers,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`CSRF-protected fetch failed: ${errorMessage}`);
  }
}

export async function handleCsrfError(
  error: Error,
  retryCallback: (newToken: string) => Promise<void>,
  apiBaseUrl?: string,
): Promise<void> {
  const errorMessage = error.message.toLowerCase();
  const csrfErrorIndicators = ["csrf", "forbidden", "403"];

  if (
    csrfErrorIndicators.some((indicator) => errorMessage.includes(indicator))
  ) {
    try {
      const newToken = await fetchCsrfToken(apiBaseUrl);
      await retryCallback(newToken);
    } catch (retryError) {
      const retryErrorMessage =
        retryError instanceof Error ? retryError.message : String(retryError);
      throw new Error(
        `Failed to retry with new CSRF token: ${retryErrorMessage}`,
      );
    }
  } else {
    throw error;
  }
}
