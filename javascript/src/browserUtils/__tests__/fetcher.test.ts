import { simpleHash } from "../../baseFunction";
import type { ApiResponse, ApiError, ApiConfig } from "../../types/api";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  ApiStateManager,
  QueryState,
  customRequest,
  useAjaxApi,
  refetchQuery,
  invalidateQuery,
  clearAllCache,
  setDefaultConfig,
  cleanCacheInterval,
} from "../fetcher";

// 模擬 fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// 模擬 sessionStorage
const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
vi.stubGlobal("sessionStorage", mockStorage);

// 模擬 AppAuthorization
const mockPrepare = vi.fn().mockImplementation(() => true);
vi.mock("../auth/auth", () => ({
  AppAuthorization: vi.fn().mockImplementation(() => ({
    prepareAuthHeader: mockPrepare,
  })),
}));

// 模擬 window.location
vi.stubGlobal("window", {
  location: {
    origin: "http://localhost:3000",
    protocol: "http:",
    host: "localhost:3000",
    pathname: "/",
  },
});

// 模擬 simpleHash
vi.mock("../../baseFunction/utils", () => ({
  simpleHash: vi.fn((input: string) => `hash-${input}`),
}));

describe("ApiStateManager 測試", () => {
  let manager: ApiStateManager;
  const appAccount = "test-account";
  const appPassword = "test-password";

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new ApiStateManager(appAccount, appPassword);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("構造函數", () => {
    it("應正確初始化快取、查詢和預設配置", () => {
      expect(manager["cache"]).toBeInstanceOf(Map);
      expect(manager["queries"]).toBeInstanceOf(Map);
      expect(manager["defaultConfig"]).toEqual({
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        retry: 0,
        retryDelay: expect.any(Function),
        enabled: true,
        treatErrorMessageAsError: true,
        cache: true,
      });
    });
  });

  describe("generateQueryKey 方法", () => {
    it("應生成一致的查詢鍵", () => {
      const requestBody = { param: "value" };
      const key = manager.generateQueryKey(
        "test_endpoint",
        requestBody,
        "POST"
      );
      expect(simpleHash).toHaveBeenCalledWith(JSON.stringify(requestBody));
      expect(key).toBe(
        `POST:test_endpoint:hash-${JSON.stringify(requestBody)}`
      );
    });

    it("應處理空的 requestBody", () => {
      const key = manager.generateQueryKey("test_endpoint", null, "GET");
      expect(simpleHash).not.toHaveBeenCalled();
      expect(key).toBe("GET:test_endpoint:");
    });
  });

  describe("getQuery 方法", () => {
    it("應返回存在的查詢狀態", () => {
      const queryKey = "GET:test_endpoint:";
      const queryState = new QueryState(queryKey);
      manager["queries"].set(queryKey, queryState);
      expect(manager.getQuery(queryKey)).toBe(queryState);
    });

    it("應對不存在的查詢返回 undefined", () => {
      expect(manager.getQuery("non_existent_key")).toBeUndefined();
    });
  });

  describe("setCache 方法", () => {
    it("應正確設置快取", () => {
      const queryKey = "GET:test_endpoint:";
      const data: ApiResponse = { data: "test" };
      manager.setCache(queryKey, data);
      expect(manager["cache"].get(queryKey)).toEqual({
        data,
        timestamp: expect.any(Number),
      });
    });
  });

  describe("isCacheValid 方法", () => {
    it("應對有效快取返回 true", () => {
      const cacheEntry = { data: {}, timestamp: Date.now() - 1000 };
      expect(manager.isCacheValid(cacheEntry, 5000)).toBe(true);
    });

    it("應對過期快取返回 false", () => {
      const cacheEntry = { data: {}, timestamp: Date.now() - 10000 };
      expect(manager.isCacheValid(cacheEntry, 5000)).toBe(false);
    });

    it("應對未定義的快取返回 false", () => {
      expect(manager.isCacheValid(undefined, 5000)).toBe(false);
    });
  });

  describe("cleanExpiredCache 方法", () => {
    it("應移除過期的快取條目", () => {
      vi.setSystemTime(new Date("2025-06-09T12:00:00Z"));
      manager["cache"].set("key1", {
        data: {},
        timestamp: Date.now() - 11 * 60 * 1000,
      }); // 過期
      manager["cache"].set("key2", {
        data: {},
        timestamp: Date.now() - 1 * 60 * 1000,
      }); // 未過期
      manager.cleanExpiredCache();
      expect(manager["cache"].has("key1")).toBe(false);
      expect(manager["cache"].has("key2")).toBe(true);
    });

    it("應在快取超過最大限制時移除最舊的條目", () => {
      vi.setSystemTime(new Date("2025-06-09T12:00:00Z"));
      manager["cache"].set("key1", {
        data: {},
        timestamp: Date.now() - 3 * 60 * 1000,
      });
      manager["cache"].set("key2", {
        data: {},
        timestamp: Date.now() - 2 * 60 * 1000,
      });
      manager["cache"].set("key3", {
        data: {},
        timestamp: Date.now() - 1 * 60 * 1000,
      });
      manager.cleanExpiredCache(2);
      expect(manager["cache"].size).toBe(2);
      expect(manager["cache"].has("key2")).toBe(true);
      expect(manager["cache"].has("key3")).toBe(true);
    });
  });

  describe("executeRequest 方法", () => {
    beforeEach(() => {
      vi.clearAllMocks(); // 清除呼叫記錄但保留模擬行為
      vi.spyOn(manager, "generateQueryKey").mockReturnValue(
        "POST:test_endpoint:hash-{}"
      );
    });

    it("應成功執行帶 JSON 請求體的 POST 請求", async () => {
      const mockResponse: ApiResponse = { data: "test" };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);
      mockPrepare.mockResolvedValue(true);

      const result = await manager.executeRequest(
        "../api",
        "test_endpoint",
        { param: "value" },
        "POST",
        {},
        {}
      );

      expect(mockFetch).toHaveBeenCalledWith("../api/test_endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: expect.any(String),
        },
        body: JSON.stringify({ param: "value" }),
        cache: "no-store",
        credentials: "same-origin",
        mode: "cors",
      });
      expect(result).toEqual(mockResponse);
    });

    it("應成功執行帶查詢參數的 GET 請求", async () => {
      const mockResponse: ApiResponse = { data: "test" };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);
      mockPrepare.mockResolvedValue(true);

      const result = await manager.executeRequest(
        "../api",
        "test_endpoint",
        { param: "value" },
        "GET",
        {},
        {}
      );

      expect(mockFetch).toHaveBeenCalledWith(
        "../api/test_endpoint?param=value",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Authorization: expect.any(String), 因為直接 Mock prepareAuthHeader 回傳 true，並不會有 header 被加入
          },
          body: undefined,
          cache: "no-store",
          credentials: "same-origin",
          mode: "cors",
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it("應成功執行 FormData 請求", async () => {
      const mockResponse: ApiResponse = { data: "test" };
      const formData = new FormData();
      formData.append("key", "value");
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);
      mockPrepare.mockResolvedValue(true);

      const result = await manager.executeRequest(
        "../api",
        "test_endpoint",
        formData,
        "POST",
        {},
        {}
      );

      expect(mockFetch).toHaveBeenCalledWith("../api/test_endpoint", {
        method: "POST",
        headers: {
          // Authorization: expect.any(String), 因為直接 Mock prepareAuthHeader 回傳 true，並不會有 header 被加入
        },
        body: formData,
        cache: "no-store",
        credentials: "same-origin",
        mode: "cors",
      });
      expect(result).toEqual(mockResponse);
    });

    it("應執行帶客製化 fetchOptions 的請求", async () => {
      const mockResponse: ApiResponse = { data: "test" };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);
      mockPrepare.mockResolvedValue(true);

      const result = await manager.executeRequest(
        "../api",
        "test_endpoint",
        { param: "value" },
        "POST",
        {},
        { credentials: "include", headers: { "X-Custom": "value" } }
      );

      expect(mockFetch).toHaveBeenCalledWith("../api/test_endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Custom": "value",
          // Authorization: expect.any(String), 因為直接 Mock prepareAuthHeader 回傳 true，並不會有 header 被加入
        },
        body: JSON.stringify({ param: "value" }),
        cache: "no-store",
        credentials: "include",
        mode: "cors",
      });
      expect(result).toEqual(mockResponse);
    });

    it("應正確判斷 API 業務錯誤為不可重試", async () => {
      const mockResponse: ApiResponse = { errorMessage: "API 錯誤" };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      mockPrepare.mockResolvedValue(true);

      await expect(
        manager.executeRequest("../api", "test_endpoint", {}, "GET", {
          treatErrorMessageAsError: true,
        })
      ).rejects.toMatchObject({
        isApiError: true,
        canRetry: false,
        status: "api_error",
        message: "API 錯誤",
      });
    });

    it("應正確判斷非預期 HTTP 錯誤為可重試", async () => {
      const mockResponse: ApiResponse = { errorMessage: "" };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      mockPrepare.mockResolvedValue(true);

      await expect(
        manager.executeRequest("../api", "test_endpoint", {}, "GET")
      ).rejects.toMatchObject({
        isApiError: false,
        canRetry: true,
        status: "500",
      });
    });

    it("應處理 HTTP 錯誤", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ errorMessage: "伺服器錯誤" }),
      } as Response);
      mockPrepare.mockResolvedValue(true);

      await expect(
        manager.executeRequest("../api", "test_endpoint", {}, "GET")
      ).rejects.toMatchObject({
        isApiError: true,
        status: "500",
        message: "伺服器錯誤",
      });
    });

    it("應處理 API 錯誤訊息", async () => {
      const mockResponse: ApiResponse = { errorMessage: "API 錯誤" };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);
      mockPrepare.mockResolvedValue(true);

      await expect(
        manager.executeRequest("../api", "test_endpoint", {}, "GET", {
          treatErrorMessageAsError: true,
        })
      ).rejects.toMatchObject({
        isApiError: true,
        status: "api_error",
        message: "API 錯誤",
      });
    });
  });

  describe("getDefaultConfig 方法", () => {
    it("應返回預設配置的副本", () => {
      const config = manager.getDefaultConfig();
      expect(config).toEqual(manager["defaultConfig"]);
      expect(config).not.toBe(manager["defaultConfig"]); // 確保是副本
    });
  });

  describe("setDefaultConfig 方法", () => {
    it("應更新預設配置", () => {
      const newConfig: Partial<ApiConfig> = { retry: 3, staleTime: 10000 };
      manager.setDefaultConfig(newConfig);
      expect(manager["defaultConfig"]).toMatchObject(newConfig);
    });
  });

  describe("cleanup 方法", () => {
    it("應清理所有查詢和快取", () => {
      const queryKey = "GET:test_endpoint:";
      const queryState = new QueryState(queryKey);
      const subscriber = vi.fn();
      queryState.subscribe(subscriber);
      manager["queries"].set(queryKey, queryState);
      manager["cache"].set(queryKey, { data: {}, timestamp: Date.now() });

      manager.cleanup();

      expect(queryState.subscribers.size).toBe(0);
      expect(manager["queries"].size).toBe(0);
      expect(manager["cache"].size).toBe(0);
    });
  });

  describe("QueryState 類", () => {
    let queryState: QueryState;

    beforeEach(() => {
      queryState = new QueryState("test_query");
    });

    it("應正確初始化狀態", () => {
      expect(queryState.status).toBe("idle");
      expect(queryState.data).toBeNull();
      expect(queryState.error).toBeNull();
      expect(queryState.isLoading).toBe(false);
      expect(queryState.isError).toBe(false);
      expect(queryState.isSuccess).toBe(false);
      expect(queryState.isFetching).toBe(false);
      expect(queryState.failureCount).toBe(0);
      expect(queryState.subscribers).toBeInstanceOf(Set);
      expect(queryState.lastUpdated).toBeNull();
    });

    it("應更新狀態並通知訂閱者", () => {
      const subscriber = vi.fn();
      queryState.subscribe(subscriber);

      queryState.updateStatus("loading");
      expect(queryState.status).toBe("loading");
      expect(queryState.isLoading).toBe(true);
      expect(subscriber).toHaveBeenCalledWith({
        status: "loading",
        data: null,
        error: null,
        isLoading: true,
        isError: false,
        isSuccess: false,
        isFetching: true,
        failureCount: 0,
        lastUpdated: null,
      });

      const mockResponse: ApiResponse = { data: "test" };
      queryState.updateStatus("success", mockResponse);
      expect(queryState.status).toBe("success");
      expect(queryState.data).toEqual(mockResponse);
      expect(subscriber).toHaveBeenCalledWith({
        status: "success",
        data: mockResponse,
        error: null,
        isLoading: false,
        isError: false,
        isSuccess: true,
        isFetching: false,
        failureCount: 0,
        lastUpdated: expect.any(Number),
      });
    });

    it("應正確取消訂閱", () => {
      const subscriber = vi.fn();
      const unsubscribe = queryState.subscribe(subscriber);

      queryState.updateStatus("loading");
      expect(subscriber).toHaveBeenCalledTimes(1);

      unsubscribe();
      queryState.updateStatus("success", { data: "test" });
      expect(subscriber).toHaveBeenCalledTimes(1); // 不應再次觸發
    });

    it("應正確處理訂閱者錯誤", () => {
      const errorSubscriber = vi.fn(() => {
        throw new Error("訂閱者錯誤");
      });
      queryState.subscribe(errorSubscriber);
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      queryState.updateStatus("loading");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error in query subscriber:",
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe("customRequest 函數", () => {
    it("應成功執行請求", async () => {
      const mockResponse: ApiResponse = { data: "test" };
      vi.spyOn(manager, "executeRequest").mockResolvedValue(mockResponse);

      const result = await customRequest(manager, {
        baseUrl: "../api",
        endpoint: "test_endpoint",
        requestBody: { param: "value" },
        method: "POST",
      });

      expect(manager.executeRequest).toHaveBeenCalledWith(
        "../api",
        "test_endpoint",
        { param: "value" },
        "POST",
        { treatErrorMessageAsError: true },
        {}
      );
      expect(result).toEqual(mockResponse);
    });

    it("應在缺少端點時拋出錯誤", async () => {
      await expect(
        customRequest(manager, {
          baseUrl: "../api",
          endpoint: "",
          requestBody: {},
        })
      ).rejects.toThrow("無提供 API 端點");
    });

    it("應在可重試錯誤時進行重試", async () => {
      const mockResponse: ApiResponse = {
        data: "test",
        errorMessage: "",
      };
      const retryableError = new Error("暫時性錯誤") as ApiError;
      retryableError.isApiError = false;
      retryableError.canRetry = true;
      vi.spyOn(manager, "executeRequest")
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValueOnce(mockResponse);

      const result = await customRequest(manager, {
        baseUrl: "../api",
        endpoint: "test_endpoint",
        method: "GET",
        requestBody: {},
        config: { retry: 1, treatErrorMessageAsError: true },
      });

      expect(manager.executeRequest).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResponse);
    });

    it("應在請求不可重試錯誤(預期性業務邏輯錯誤)時直接結束", async () => {
      const apiError = new Error("暫時性錯誤") as ApiError;
      apiError.isApiError = true;
      apiError.canRetry = false;

      vi.spyOn(manager, "executeRequest").mockRejectedValueOnce(apiError);

      await expect(
        customRequest(manager, {
          baseUrl: "../api",
          endpoint: "test_endpoint",
          method: "GET",
          requestBody: {},
          config: { retry: 1, treatErrorMessageAsError: true },
        })
      ).rejects.toBe(apiError);

      expect(manager.executeRequest).toHaveBeenCalledTimes(1);
    });

    // it("應處理 401 錯誤並清除 Token", async () => {
    //   const error: ApiError = new Error("未授權") as ApiError;
    //   error.isApiError = true;
    //   error.status = "401";
    //   vi.spyOn(manager, "executeRequest").mockRejectedValue(error);

    //   await expect(
    //     customRequest(manager, {
    //       baseUrl: "../api",
    //       endpoint: "test_endpoint",
    //       requestBody: {},
    //     })
    //   ).rejects.toMatchObject({ status: "401" });

    //   expect(mockStorage.removeItem).toHaveBeenCalledWith("apitoken");
    //   expect(mockStorage.removeItem).toHaveBeenCalledWith("apitokentimeout");
    // });

    it("應傳遞客製化的 fetchOptions", async () => {
      const mockResponse: ApiResponse = { data: "test" };
      vi.spyOn(manager, "executeRequest").mockResolvedValue(mockResponse);

      const result = await customRequest(manager, {
        baseUrl: "../api",
        endpoint: "test_endpoint",
        requestBody: { param: "value" },
        method: "POST",
        fetchOptions: { headers: { "X-Custom": "value" } },
      });

      expect(manager.executeRequest).toHaveBeenCalledWith(
        "../api",
        "test_endpoint",
        { param: "value" },
        "POST",
        { treatErrorMessageAsError: true },
        { headers: { "X-Custom": "value" } }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("useAjaxApi 函數", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
      vi.spyOn(manager, "generateQueryKey").mockReturnValue(
        "GET:test_endpoint:hash-{}"
      );
    });
    it("應獲取資料並更新狀態", async () => {
      const mockResponse: ApiResponse = { data: "test" };
      vi.spyOn(manager, "executeRequest").mockResolvedValue(mockResponse);
      vi.spyOn(manager, "isCacheValid").mockReturnValue(false);

      const query = useAjaxApi(manager, {
        baseUrl: "../api",
        endpoint: "test_endpoint",
        requestBody: {},
        method: "GET",
      });

      expect(query.status).toBe("loading");
      await vi.waitFor(() => expect(query.status).toBe("success"), {
        timeout: 1000,
      });
      expect(query.data).toEqual(mockResponse);
      expect(manager["cache"].get("GET:test_endpoint:hash-{}")).toEqual({
        data: mockResponse,
        timestamp: expect.any(Number),
      });
    });

    it("應在快取有效時使用快取資料", async () => {
      const mockResponse: ApiResponse = { data: "cached" };
      vi.spyOn(manager, "isCacheValid").mockReturnValue(true);
      vi.spyOn(manager, "executeRequest"); // 設置 spy 以檢查未被呼叫

      // 設置快取
      const queryKey = "GET:test_endpoint:hash-{}";
      manager["cache"].set(queryKey, {
        data: mockResponse,
        timestamp: Date.now(),
      });

      // 設置查詢狀態以模擬已有快取資料
      const queryState = new QueryState(queryKey);
      queryState.updateStatus("success", mockResponse); // 模擬成功狀態
      manager["queries"].set(queryKey, queryState);

      const query = useAjaxApi(manager, {
        baseUrl: "../api",
        endpoint: "test_endpoint",
        requestBody: {},
        method: "GET",
      });

      expect(query.status).toBe("success");
      expect(query.data).toEqual(mockResponse);
      expect(manager.executeRequest).not.toHaveBeenCalled();
    });

    it("應處理錯誤並更新狀態", async () => {
      const error = new Error("請求失敗");
      vi.spyOn(manager, "executeRequest").mockRejectedValue(error);
      vi.spyOn(manager, "isCacheValid").mockReturnValue(false);

      const query = useAjaxApi(manager, {
        baseUrl: "../api",
        endpoint: "test_endpoint",
        requestBody: {},
        method: "GET",
      });

      await vi.waitFor(() => expect(query.status).toBe("error"), {
        timeout: 1000,
      });
      expect(query.error).toEqual(error);
    });

    it("應在禁用時不觸發請求", async () => {
      vi.spyOn(manager, "executeRequest");
      const query = useAjaxApi(manager, {
        baseUrl: "../api",
        endpoint: "test_endpoint",
        requestBody: {},
        method: "GET",
        config: { enabled: false },
      });

      expect(query.status).toBe("idle");
      expect(manager.executeRequest).not.toHaveBeenCalled();
    });
  });

  describe("refetchQuery 函數", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
      vi.spyOn(manager, "generateQueryKey").mockReturnValue(
        "POST:test_endpoint:hash-{}"
      );
    });
    it("應使用一致的配置重新獲取資料", async () => {
      const mockResponse: ApiResponse = { data: "test" };
      vi.spyOn(manager, "executeRequest").mockResolvedValue(mockResponse);

      const queryState = new QueryState("POST:test_endpoint:hash-{}");
      manager["queries"].set("POST:test_endpoint:hash-{}", queryState);

      const result = await refetchQuery(manager, {
        baseUrl: "../api",
        endpoint: "test_endpoint",
        requestBody: {},
        method: "POST",
        config: { retry: 1 },
        fetchOptions: { headers: { "X-Custom": "value" } },
      });

      expect(manager.executeRequest).toHaveBeenCalledWith(
        "../api",
        "test_endpoint",
        {},
        "POST",
        { treatErrorMessageAsError: expect.any(Boolean) },
        { headers: { "X-Custom": "value" } }
      );
      expect(result).toEqual(mockResponse);
      expect(queryState.status).toBe("success");
    });

    it("應在查詢不存在時拒絕請求", async () => {
      await expect(
        refetchQuery(manager, {
          baseUrl: "../api",
          endpoint: "test_endpoint",
          requestBody: {},
          method: "POST",
        })
      ).rejects.toThrow("Query not found");
    });
  });

  describe("invalidateQuery 函數", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
      vi.spyOn(manager, "generateQueryKey").mockReturnValue(
        "POST:test_endpoint:hash-{}"
      );
    });
    it("應使快取無效並在啟用時重新獲取", async () => {
      const mockResponse: ApiResponse = { data: "test" };
      vi.spyOn(manager, "executeRequest").mockResolvedValue(mockResponse);

      const queryState = new QueryState("POST:test_endpoint:hash-{}");
      queryState.status = "success";
      manager["queries"].set("POST:test_endpoint:hash-{}", queryState);
      manager["cache"].set("POST:test_endpoint:hash-{}", {
        data: { data: "old" },
        timestamp: Date.now(),
      });

      await invalidateQuery(manager, {
        baseUrl: "../api",
        endpoint: "test_endpoint",
        requestBody: {},
        method: "POST",
        config: { enabled: true, cache: false }, // 因為刪除完會直接重新請求因此設為FALSE不設置快取
      });

      expect(manager["cache"].has("POST:test_endpoint:hash-{}")).toBe(false);
      expect(queryState.status).toBe("success");
      expect(queryState.data).toEqual(mockResponse);
    });

    it("應在未啟用時僅清除快取", async () => {
      vi.spyOn(manager, "executeRequest");
      manager["cache"].set("POST:test_endpoint:hash-{}", {
        data: { data: "old" },
        timestamp: Date.now(),
      });

      await invalidateQuery(manager, {
        baseUrl: "../api",
        endpoint: "test_endpoint",
        requestBody: {},
        method: "POST",
        config: { enabled: false },
      });

      expect(manager["cache"].has("POST:test_endpoint:hash-{}")).toBe(false);
      expect(manager.executeRequest).not.toHaveBeenCalled();
    });
  });

  describe("clearAllCache 函數", () => {
    it("應清除所有快取", () => {
      manager["cache"].set("key1", { data: {}, timestamp: Date.now() });
      manager["cache"].set("key2", { data: {}, timestamp: Date.now() });
      clearAllCache(manager);
      expect(manager["cache"].size).toBe(0);
    });
  });

  describe("setDefaultConfig 函數", () => {
    it("應更新 ApiStateManager 的預設配置", () => {
      const newConfig: Partial<ApiConfig> = { retry: 2, cache: false };
      setDefaultConfig(manager, newConfig);
      expect(manager.getDefaultConfig()).toMatchObject(newConfig);
    });
  });

  describe("cleanCacheInterval 函數", () => {
    it("應定期調用 cleanExpiredCache", () => {
      const cleanExpiredCacheSpy = vi.spyOn(manager, "cleanExpiredCache");
      const setIntervalSpy = vi.spyOn(global, "setInterval");

      cleanCacheInterval(manager);

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 60000);
      const callback = setIntervalSpy.mock.calls[0][0] as () => void;
      callback(); // 模擬定時器觸發
      expect(cleanExpiredCacheSpy).toHaveBeenCalled();

      setIntervalSpy.mockRestore();
    });
  });
});
