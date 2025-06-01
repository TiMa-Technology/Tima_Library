import { emptyGuid } from "../baseFunction/utils.js";
import { redirect } from "./navigation.js";
import $ from "jquery";

// 定義通用的 API 回應介面
export interface ApiResponse<T = any> {
  ErrorMessage?: string;
  ItemList?: T[];
  [key: string]: any;
}

// 定義特定的 Token 回應介面，繼承 ApiResponse
export interface TokenResponse extends ApiResponse {
  ErrorMessage?: string;
  Token?: string;
  TokenExpire?: string;
  ItemList?: Array<{ IsInside: string }>;
}

// 定義 Log 參數介面
interface LogOptions {
  bMemNo: string | null;
  type: string;
  message: string;
  message2?: string;
  message3?: string;
  url?: string;
}

// 定義 API 配置介面
interface ApiConfig {
  staleTime: number;
  cacheTime: number;
  retry: number;
  retryDelay: (attemptIndex: number) => number;
  enabled: boolean;
  treatErrorMessageAsError?: boolean;
}

// 定義查詢選項介面
interface QueryOptions {
  baseUrl?: string;
  endpoint: string;
  requestBody: string | Record<string, any>;
  method?: "GET" | "POST";
  config?: Partial<ApiConfig>;
}

// 定義 API 錯誤介面
export interface ApiError extends Error {
  isApiError?: boolean;
  response?: ApiResponse;
  status?: string;
}

/**
 * API 安全與登入管理工具
 * @description 主要負責專案起始請求必須要先取得機碼跟公司專案授權。
 * @description 處理應用帳號登入、API 授權標頭設定、清除 sessionStorage 等功能。
 * @external 需要設定環境變數 `APP_ACCOUNT` `APP_PASSWORD` 取得授權帳密。
 */
export class ApiSecurityHelper {
  /** 從環境變數取得帳號，應從 .env 載入 */
  static appAccount: string = (window as any).APP_ACCOUNT || "";
  /** 從環境變數取得密碼，應從 .env 載入 */
  static appPassword: string = (window as any).APP_PASSWORD || "";

  /**
   * 使用應用帳號登入取得 token
   * @returns {Promise<TokenResponse | null>} Token 資訊或 null（若登入失敗）
   * @throws {ApiError} 若 API 回應包含錯誤訊息
   */
  static async appLogin(): Promise<TokenResponse | null> {
    const data: TokenResponse = await $.ajax({
      type: "GET",
      url: `../api/TM_ApiMgr_App_CheckSsword`,
      data: { account: this.appAccount, ssword: this.appPassword },
      contentType: "application/json",
      dataType: "json",
      async: true,
    });

    if (data.ErrorMessage) {
      throw new Error(data.ErrorMessage);
    }

    return data;
  }

  /**
   * 設定 API 請求的 Authorization header
   * @param url - API URL
   * @returns {Promise<{needsAuth: boolean, authHeader: string | null}>} 是否需要授權及授權標頭
   */
  static async setApiLogin(
    url: string
  ): Promise<{ needsAuth: boolean; authHeader: string | null }> {
    const excludedEndpoints: string[] = [
      "api/TM_ApiMgr_App_CheckSsword",
      "api/TM_ApiMgr_App_GetOne",
      "api/TM_ApiMgr_App_Insert",
    ];

    if (excludedEndpoints.some((endpoint) => url.includes(endpoint))) {
      return { needsAuth: false, authHeader: null };
    }

    const apiToken = sessionStorage.getItem("apitoken");
    const apiTokenTimeout = sessionStorage.getItem("apitokentimeout");

    if (
      apiToken &&
      apiToken !== "" &&
      apiToken !== emptyGuid() &&
      apiTokenTimeout
    ) {
      if (new Date() < new Date(apiTokenTimeout)) {
        const authHeader = "Basic " + btoa(`${this.appAccount}:${apiToken}`);
        return { needsAuth: true, authHeader };
      }
    }

    const token = await this.appLogin();
    if (token?.Token && token?.TokenExpire) {
      sessionStorage.setItem("apitoken", token.Token);
      sessionStorage.setItem("apitokentimeout", token.TokenExpire);
      const authHeader = "Basic " + btoa(`${this.appAccount}:${token.Token}`);
      return { needsAuth: true, authHeader };
    }

    sessionStorage.removeItem("apitoken");
    sessionStorage.removeItem("apitokentimeout");
    return { needsAuth: true, authHeader: null };
  }

