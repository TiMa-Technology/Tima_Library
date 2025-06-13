import type {
  ApiConfig,
  ApiError,
  ApiResponse,
  AvailableHttpMethod,
  ExecuteQueryProps,
  QueryOptions,
} from "../../types/api";
import { AppAuthorization } from "../auth/auth";
import { simpleHash } from "../baseFunction/utils";

export class ApiStateManager {
  private cache: Map<string, { data: ApiResponse; timestamp: number }>;
  private queries: Map<string, QueryState>;
  private defaultConfig: ApiConfig;
  private auth: AppAuthorization;

  constructor(appAccount: string, appPassword: string) {
    this.cache = new Map();
    this.queries = new Map();
    this.defaultConfig = {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 0,
      retryDelay: (attemptIndex: number) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
      enabled: true,
      treatErrorMessageAsError: true,
      cache: true,
    };
    this.auth = new AppAuthorization(appAccount, appPassword);
  }

  generateQueryKey(endpoint: string, requestBody: any, method: string): string {
    const bodyHash = requestBody ? simpleHash(JSON.stringify(requestBody)) : "";
    return `${method}:${endpoint}:${bodyHash}`;
  }

  public getQuery(queryKey: string): QueryState | undefined {
    return this.queries.get(queryKey);
  }

  public setCache(queryKey: string, data: ApiResponse): void {
    this.cache.set(queryKey, { data, timestamp: Date.now() });
  }

  isCacheValid(
    cacheEntry: { data: ApiResponse; timestamp: number } | undefined,
    staleTime: number
  ): boolean {
    if (!cacheEntry) return false;
    return Date.now() - cacheEntry.timestamp < staleTime;
  }

  cleanExpiredCache(maxSize: number = 100): void {
    const now = Date.now();
    const cacheSize = this.cache.size;

    if (cacheSize > maxSize) {
      const sortedEntries = Array.from(this.cache.entries()).sort(
        (a, b) => a[1].timestamp - b[1].timestamp
      );
      const entriesToRemove = sortedEntries.slice(0, cacheSize - maxSize);
      entriesToRemove.forEach(([key]) => this.cache.delete(key));
    }

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.defaultConfig.cacheTime) {
        this.cache.delete(key);
      }
    }
  }

  async executeRequest(
    baseUrl: string,
    endpoint: string,
    requestBody: string | Record<string, any> | FormData,
    method: AvailableHttpMethod,
    options: Partial<ApiConfig> = {},
    fetchOptions: Partial<RequestInit> = {}
  ): Promise<ApiResponse> {
    const buildUrlWithParams = (url: string, params: Record<string, any>) => {
      const usp = new URLSearchParams(params).toString();
      return usp ? `${url}?${usp}` : url;
    };
    let requestUrl = `${baseUrl}/${endpoint}`;
    if (method === "GET" && requestBody && typeof requestBody === "object") {
      requestUrl = buildUrlWithParams(requestUrl, requestBody);
    }
    const isFormData = requestBody instanceof FormData;

    const headers: Record<string, string> = {};
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    await this.auth.prepareAuthHeader(headers, requestUrl);

    const defaultFetchOptions: RequestInit = {
      method,
      headers,
      body: isFormData
        ? requestBody
        : method === "GET"
          ? undefined
          : JSON.stringify(requestBody),
      cache: "no-store",
      credentials: "same-origin",
      mode: "cors",
    };

    const finalFetchOptions = {
      ...defaultFetchOptions,
      ...fetchOptions,
      headers: { ...defaultFetchOptions.headers, ...fetchOptions.headers },
    };

    const response = await fetch(requestUrl, finalFetchOptions);
    const data: ApiResponse = await response.json();

    if (!response.ok) {
      const apiError = new Error(
        data?.errorMessage || "API 請求失敗"
      ) as ApiError;
      apiError.isApiError = true;
      apiError.response = data;
      apiError.status = response.status.toString();
      throw apiError;
    }

    if (data?.errorMessage && options.treatErrorMessageAsError) {
      const apiError = new Error(data.errorMessage) as ApiError;
      apiError.isApiError = true;
      apiError.response = data;
      apiError.status = "api_error";
      throw apiError;
    }

    return data;
  }

  getDefaultConfig(): ApiConfig {
    return { ...this.defaultConfig };
  }

  setDefaultConfig(config: Partial<ApiConfig>): void {
    Object.assign(this.defaultConfig, config);
  }

  // 清理機制
  public cleanup(): void {
    this.queries.forEach((query) => {
      query.subscribers.clear();
    });
    this.queries.clear();
    this.cache.clear();
  }
}

