const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface FetchOptions extends RequestInit {
  retries?: number; // 재시도 횟수
  timeout?: number; // 타임아웃 (밀리초)
}

// 타임아웃 처리 함수
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = 5000,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw error;
  }
}

// Retry 로직이 포함된 fetch 함수
export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { retries = 3, timeout = 10000, ...fetchOptions } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}${endpoint}`,
        fetchOptions,
        timeout,
      );

      // HTTP 에러 처리
      if (!response.ok) {
        // 401은 재시도 안 함 (토큰 문제)
        if (response.status === 401) {
          const error = new Error("Unauthorized");
          error.name = "UnauthorizedError";
          throw error;
        }

        // 500번대 에러는 재시도
        if (response.status >= 500) {
          throw new Error(`HTTP ${response.status}`);
        }

        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");

      // 401 에러는 바로 던지기 (재시도 안 함!)
      if (lastError.name === "UnauthorizedError") {
        throw lastError;
      }

      // 마지막 시도면 에러 던지기
      if (attempt === retries - 1) {
        throw lastError;
      }

      // Exponential backoff
      const delayMs = 1000 * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}