  /**
   * 清除所有 sessionStorage 登入相關資訊
   */
  static removeSession(): void {
    const keys: string[] = [
      "memno",
      "ma",
      "memname",
      "currtab",
      "currpage",
      "alist",
      "sessiontimeout",
      "webtimeout",
      "onlinetoken",
      "isinside",
    ];
    keys.forEach((k) => sessionStorage.removeItem(k));
  }

  /**
   * 從伺服器刪除線上紀錄
   * @param bmemno - 使用者編號
   * @returns {Promise<void>}
   */
  static async deleteOnline(bmemno: string): Promise<void> {
    if (!bmemno) return;
    const response: ApiResponse = await $.ajax({
      type: "GET",
      url: "../api/My_Log_DeleteOnline",
      data: { mins: 0, memNo: bmemno },
      contentType: "application/json",
      dataType: "json",
      async: true,
      cache: false,
    });

    if (response.ErrorMessage) {
      console.log(`刪除在線紀錄錯誤: ${response.ErrorMessage}`);
    }
  }

  /**
   * 驗證使用者是否仍在線上（避免被踢出）
   * @returns {Promise<void>}
   */
  static async checkOnline(): Promise<void> {
    const bmemno = sessionStorage.getItem("memno");
    const onlinetoken = sessionStorage.getItem("onlinetoken");
    const p = {
      BMemNo: bmemno,
      LogType: "Online",
      LogMessage: onlinetoken,
      TopN: 1,
    };

    const data: TokenResponse = await $.ajax({
      type: "POST",
      url: "../api/My_Log_GetList",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify(p),
      async: true,
      cache: false,
    });

    if (data.ErrorMessage === "" && data.ItemList?.length) {
      sessionStorage.setItem("isinside", data.ItemList[0].IsInside);
      await InfoLogger.log({
        bMemNo: bmemno,
        type: "Online",
        message: onlinetoken || "",
        message2: "",
        message3: "",
        url: location.href,
      });
    } else {
      this.removeSession();
      redirect("../XFile/Letmein");
      throw new Error("您已在其他設備登入或強迫登出");
    }
  }
}

/**
 * 記錄平台操作資訊的工具
 */
export class InfoLogger {
  /**
   * 取得使用者平台名稱（手機、電腦、iOS 等）
   * @returns {string} 平台名稱
   */
  static getPlatform(): string {
    const ua = navigator.userAgent;
    const navAny = navigator as Navigator & {
      userAgentData?: { platform?: string };
    };
    if (navAny.userAgentData?.platform) return navAny.userAgentData.platform;
    if (/iPhone/i.test(ua)) return "iPhone";
    if (/iPad/i.test(ua)) return "iPad";
    if (/Android/i.test(ua)) return "Android";
    if (/Windows/i.test(ua)) return "Windows";
    if (/Macintosh/i.test(ua)) return "Mac";
    return "PC";
  }

  /**
   * 記錄一筆 Info Log 到伺服器
   * @param options - Log 參數
   * @returns {Promise<void>}
   */
  static async log({
    bMemNo,
    type,
    message,
    message2 = "",
    message3 = "",
    url = location.href,
  }: LogOptions): Promise<void> {
    const p = {
      bmemno: bMemNo,
      type,
      message,
      message2,
      message3,
      url,
      platform: this.getPlatform(),
    };

    const response = await ajaxApi({
      method: "GET",
      endpoint: "My_Log_Info",
      requestBody: p,
    });

    if (response.ErrorMessage) {
      console.error(`記錄 Info Log 錯誤：${response.ErrorMessage}`);
    }
  }
}