export class QueryState {
  queryKey: string;
  status: "idle" | "loading" | "success" | "error";
  data: ApiResponse | null;
  error: any;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isFetching: boolean;
  failureCount: number;
  subscribers: Set<(state: any) => void>;
  lastUpdated: number | null;

  constructor(queryKey: string) {
    this.queryKey = queryKey;
    this.status = "idle";
    this.data = null;
    this.error = null;
    this.isLoading = false;
    this.isError = false;
    this.isSuccess = false;
    this.isFetching = false;
    this.failureCount = 0;
    this.subscribers = new Set();
    this.lastUpdated = null;
  }

  updateStatus(
    status: "idle" | "loading" | "success" | "error",
    data: ApiResponse | null = null,
    error: any = null
  ): void {
    this.status = status;
    this.isLoading = status === "loading";
    this.isError = status === "error";
    this.isSuccess = status === "success";
    this.isFetching = status === "loading";

    if (data !== null) {
      this.data = data;
      this.lastUpdated = Date.now();
    }

    if (error !== null) {
      this.error = error;
    }

    this.notifySubscribers();
  }

  notifySubscribers(): void {
    this.subscribers.forEach((callback) => {
      try {
        callback(this.getState());
      } catch (err) {
        console.error("Error in query subscriber:", err);
      }
    });
  }

  getState(): {
    status: "idle" | "loading" | "success" | "error";
    data: ApiResponse | null;
    error: any;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    isFetching: boolean;
    failureCount: number;
    lastUpdated: number | null;
  } {
    return {
      status: this.status,
      data: this.data,
      error: this.error,
      isLoading: this.isLoading,
      isError: this.isError,
      isSuccess: this.isSuccess,
      isFetching: this.isFetching,
      failureCount: this.failureCount,
      lastUpdated: this.lastUpdated,
    };
  }

