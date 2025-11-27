import type { QueryState } from "../browserUtils";

export type ApiResponse<T = unknown> = {
  errorMessage?: string;
} & (T extends any[]
  ? { itemList: Partial<T> } & Record<string, unknown> // 多筆資料，附帶其他欄位
  : Partial<T> & Record<string, unknown>); // 單筆資料會散在最外層

export interface ApiError extends Error {
  isApiError?: boolean;
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

export interface QueryOptions {
  baseUrl?: string;
  endpoint: string;
  requestBody: string | Record<string, any> | FormData;
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
  requestBody: string | Record<string, any> | FormData;
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