/**
 * API 請求狀態管理器
 */
class ApiStateManager {
  cache: Map<string, { data: ApiResponse; timestamp: number }>;
  queries: Map<string, QueryState>;
  defaultConfig: ApiConfig;

  constructor() {
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
    };
  }

  /**
   * 生成快取查詢鍵值
   * @param endpoint - API 端點
   * @param requestBody - 請求參數
   * @param method - HTTP 方法
   * @returns {string} 查詢鍵值
   */
  generateQueryKey(endpoint: string, requestBody: any, method: string): string {
    return `${method}:${endpoint}:${JSON.stringify(requestBody || {})}`;
  }

  /**
   * 檢查快取是否有效
   * @param cacheEntry - 快取條目
   * @param staleTime - 過期時間
   * @returns {boolean} 快取是否有效
   */
  isCacheValid(
    cacheEntry: { data: ApiResponse; timestamp: number } | undefined,
    staleTime: number
  ): boolean {
    if (!cacheEntry) return false;
    return Date.now() - cacheEntry.timestamp < staleTime;
  }

  /**
   * 清理過期的快取
   */
  cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.defaultConfig.cacheTime) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 執行 API 請求
   * @param baseUrl - API 基礎 URL
   * @param endpoint - API 端點
   * @param requestBody - 請求體
   * @param method - HTTP 方法
   * @param options - 配置選項
   * @returns {Promise<ApiResponse>} API 回應
   * @throws {ApiError} 若 API 回應包含錯誤訊息且 shouldThrow 為 true
   */
  async executeRequest(
    baseUrl: string,
    endpoint: string,
    requestBody: string | Record<string, any> | FormData,
    method: "GET" | "POST",
    options: Partial<ApiConfig> = {}
  ): Promise<ApiResponse> {
    const requestUrl = `${baseUrl}/${endpoint}`;
    const isFormData = requestBody instanceof FormData;

    const headers: Record<string, string> = {};
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    await this.prepareAuthHeader(headers, requestUrl);

    const ajaxOptions: JQuery.AjaxSettings = {
      url: requestUrl,
      type: method,
      headers,
      data: isFormData
        ? requestBody
        : method === "GET"
          ? requestBody
          : JSON.stringify(requestBody),
      dataType: "json",
      async: true,
      cache: false,
    };

    if (isFormData) {
      ajaxOptions.processData = false;
      ajaxOptions.contentType = false;
    }

    const response: ApiResponse = await $.ajax(ajaxOptions);

    if (response.ErrorMessage && options.treatErrorMessageAsError !== false) {
      const apiError = new Error(response.ErrorMessage) as ApiError;
      apiError.isApiError = true;
      apiError.response = response;
      apiError.status = "api_error";
      throw apiError;
    }

    return response;
  }

  /**
   * 準備授權認證 header
   * @param headers - 請求標頭
   * @param url - API URL
   * @returns {Promise<boolean>} 是否成功設定授權標頭
   */
  async prepareAuthHeader(
    headers: Record<string, string>,
    url: string
  ): Promise<boolean> {
    const excludedEndpoints: string[] = [
      "api/TM_ApiMgr_App_CheckSsword",
      "api/TM_ApiMgr_App_GetOne",
      "api/TM_ApiMgr_App_Insert",
    ];

    if (excludedEndpoints.some((endpoint) => url.includes(endpoint))) {
      return false;
    }

    const apiToken = sessionStorage.getItem("apitoken");
    const apiTokenTimeout = sessionStorage.getItem("apitokentimeout");

    if (
      apiToken &&
      apiToken !== "" &&
      apiToken !== emptyGuid() &&
      apiTokenTimeout
    ) {
      if (new Date() < new Date(apiTokenTimeout)) {
        headers["Authorization"] =
          "Basic " + btoa(`${ApiSecurityHelper.appAccount}:${apiToken}`);
        return true;
      }
    }

    const token = await ApiSecurityHelper.appLogin();
    if (token?.Token && token?.TokenExpire) {
      sessionStorage.setItem("apitoken", token.Token);
      sessionStorage.setItem("apitokentimeout", token.TokenExpire);
      headers["Authorization"] =
        "Basic " + btoa(`${ApiSecurityHelper.appAccount}:${token.Token}`);
      return true;
    }

    sessionStorage.removeItem("apitoken");
    sessionStorage.removeItem("apitokentimeout");
    return false;
  }
}

