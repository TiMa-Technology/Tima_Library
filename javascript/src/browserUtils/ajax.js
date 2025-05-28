"use strict";

import { emptyGuid } from "../baseFunction/utils.js";
import { redirect } from "./index.js";
import * as $ from "jquery";

/**
 * API 安全與登入管理工具
 */
export class ApiSecurityHelper {
  /** //!從 `web.config` 取得, 暫時會先透過 `.chtml` 設定在全域，須改為透過 `.env` */
  static appAccount = window.APP_ACCOUNT || "defaultAccount";
  /** //!從 `web.config` 取得, 暫時會先透過 `.chtml` 設定在全域，須改為透過 `.env` */
  static appPassword = window.APP_PASSWORD || "defaultPassword";

  /**
   * 使用應用帳號登入取得 token
   * @returns {Promise<object|null>} token 資訊或 null
   */
  static async appLogin() {
    let token = null;
    const data = await $.ajax({
      type: "GET",
      url: `../api/TM_ApiMgr_App_CheckSsword`,
      data: { account: this.appAccount, ssword: this.appPassword },
      contentType: "application/json",
      dataType: "json",
      async: true,
    });

    if (!data.ErrorMessage) token = data;
    else alert(data.ErrorMessage);

    return token;
  }

  /**
   * 設定 API 請求的 Authorization header
   * @param {string} url - API URL
   * @returns {Promise<{needsAuth: boolean, authHeader: string|null}>}
   */
  static async setApiLogin(url) {
    // 排除特定 API 路徑，不需要設置 Authorization header
    const excludedEndpoints = [
      "api/TM_ApiMgr_App_CheckSsword",
      "api/TM_ApiMgr_App_GetOne",
      "api/TM_ApiMgr_App_Insert",
    ];

    if (excludedEndpoints.some((endpoint) => url.includes(endpoint))) {
      return { needsAuth: false, authHeader: null };
    }

    const apiToken = sessionStorage.getItem("apitoken");
    const apiTokenTimeout = sessionStorage.getItem("apitokentimeout");
    const now = new Date();

    // 檢查現有 token
    if (apiToken && apiToken !== "" && apiToken !== emptyGuid()) {
      if (new Date(now) < new Date(apiTokenTimeout)) {
        const authHeader = "Basic " + btoa(`${this.appAccount}:${apiToken}`);
        return { needsAuth: true, authHeader };
      }
    }

    // 重新取得 token
    const token = await this.appLogin();
    if (token) {
      sessionStorage.setItem("apitoken", token.Token);
      sessionStorage.setItem("apitokentimeout", token.TokenExpire);
      const authHeader = "Basic " + btoa(`${this.appAccount}:${token.Token}`);
      return { needsAuth: true, authHeader };
    } else {
      sessionStorage.removeItem("apitoken");
      sessionStorage.removeItem("apitokentimeout");
      return { needsAuth: true, authHeader: null };
    }
  }

