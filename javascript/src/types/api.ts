import type { QueryState } from "../browserUtils";

/**
 * 基礎 API 回應型別
 */
export interface BaseApiResponse {
  errorMessage?: string;
}

/**
 * 列表型 API 回應
 * @template T - 列表項目型別
 */
export interface ListApiResponse<T> extends BaseApiResponse {
  itemList: T[];
  totalCount?: number;
  pageSize?: number;
  currentPage?: number;
}

/**
 * 泛用 API 回應型別
 * @template T - 回應資料型別（前端自行定義完整結構）
 */
export type ApiResponse<T = any> = T & BaseApiResponse;

export interface ApiError extends Error {
  isApiError: boolean; // 是否為預期性 API 業務錯誤
  canRetry: boolean; // 是否可重試
  response?: ApiResponse;
  status?: string;
}

export interface ApiConfig {
  staleTime: number;
  cacheTime: number;
  retry: number;
  retryDelay: (attemptIndex: number) => number;
  enabled: boolean;
  treatErrorMessageAsError?: boolean;
  cache?: boolean;
}

export type AvailableHttpMethod =
  | "GET"
  | "POST"
  | "DELETE"
  | "PATCH"
  | "PUT"
  | "OPTION";

export interface QueryOptions<T extends Record<string, any> = {}> {
  baseUrl?: string;
  endpoint: string;
  requestBody?: string | T | FormData;
  method?: AvailableHttpMethod;
  config?: Partial<ApiConfig>;
  fetchOptions?: Partial<RequestInit>;
}

export interface LogOptions {
  bMemNo: string | null;
  type: string;
  message: string;
  message2?: string;
  message3?: string;
  url?: string;
}

export interface ExecuteQueryProps {
  queryState: QueryState;
  baseUrl: string;
  endpoint: string;
  requestBody: string | Record<string, any> | FormData | undefined;
  method: AvailableHttpMethod;
  config: Partial<ApiConfig>;
  fetchOptions: Partial<RequestInit>;
}

export interface TokenResponse {
  token: string;
  tokenExpire: string;
  account: string;
  name: string;
  appNo: string;
  webURL: string;
  bMemNo: string;
  bMemName: string;
  bDate: string;
  uMemNo: string;
  uMemName: string;
  uDate: string;
  checkCode: string;
}
