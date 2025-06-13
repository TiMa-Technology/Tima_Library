import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AppAuthorization } from "../auth";
import type { ApiResponse, TokenResponse } from "types/api";

// 模擬 sessionStorage
const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

// 模擬 window.location
vi.stubGlobal("window", {
  location: {
    origin: "http://localhost:3000",
  },
});

// 模擬 fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("AppAuthorization 測試", () => {
  const appAccount = "test-account";
  const appPassword = "test-password";
  let auth: AppAuthorization;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("sessionStorage", mockStorage);
    auth = new AppAuthorization(appAccount, appPassword);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("構造函數", () => {
    it("應成功創建有效的實例", () => {
      expect(() => {
        auth = new AppAuthorization(appAccount, appPassword);
      }).not.toThrow();
    });

    it("應在缺少 appAccount 或 appPassword 時拋出錯誤", () => {
      let error1: Error | null = null;
      let error2: Error | null = null;

      try {
        new AppAuthorization("", "password");
      } catch (e) {
        error1 = e as Error;
      }

      try {
        new AppAuthorization("account", "");
      } catch (e) {
        error2 = e as Error;
      }

      expect(error1).toBeInstanceOf(Error);
      expect(error1?.message).toBe(
        "請設定 APP_ACCOUNT 和 APP_PASSWORD 環境變數"
      );
      expect(error2).toBeInstanceOf(Error);
      expect(error2?.message).toBe(
        "請設定 APP_ACCOUNT 和 APP_PASSWORD 環境變數"
      );
    });

    it("應在 appAccount 為 null 時拋出錯誤", () => {
      expect(() => {
        new AppAuthorization(null as any, appPassword);
      }).toThrow("請設定 APP_ACCOUNT 和 APP_PASSWORD 環境變數");
    });
  });

  describe("getToken 方法", () => {
    it("應成功獲取並儲存 Token", async () => {
      const mockResponse: ApiResponse<TokenResponse> = {
        token: "mock-token",
        tokenExpire: "2025-06-10T12:00:00Z",
        account: "test-account",
        name: "Test User",
        appNo: "123",
        webURL: "http://example.com",
        bMemNo: "B001",
        bMemName: "Business",
        bDate: "2025-06-01",
        uMemNo: "U001",
        uMemName: "User",
        uDate: "2025-06-01",
        checkCode: "ABC123",
      };
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      });

      const result = await auth.getToken();

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/TM_ApiMgr_App_CheckSsword?account=test-account&ssword=test-password"
      );
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        "apitoken",
        "mock-token"
      );
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        "apitokentimeout",
        "2025-06-10T12:00:00Z"
      );
      expect(result).toEqual(mockResponse);
    });

    it("應在 API 返回 errorMessage 時拋出錯誤", async () => {
      const mockResponse: ApiResponse<TokenResponse> = {
        errorMessage: "無效的憑證",
      };
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      });

      await expect(auth.getToken()).rejects.toThrow("無效的憑證");
      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it("應使用單一 Promise 處理並發 Token 請求", async () => {
      const mockResponse: ApiResponse<TokenResponse> = {
        token: "mock-token",
        tokenExpire: "2025-06-10T12:00:00Z",
        account: "test-account",
        name: "Test User",
        appNo: "123",
        webURL: "http://example.com",
        bMemNo: "B001",
        bMemName: "Business",
        bDate: "2025-06-01",
        uMemNo: "U001",
        uMemName: "User",
        uDate: "2025-06-01",
        checkCode: "ABC123",
      };
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      });

      const promise1 = auth.getToken();
      const promise2 = auth.getToken();

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(mockFetch).toHaveBeenCalledTimes(1); // 確保只請求一次
      expect(result1).toEqual(mockResponse);
      expect(result2).toEqual(mockResponse);
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        "apitoken",
        "mock-token"
      );
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        "apitokentimeout",
        "2025-06-10T12:00:00Z"
      );
    });

    it("應在 API 回應 token 是空 UUID 時拋出錯誤", async () => {
      const mockResponse: ApiResponse<TokenResponse> = {
        tokenExpire: "2025-06-10T12:00:00Z",
      };
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      });

      await expect(auth.getToken()).rejects.toThrow("無效的憑證!");
      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it("應在 fetch 失敗時拋出錯誤", async () => {
      mockFetch.mockRejectedValueOnce(new Error("網路錯誤"));

      await expect(auth.getToken()).rejects.toThrow("網路錯誤");
      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("prepareAuthHeader 方法", () => {
    it("應對排除的端點返回 false", async () => {
      const headers: Record<string, string> = {};
      const result = await auth.prepareAuthHeader(
        headers,
        "api/TM_ApiMgr_App_CheckSsword"
      );

      expect(result).toBe(false);
      expect(headers).toEqual({});
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("應使用有效的現有 Token", async () => {
      mockStorage.getItem
        .mockReturnValueOnce("mock-token")
        .mockReturnValueOnce("2025-06-10T12:00:00Z");
      vi.setSystemTime(new Date("2025-06-09T12:00:00Z")); // 模擬當前時間

      const headers: Record<string, string> = {};
      const result = await auth.prepareAuthHeader(headers, "api/Some_Endpoint");

      expect(result).toBe(true);
      expect(headers).toEqual({
        Authorization: "Basic " + btoa(`${appAccount}:mock-token`),
      });
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("應在現有 Token 無效時獲取新 Token", async () => {
      mockStorage.getItem
        .mockReturnValueOnce("mock-token")
        .mockReturnValueOnce("2025-06-08T12:00:00Z"); // 過期
      vi.setSystemTime(new Date("2025-06-09T12:00:00Z"));
      const mockResponse: ApiResponse<TokenResponse> = {
        token: "new-token",
        tokenExpire: "2025-06-10T12:00:00Z",
        account: "test-account",
        name: "Test User",
        appNo: "123",
        webURL: "http://example.com",
        bMemNo: "B001",
        bMemName: "Business",
        bDate: "2025-06-01",
        uMemNo: "U001",
        uMemName: "User",
        uDate: "2025-06-01",
        checkCode: "ABC123",
      };
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      });

      const headers: Record<string, string> = {};
      const result = await auth.prepareAuthHeader(headers, "api/Some_Endpoint");

      expect(result).toBe(true);
      expect(headers).toEqual({
        Authorization: "Basic " + btoa(`${appAccount}:new-token`),
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockStorage.setItem).toHaveBeenCalledWith("apitoken", "new-token");
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        "apitokentimeout",
        "2025-06-10T12:00:00Z"
      );
    });

    it("應在 Token 為空 GUID 時獲取新 Token", async () => {
      mockStorage.getItem
        .mockReturnValueOnce("00000000-0000-0000-0000-000000000000")
        .mockReturnValueOnce("2025-06-10T12:00:00Z");
      vi.setSystemTime(new Date("2025-06-09T12:00:00Z"));
      const mockResponse: ApiResponse<TokenResponse> = {
        token: "new-token",
        tokenExpire: "2025-06-10T12:00:00Z",
        account: "test-account",
        name: "Test User",
        appNo: "123",
        webURL: "http://example.com",
        bMemNo: "B001",
        bMemName: "Business",
        bDate: "2025-06-01",
        uMemNo: "U001",
        uMemName: "User",
        uDate: "2025-06-01",
        checkCode: "ABC123",
      };
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      });

      const headers: Record<string, string> = {};
      const result = await auth.prepareAuthHeader(headers, "api/Some_Endpoint");

      expect(result).toBe(true);
      expect(headers).toEqual({
        Authorization: "Basic " + btoa(`${appAccount}:new-token`),
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockStorage.setItem).toHaveBeenCalledWith("apitoken", "new-token");
    });

    it("應在 Token 獲取失敗時移除無效 Token 並返回 false", async () => {
      mockStorage.getItem
        .mockReturnValueOnce("mock-token")
        .mockReturnValueOnce("2025-06-08T12:00:00Z"); // 過期
      vi.setSystemTime(new Date("2025-06-09T12:00:00Z"));
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ errorMessage: "Token 獲取失敗" }),
      });

      const headers: Record<string, string> = {};
      const result = await auth.prepareAuthHeader(headers, "api/Some_Endpoint");

      expect(result).toBe(false);
      expect(headers).toEqual({});
      expect(mockStorage.removeItem).toHaveBeenCalledWith("apitoken");
      expect(mockStorage.removeItem).toHaveBeenCalledWith("apitokentimeout");
    });

    it("應在 Token 與 tokenExpire 缺失時移除無效 Token 並返回 false", async () => {
      mockStorage.getItem
        .mockReturnValueOnce("mock-token")
        .mockReturnValueOnce("2025-06-08T12:00:00Z"); // 過期
      vi.setSystemTime(new Date("2025-06-09T12:00:00Z"));
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({}),
      });

      const headers: Record<string, string> = {};
      const result = await auth.prepareAuthHeader(headers, "api/Some_Endpoint");

      expect(result).toBe(false);
      expect(headers).toEqual({});
      expect(mockStorage.removeItem).toHaveBeenCalledWith("apitoken");
      expect(mockStorage.removeItem).toHaveBeenCalledWith("apitokentimeout");
    });

    it("應在 tokenExpire 格式無效時獲取新 Token", async () => {
      mockStorage.getItem
        .mockReturnValueOnce("mock-token")
        .mockReturnValueOnce("invalid-date"); // 無效日期
      vi.setSystemTime(new Date("2025-06-09T12:00:00Z"));
      const mockResponse: ApiResponse<TokenResponse> = {
        token: "new-token",
        tokenExpire: "2025-06-10T12:00:00Z",
        account: "test-account",
        name: "Test User",
        appNo: "123",
        webURL: "http://example.com",
        bMemNo: "B001",
        bMemName: "Business",
        bDate: "2025-06-01",
        uMemNo: "U001",
        uMemName: "User",
        uDate: "2025-06-01",
        checkCode: "ABC123",
      };
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      });

      const headers: Record<string, string> = {};
      const result = await auth.prepareAuthHeader(headers, "api/Some_Endpoint");

      expect(result).toBe(true);
      expect(headers).toEqual({
        Authorization: "Basic " + btoa(`${appAccount}:new-token`),
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockStorage.setItem).toHaveBeenCalledWith("apitoken", "new-token");
    });
  });
});