  /**
   * 清除所有 sessionStorage 登入相關資訊
   */
  static removeSession() {
    const keys = [
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
   * @param {string} bmemno - 使用者編號
   */
  static async deleteOnline(bmemno) {
    if (!bmemno) return;
    const { ErrorMessage } = await $.ajax({
      type: "GET",
      url: "../api/My_Log_DeleteOnline",
      data: { mins: 0, memNo: bmemno },
      contentType: "application/json",
      dataType: "json",
      async: true,
      cache: false,
    });
    if (ErrorMessage) console.log("刪除在線紀錄錯誤: " + ErrorMessage);
  }

  /**
   * 驗證使用者是否仍在線上（避免被踢出）
   */
  static async checkOnline() {
    const bmemno = sessionStorage.getItem("memno");
    const onlinetoken = sessionStorage.getItem("onlinetoken");
    // const IsAllowRepeatLogin = "N";
    const p = {
      BMemNo: bmemno,
      LogType: "Online",
      LogMessage: onlinetoken,
      TopN: 1,
    };

    const data = await $.ajax({
      type: "POST",
      url: "../api/My_Log_GetList",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify(p),
      async: true,
      cache: false,
    });

    if (data.ErrorMessage === "" && data.ItemList.length > 0) {
      sessionStorage.setItem("isinside", data.ItemList[0].IsInside);
      InfoLogger.log(bmemno, "Online", onlinetoken, "", "", location.href);
    } else {
      this.removeSession();
      alert("您已在其他設備登入或強迫登出");
      redirect("../XFile/Letmein");
    }
  }
}

/**
 * 記錄平台操作資訊的工具
 * @class
 */
export class InfoLogger {
  /**
   * 取得使用者平台名稱（手機、電腦、iOS 等）
   * @returns {string}
   */
  static getPlatform() {
    const ua = navigator.userAgent;
    if (navigator.userAgentData?.platform)
      return navigator.userAgentData.platform;
    if (/iPhone/i.test(ua)) return "iPhone";
    if (/iPad/i.test(ua)) return "iPad";
    if (/Android/i.test(ua)) return "Android";
    if (/Windows/i.test(ua)) return "Windows";
    if (/Macintosh/i.test(ua)) return "Mac";
    return "PC";
  }

  /**
   * 記錄一筆 Info Log 到伺服器
   * @param {Object} options - Log 參數
   * @param {string|null} options.bMemNo - 使用者編號
   * @param {string} options.type - Log 類型
   * @param {string} options.message - 主訊息
   * @param {string} [options.message2=""] - 次訊息
   * @param {string} [options.message3=""] - 補充訊息
   * @param {string} [options.url=location.href] - 發生頁面 URL
   */
  static async log({
    bMemNo,
    type,
    message,
    message2 = "",
    message3 = "",
    url = location.href,
  }) {
    const p = {
      bmemno: bMemNo,
      type,
      message,
      message2,
      message3,
      url,
      platform: this.getPlatform(),
    };

    const { ErrorMessage } = await ajaxApi({
      method: "GET",
      endpoint: "My_Log_Info",
      requestBody: p,
    });

    if (ErrorMessage) {
      console.error("記錄 Info Log 錯誤：", ErrorMessage);
    }
  }
}

/**
 * API 請求狀態管理器
 * 包含快取、查詢狀態和錯誤處理
 */
class ApiStateManager {
  constructor() {
    this.cache = new Map();
    this.queries = new Map();
    this.defaultConfig = {
      /** 過期時間 */
      staleTime: 5 * 60 * 1000, // 5分鐘
      /** 緩存時間 */
      cacheTime: 10 * 60 * 1000, // 10分鐘
      /** 重試次數 */
      retry: 0,
      /**
       * 重試中間的延遲時間，使用指數回退算法
       * @param {number} attemptIndex
       * @returns
       */
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      /** 是否執行 */
      enabled: true,
    };
  }

  /**
   * 生成快取查詢鍵值
   */
  generateQueryKey(endpoint, requestBody, method) {
    return `${method}:${endpoint}:${JSON.stringify(requestBody || {})}`;
  }

  /**
   * 檢查快取是否有效
   */
  isCacheValid(cacheEntry, staleTime) {
    if (!cacheEntry) return false;
    return Date.now() - cacheEntry.timestamp < staleTime;
  }

  /**
   * 清理過期的快取
   */
  cleanExpiredCache() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.defaultConfig.cacheTime) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 執行 API 請求
   * @param {string} baseUrl - 基本 API URL
   * @param {string} endpoint - API 端點
   * @param {Object} requestBody - 請求參數
   * @param {"GET"|"POST"} method - HTTP 方法
   * @param {string} - 基本 API URL
   */
  async executeRequest(baseUrl, endpoint, requestBody, method) {
    const requestUrl = `${baseUrl}/${endpoint}`;

    // 預先準備 headers
    const headers = {
      "Content-Type": "application/json",
    };

    // 預先處理 Authorization header
    await this.prepareAuthHeader(headers, requestUrl);

    const ajaxOptions = {
      url: requestUrl,
      type: method,
      headers: headers,
      data: method === "GET" ? requestBody : JSON.stringify(requestBody),
      dataType: "json",
      async: true,
      cache: false,
    };

    if (method !== "GET") {
      ajaxOptions.contentType = "application/json";
    }

    const response = await $.ajax(ajaxOptions);

    // 處理錯誤，包裝成自定義錯誤類型
    if (response && response.ErrorMessage) {
      const apiError = new Error(response.ErrorMessage);
      apiError.isApiError = true;
      apiError.response = response;
      apiError.status = "api_error";
      throw apiError;
    }

    return response;
  }

  /**
   * 準備授權認證 header
   */
  async prepareAuthHeader(headers, url) {
    const excludedEndpoints = [
      "api/TM_ApiMgr_App_CheckSsword",
      "api/TM_ApiMgr_App_GetOne",
      "api/TM_ApiMgr_App_Insert",
    ];

    if (excludedEndpoints.some((endpoint) => url.includes(endpoint))) {
      return false;
    }

    const apiToken = sessionStorage.getItem("apitoken");
    const apiTokenTimeout = sessionStorage.getItem("apitokentimeout");
    const now = new Date();

    if (apiToken && apiToken !== "" && apiToken !== emptyGuid()) {
      if (new Date(now) < new Date(apiTokenTimeout)) {
        headers["Authorization"] =
          "Basic " + btoa(`${ApiSecurityHelper.appAccount}:${apiToken}`);
        return true;
      }
    }

    const token = await ApiSecurityHelper.appLogin();
    if (token) {
      sessionStorage.setItem("apitoken", token.Token);
      sessionStorage.setItem("apitokentimeout", token.TokenExpire);
      headers["Authorization"] =
        "Basic " + btoa(`${ApiSecurityHelper.appAccount}:${token.Token}`);
      return true;
    } else {
      sessionStorage.removeItem("apitoken");
      sessionStorage.removeItem("apitokentimeout");
      return false;
    }
  }
}

// 初始化
const apiStateManager = new ApiStateManager();

/**
 * API 查詢狀態
 */
class QueryState {
  constructor(queryKey) {
    this.queryKey = queryKey;
    /** @type {'idle' | 'loading' | 'success' | 'error'} */
    this.status = "idle"; // '閒置' | '讀取中' | '成功' | '錯誤'
    /** 回傳 */
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
   */
  updateStatus(status, data = null, error = null) {
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
  notifySubscribers() {
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
   */
  getState() {
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
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
}

/**
 * 帶狀態管理的 Ajax API 函數
 * @param {Object} options
 * @param {string} [options.baseUrl="../api"] - 基本 API URL
 * @param {string} options.endpoint - API 端點
 * @param {Object} options.requestBody - 請求參數
 * @param {"GET"|"POST"} [options.method="GET"] - HTTP 方法
 * @param {Object} [options.config] - 配置選項
 * @returns {QueryState} 查詢狀態物件
 */
export function useAjaxApi({
  baseUrl = "../api",
  endpoint,
  requestBody,
  method = "GET",
  config = {},
}) {
  const finalConfig = { ...apiStateManager.defaultConfig, ...config };
  const queryKey = apiStateManager.generateQueryKey(
    endpoint,
    requestBody,
    method
  );

  // 獲取或創建查詢狀態
  let queryState = apiStateManager.queries.get(queryKey); // 找先前狀態
  if (!queryState) {
    queryState = new QueryState(queryKey);
    apiStateManager.queries.set(queryKey, queryState);
  }

  // 檢查是否需要執行查詢
  const shouldFetch =
    finalConfig.enabled &&
    (queryState.status === "idle" ||
      !apiStateManager.isCacheValid(
        apiStateManager.cache.get(queryKey),
        finalConfig.staleTime
      ));

  if (shouldFetch && !queryState.isFetching) {
    // 非同步執行查詢，但不等待結果
    executeQuery(
      queryState,
      baseUrl,
      endpoint,
      requestBody,
      method,
      finalConfig
    ).catch((error) => {
      // 錯誤已經在 executeQuery 中處理過了，這裡只是避免未捕獲的 Promise rejection
      console.debug("Query execution completed with error:", error.message);
    });
  }

  return queryState;
}

/**
 * 執行查詢
 *
 * @param {QueryState} queryState - 查詢狀態物件
 * @param {string} [baseUrl="../api"] - 基本 API URL
 * @param {string} endpoint - API 端點
 * @param {Object} requestBody - 請求參數
 * @param {"GET"|"POST"} method - HTTP 方法
 * @param {Object} config - 配置選項
 */
async function executeQuery(
  queryState,
  baseUrl = "../api",
  endpoint,
  requestBody,
  method,
  config
) {
  const queryKey = queryState.queryKey;

  queryState.updateStatus("loading");

  let attempt = 0;
  const maxAttempts = config.retry + 1;

  while (attempt < maxAttempts) {
    try {
      const data = await apiStateManager.executeRequest(
        baseUrl,
        endpoint,
        requestBody,
        method
      );

      // 更新快取
      apiStateManager.cache.set(queryKey, {
        data,
        timestamp: Date.now(),
      });

      // 更新狀態
      queryState.updateStatus("success", data);
      queryState.failureCount = 0;

      return data;
    } catch (error) {
      attempt++;
      queryState.failureCount = attempt;

      // 處理不同類型的錯誤
      if (error.status === 401) {
        // HTTP 401 認證錯誤
        sessionStorage.removeItem("apitoken");
        sessionStorage.removeItem("apitokentimeout");
      } else if (error.isApiError) {
        // 業務邏輯錯誤 (HTTP 200 + ErrorMessage)
        // 這類錯誤通常不需要重試，直接失敗
        queryState.updateStatus("error", null, error);
        throw error;
      }

      // 如果還有重試機會且不是最後一次嘗試，且不是 API 業務錯誤
      if (attempt < maxAttempts && !error.isApiError) {
        const delay = config.retryDelay(attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // 最終失敗
      queryState.updateStatus("error", null, error);
      throw error;
    }
  }
}

/**
 * 簡化版本 - 直接執行 API 請求並返回 Promise
 * @param {Object} options
 * @param {string} [options.baseUrl="../api"] - 基本 API URL
 * @param {string} options.endpoint - API 端點
 * @param {Object} options.requestBody - 請求參數
 * @param {"GET"|"POST"} [options.method="GET"] - HTTP 方法
 * @param {Object} [options.config] - 配置選項
 * @returns {Promise<unknown>}
 */
export async function ajaxApi({
  baseUrl = "../api",
  endpoint,
  requestBody,
  method = "GET",
  config = {},
}) {
  const finalConfig = { ...apiStateManager.defaultConfig, ...config };

  let attempt = 0;
  const maxAttempts = finalConfig.retry + 1;

  while (attempt < maxAttempts) {
    try {
      return await apiStateManager.executeRequest(
        baseUrl,
        endpoint,
        requestBody,
        method
      );
    } catch (error) {
      attempt++;

      // 處理不同類型的錯誤
      if (error.status === 401) {
        // HTTP 401 認證錯誤
        sessionStorage.removeItem("apitoken");
        sessionStorage.removeItem("apitokentimeout");
      } else if (error.isApiError) {
        // 公司 API 業務邏輯錯誤 (HTTP 200 + ErrorMessage)
        // 這類錯誤通常不需要重試，直接拋出
        throw error;
      }

      // 如果還有重試機會且不是 API 業務錯誤
      if (attempt < maxAttempts && !error.isApiError) {
        const delay = finalConfig.retryDelay(attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }
}

/**
 * 手動觸發查詢重新執行
 * @param {string} endpoint
 * @param {Object} requestBody
 * @param {string} method
 * @returns {Promise} 查詢結果的 Promise
 */
export function refetchQuery(endpoint, requestBody, method = "GET") {
  const queryKey = apiStateManager.generateQueryKey(
    endpoint,
    requestBody,
    method
  );
  const queryState = apiStateManager.queries.get(queryKey);

  if (queryState) {
    return executeQuery(
      queryState,
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
 * @returns {Promise} 如果觸發了重新查詢，返回查詢結果的 Promise
 */
export function invalidateQuery(endpoint, requestBody, method = "GET") {
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
      endpoint,
      requestBody,
      method,
      apiStateManager.defaultConfig
    );
  }

  return Promise.resolve();
}

/**
 * 清除所有快取
 */
export function clearAllCache() {
  apiStateManager.cache.clear();
}

/**
 * 設定全域配置
 */
export function setDefaultConfig(config) {
  Object.assign(apiStateManager.defaultConfig, config);
}

// 定期清理過期快取
setInterval(() => {
  apiStateManager.cleanExpiredCache();
}, 60000); // 每分鐘執行一次

// 使用範例：
/*
// 1. 使用狀態管理版本
const queryState = useAjaxApi({
    endpoint: "My_MemberAuth_Member_GetList",
    requestBody: { page: 1, size: 10 },
    method: "GET",
    config: {
        staleTime: 30000, // 30秒
        retry: 2
    }
});

// 訂閱狀態變化
const unsubscribe = queryState.subscribe((state) => {
    console.log('Query state changed:', state);
    if (state.isLoading) {
        // 顯示載入中
    } else if (state.isError) {
        // 顯示錯誤
        console.error('API Error:', state.error);
        
        // 檢查錯誤類型
        if (state.error.isApiError) {
            // 業務邏輯錯誤 (HTTP 200 + ErrorMessage)
            alert(`API 錯誤: ${state.error.message}`);
        } else if (state.error.status === 401) {
            // 認證錯誤
            alert('登入已過期，請重新登入');
        } else {
            // 其他網路或系統錯誤
            alert(`系統錯誤: ${state.error.message || '未知錯誤'}`);
        }
    } else if (state.isSuccess) {
        // 使用資料
        console.log('API Data:', state.data);
    }
});

// 2. 使用簡化版本（可使用非同步）
try {
    const data = await ajaxApi({
        endpoint: "My_MemberAuth_Member_GetList",
        requestBody: { page: 1, size: 10 },
        method: "GET"
    });
    console.log(data);
} catch (error) {
    console.error('API Error:', error);
    
    // 檢查錯誤類型
    if (error.isApiError) {
        // 業務邏輯錯誤 (例如：參數錯誤、資料不存在等)
        alert(`操作失敗: ${error.message}`);
        console.log('完整回應:', error.response);
    } else if (error.status === 401) {
        // 認證錯誤
        alert('登入已過期，請重新登入');
        // 可以跳轉到登入頁面
        // window.location.href = '/login';
    } else if (error.status >= 500) {
        // 伺服器錯誤
        alert('伺服器暫時無法回應，請稍後再試');
    } else {
        // 其他錯誤
        alert(`系統錯誤: ${error.message || '未知錯誤'}`);
    }
}

// 3. 手動重新取得資料
refetchQuery("My_MemberAuth_Member_GetList", { page: 1, size: 10 }, "GET");

// 4. 使查詢無效
invalidateQuery("My_MemberAuth_Member_GetList", { page: 1, size: 10 }, "GET");

// 5. 常見的錯誤處理模式
*/

/**
 * 錯誤處理
 * @param {unknown} error
 * @returns
 */
export function handleApiError(error) {
  if (error.isApiError) {
    // 業務邏輯錯誤 (HTTP 200 + ErrorMessage)
    return {
      type: "business",
      message: `操作失敗: ${error.message}`,
      showToUser: true,
      shouldRetry: false,
    };
  } else if (error.status === 401) {
    // 認證錯誤
    return {
      type: "auth",
      message: "登入已過期，請重新登入",
      showToUser: true,
      shouldRetry: false,
      action: "redirect_login",
    };
  } else if (error.status >= 500) {
    // 伺服器錯誤
    return {
      type: "server",
      message: "伺服器暫時無法回應",
      showToUser: true,
      shouldRetry: true,
    };
  } else {
    // 網路或其他錯誤
    return {
      type: "network",
      message: `系統錯誤: ${error.message || "未知錯誤"}`,
      showToUser: true,
      shouldRetry: true,
    };
  }
}