  subscribe(callback: (state: any) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
}

export function createApiStateManager(appAccount: string, appPassword: string) {
  return new ApiStateManager(appAccount, appPassword);
}

export async function ajaxApi(
  apiStateManager: ApiStateManager,
  {
    baseUrl = "../api",
    endpoint,
    requestBody,
    method = "GET",
    config = {},
    fetchOptions = {},
  }: QueryOptions
): Promise<ApiResponse> {
  const finalConfig = { ...apiStateManager.getDefaultConfig(), ...config };
  let attempt = 0;
  const maxAttempts = finalConfig.retry + 1;

  while (attempt < maxAttempts) {
    try {
      if (!endpoint) throw new Error("無提供 API 端點");

      return await apiStateManager.executeRequest(
        baseUrl,
        endpoint,
        requestBody,
        method,
        {
          treatErrorMessageAsError: finalConfig.treatErrorMessageAsError,
        },
        fetchOptions
      );
    } catch (error: any) {
      attempt++;

      if (error.status === "401") {
        sessionStorage.removeItem("apitoken");
        sessionStorage.removeItem("apitokentimeout");
      } else if (error.isApiError) {
        throw error;
      }

      if (attempt < maxAttempts && !error.isApiError) {
        const delay = finalConfig.retryDelay(attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  throw new Error("Unexpected error: Max attempts reached");
}

export function useAjaxApi(
  apiStateManager: ApiStateManager,
  {
    baseUrl = "../api",
    endpoint,
    requestBody,
    method = "GET",
    config = {},
    fetchOptions = {},
  }: QueryOptions
): QueryState {
  const finalConfig = { ...apiStateManager.getDefaultConfig(), ...config };
  const queryKey = apiStateManager.generateQueryKey(
    endpoint,
    requestBody,
    method
  );

  let queryState = apiStateManager["queries"].get(queryKey);
  if (!queryState) {
    queryState = new QueryState(queryKey);
    apiStateManager["queries"].set(queryKey, queryState);
  }

  const shouldFetch =
    finalConfig.enabled &&
    (queryState.status === "idle" ||
      !apiStateManager.isCacheValid(
        apiStateManager["cache"].get(queryKey),
        finalConfig.staleTime
      ));

  if (shouldFetch && !queryState.isFetching) {
    executeQuery(apiStateManager, {
      queryState,
      baseUrl,
      endpoint,
      requestBody,
      method,
      config: finalConfig,
      fetchOptions,
    }).catch((error) => {
      console.debug("Query execution completed with error:", error.message);
    });
  }

  return queryState;
}

async function executeQuery(
  apiStateManager: ApiStateManager,
  {
    queryState,
    baseUrl,
    endpoint,
    requestBody,
    method,
    config,
    fetchOptions = {},
  }: ExecuteQueryProps
): Promise<ApiResponse> {
  const queryKey = queryState.queryKey;
  queryState.updateStatus("loading");

  let attempt = 0;
  const maxAttempts = (config.retry ?? 0) + 1;

  while (attempt < maxAttempts) {
    try {
      if (!endpoint) throw new Error("無提供 API 端點");
      const data = await apiStateManager.executeRequest(
        baseUrl,
        endpoint,
        requestBody,
        method,
        {
          treatErrorMessageAsError: config.treatErrorMessageAsError,
        },
        fetchOptions
      );

      if (config.cache !== false) {
        apiStateManager["cache"].set(queryKey, { data, timestamp: Date.now() });
      }
      queryState.updateStatus("success", data);
      queryState.failureCount = 0;

      return data;
    } catch (error: any) {
      attempt++;
      queryState.failureCount = attempt;

      if (error.status === "401") {
        sessionStorage.removeItem("apitoken");
        sessionStorage.removeItem("apitokentimeout");
      } else if (error.isApiError) {
        queryState.updateStatus("error", null, error);
        throw error;
      }

      if (attempt < maxAttempts && !error.isApiError) {
        const delay = config.retryDelay?.(attempt - 1) ?? 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      queryState.updateStatus("error", null, error);
      throw error;
    }
  }

  throw new Error("Unexpected error: Max attempts reached");
}

export function refetchQuery(
  apiStateManager: ApiStateManager,
  {
    baseUrl = "../api",
    endpoint,
    requestBody = {},
    method = "GET",
    config = {},
    fetchOptions = {},
  }: QueryOptions
): Promise<ApiResponse> {
  const finalConfig = { ...apiStateManager.getDefaultConfig(), ...config };
  const queryKey = apiStateManager.generateQueryKey(
    endpoint,
    requestBody,
    method
  );
  const queryState = apiStateManager["queries"].get(queryKey);

  if (queryState) {
    return executeQuery(apiStateManager, {
      queryState,
      baseUrl,
      endpoint,
      requestBody,
      method,
      config: finalConfig,
      fetchOptions,
    });
  }

  return Promise.reject(new Error("Query not found"));
}

export async function invalidateQuery(
  apiStateManager: ApiStateManager,
  {
    baseUrl = "../api",
    endpoint,
    requestBody = {},
    method = "GET",
    config = {},
    fetchOptions = {},
  }: QueryOptions
): Promise<void> {
  const finalConfig = { ...apiStateManager.getDefaultConfig(), ...config };
  const queryKey = apiStateManager.generateQueryKey(
    endpoint,
    requestBody,
    method
  );

  apiStateManager["cache"].delete(queryKey);

  const queryState = apiStateManager["queries"].get(queryKey);
  if (queryState && queryState.status === "success" && finalConfig.enabled) {
    return executeQuery(apiStateManager, {
      queryState,
      baseUrl,
      endpoint,
      requestBody,
      method,
      config: finalConfig,
      fetchOptions,
    }).then(() => {});
  }

  return Promise.resolve();
}

export function clearAllCache(apiStateManager: ApiStateManager): void {
  apiStateManager["cache"].clear();
}

export function setDefaultConfig(
  apiStateManager: ApiStateManager,
  config: Partial<ApiConfig>
): void {
  apiStateManager.setDefaultConfig(config);
}

// 定期清理過期快取
export function cleanCacheInterval(apiStateManager: ApiStateManager) {
  setInterval(() => {
    apiStateManager.cleanExpiredCache();
  }, 60000);
}