const apiStateManager = new ApiStateManager();

/**
 * API 查詢狀態
 */
class QueryState {
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

  /**
   * 更新狀態
   * @param status - 查詢狀態
   * @param data - 查詢數據
   * @param error - 錯誤資訊
   */
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

  /**
   * 通知訂閱者
   */
  notifySubscribers(): void {
    this.subscribers.forEach((callback) => {
      try {
        callback(this.getState());
      } catch (err) {
        console.error("Error in query subscriber:", err);
      }
    });
  }

  /**
   * 獲取當前狀態
   * @returns {object} 當前狀態
   */
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

  /**
   * 訂閱狀態變化
   * @param callback - 狀態變化回調
   * @returns {() => void} 取消訂閱函數
   */
  subscribe(callback: (state: any) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
}

/**
 * 帶狀態管理的 Ajax API 函數
 * @param options - 查詢選項
 * @returns {QueryState} 查詢狀態物件
 */
export function useAjaxApi({
  baseUrl = "../api",
  endpoint,
  requestBody,
  method = "GET",
  config = {},
}: QueryOptions): QueryState {
  const finalConfig = { ...apiStateManager.defaultConfig, ...config };
  const queryKey = apiStateManager.generateQueryKey(
    endpoint,
    requestBody,
    method
  );

  let queryState = apiStateManager.queries.get(queryKey);
  if (!queryState) {
    queryState = new QueryState(queryKey);
    apiStateManager.queries.set(queryKey, queryState);
  }

  const shouldFetch =
    finalConfig.enabled &&
    (queryState.status === "idle" ||
      !apiStateManager.isCacheValid(
        apiStateManager.cache.get(queryKey),
        finalConfig.staleTime
      ));

  if (shouldFetch && !queryState.isFetching) {
    executeQuery(
      queryState,
      baseUrl,
      endpoint,
      requestBody,
      method,
      finalConfig
    ).catch((error) => {
      console.debug("Query execution completed with error:", error.message);
    });
  }

  return queryState;
}

/**
 * 執行查詢
 * @param queryState - 查詢狀態物件
 * @param baseUrl - 基本 API URL
 * @param endpoint - API 端點
 * @param requestBody - 請求參數
 * @param method - HTTP 方法
 * @param config - 配置選項
 * @returns {Promise<ApiResponse>} 查詢結果
 */
async function executeQuery(
  queryState: QueryState,
  baseUrl: string = "../api",
  endpoint: string,
  requestBody: string | Record<string, any> | FormData,
  method: "GET" | "POST",
  config: Partial<ApiConfig> = {}
): Promise<ApiResponse> {
  const queryKey = queryState.queryKey;
  queryState.updateStatus("loading");

  let attempt = 0;
  const maxAttempts = (config.retry ?? 0) + 1;

  while (attempt < maxAttempts) {
    try {
      const data = await apiStateManager.executeRequest(
        baseUrl,
        endpoint,
        requestBody,
        method,
        {
          treatErrorMessageAsError: config.treatErrorMessageAsError,
        }
      );

      apiStateManager.cache.set(queryKey, { data, timestamp: Date.now() });
      queryState.updateStatus("success", data);
      queryState.failureCount = 0;

      return data;
    } catch (error: any) {
      attempt++;
      queryState.failureCount = attempt;

      if (error.status === 401) {
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

/**
 * 簡化版本 - 直接執行 API 請求並返回 Promise
 * @param options - 查詢選項
 * @returns {Promise<ApiResponse>} API 回應
 */
export async function ajaxApi({
  baseUrl = "../api",
  endpoint,
  requestBody,
  method = "GET",
  config = {},
}: QueryOptions): Promise<ApiResponse> {
  const finalConfig = { ...apiStateManager.defaultConfig, ...config };
  let attempt = 0;
  const maxAttempts = finalConfig.retry + 1;

  while (attempt < maxAttempts) {
    try {
      return await apiStateManager.executeRequest(
        baseUrl,
        endpoint,
        requestBody,
        method,
        {
          treatErrorMessageAsError: finalConfig.treatErrorMessageAsError,
        }
      );
    } catch (error: any) {
      attempt++;

      if (error.status === 401) {
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

/**
 * 手動觸發查詢重新執行
 * @param baseUrl - API 基礎 URL
 * @param endpoint - API 端點
 * @param requestBody - 請求參數
 * @param method - HTTP 方法
 * @returns {Promise<ApiResponse>} 查詢結果
 */
export function refetchQuery(
  baseUrl: string = "../api",
  endpoint: string,
  requestBody: string | Record<string, any> | FormData = {},
  method: "GET" | "POST" = "GET"
): Promise<ApiResponse> {
  const queryKey = apiStateManager.generateQueryKey(
    endpoint,
    requestBody,
    method
  );
  const queryState = apiStateManager.queries.get(queryKey);

  if (queryState) {
    return executeQuery(
      queryState,
      baseUrl,
      endpoint,
      requestBody,
      method,
      apiStateManager.defaultConfig
    );
  }

  return Promise.reject(new Error("Query not found"));
}

/**
 * 使查詢無效（標記為過期）
 * @param baseUrl - API 基礎 URL
 * @param endpoint - API 端點
 * @param requestBody - 請求參數
 * @param method - HTTP 方法
 * @returns {Promise<void>} 無回傳值的 Promise
 */
export function invalidateQuery(
  baseUrl: string = "../api",
  endpoint: string,
  requestBody: string | Record<string, any> | FormData = {},
  method: "GET" | "POST" = "GET"
): Promise<void> {
  const queryKey = apiStateManager.generateQueryKey(
    endpoint,
    requestBody,
    method
  );
  apiStateManager.cache.delete(queryKey);

  const queryState = apiStateManager.queries.get(queryKey);
  if (queryState && queryState.status === "success") {
    return executeQuery(
      queryState,
      baseUrl,
      endpoint,
      requestBody,
      method,
      apiStateManager.defaultConfig
    ).then(() => {});
  }

  return Promise.resolve();
}

/**
 * 清除所有快取
 */
export function clearAllCache(): void {
  apiStateManager.cache.clear();
}

/**
 * 設定全域配置
 * @param config - 配置選項
 */
export function setDefaultConfig(config: Partial<ApiConfig>): void {
  Object.assign(apiStateManager.defaultConfig, config);
}

/**
 * 錯誤處理，將 API 錯誤轉換為統一格式
 * @param error - 錯誤物件
 * @returns {object} 格式化的錯誤物件
 */
export function handleApiError(error: unknown): {
  type: "business" | "auth" | "server" | "network";
  message: string;
  showToUser: boolean;
  shouldRetry: boolean;
  action?: string;
} {
  if (typeof error === "object" && error !== null) {
    const err = error as Partial<ApiError> & { status?: number };
    if (err.isApiError) {
      return {
        type: "business",
        message: `操作失敗: ${err.message ?? ""}`,
        showToUser: true,
        shouldRetry: false,
      };
    } else if (err.status === 401) {
      return {
        type: "auth",
        message: "登入已過期，請重新登入",
        showToUser: true,
        shouldRetry: false,
        action: "redirect_login",
      };
    } else if (typeof err.status === "number" && err.status >= 500) {
      return {
        type: "server",
        message: "伺服器暫時無法回應",
        showToUser: true,
        shouldRetry: true,
      };
    }
  }
  return {
    type: "network",
    message: `系統錯誤: ${(error as Error)?.message || "未知錯誤"}`,
    showToUser: true,
    shouldRetry: true,
  };
}

// 定期清理過期快取
setInterval(() => {
  apiStateManager.cleanExpiredCache();
}, 60000);
