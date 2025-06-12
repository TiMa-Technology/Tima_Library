import { AppAuthorization, type TokenResponse } from "../auth";
import { describe, beforeEach, vi, afterEach, it, expect } from "vitest";

import { ajaxApi } from "../../browserUtils/ajax";

vi.mock("../../browserUtils/ajax", () => ({
  ajaxApi: vi.fn(),
}));

const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

vi.stubGlobal("sessionStorage", mockStorage);

describe("AppAuthorization 測試", () => {
  const appAccount = "test-account";
  const appPassword = "test-password";

  let auth: AppAuthorization;

  beforeEach(() => {
    vi.clearAllMocks();
    // console.log(process.env.APP_ACCOUNT);
    auth = new AppAuthorization(appAccount, appPassword);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("構造函數", () => {
    it("應該成功創建有效的實例", () => {
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

    // 測試不同的 falsy 值
    it("應在 appAccount 為 null 時拋出錯誤", () => {
      expect(() => {
        new AppAuthorization(null as any, appPassword);
      }).toThrow("請設定 APP_ACCOUNT 和 APP_PASSWORD 環境變數");
    });
  });

  describe("getToken 方法", () => {
    it("應成功獲取並儲存 Token", async () => {
      const mockResponse: TokenResponse = {
        Token: "mock-token",
        TokenExpire: "2025-06-10T12:00:00Z",
      };
      vi.mocked(ajaxApi).mockResolvedValue(mockResponse);

      const result = await auth.getToken();

      expect(ajaxApi).toHaveBeenCalledWith({
        method: "GET",
        endpoint: "TM_ApiMgr_App_CheckSsword",
        requestBody: { account: appAccount, ssword: appPassword },
      });
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

    it("應在 API 返回 ErrorMessage 時拋出錯誤", async () => {
      const mockResponse: TokenResponse = { ErrorMessage: "無效的憑證" };
      vi.mocked(ajaxApi).mockResolvedValue(mockResponse);
      await expect(auth.getToken()).rejects.toThrow("無效的憑證");
      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it("應使用單一 Promise 處理並發 Token 請求", async () => {
      const mockResponse: TokenResponse = {
        Token: "mock-token",
        TokenExpire: "2025-06-10T12:00:00Z",
      };
      vi.mocked(ajaxApi).mockResolvedValue(mockResponse);

      const promise1 = auth.getToken();
      const promise2 = auth.getToken();

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(ajaxApi).toHaveBeenCalledTimes(1); // 確保只請求一次
      expect(result1).toEqual(mockResponse);
      expect(result2).toEqual(mockResponse);
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        "apitoken",
        "mock-token"
      );
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
      expect(ajaxApi).not.toHaveBeenCalled();
    });

    it("應在現有 Token 無效時獲取新 Token", async () => {
      mockStorage.getItem
        .mockReturnValueOnce("mock-token")
        .mockReturnValueOnce("2025-06-08T12:00:00Z"); // 過期
      vi.setSystemTime(new Date("2025-06-09T12:00:00Z"));
      const mockResponse: TokenResponse = {
        Token: "new-token",
        TokenExpire: "2025-06-10T12:00:00Z",
      };
      vi.mocked(ajaxApi).mockResolvedValue(mockResponse);

      const headers: Record<string, string> = {};
      const result = await auth.prepareAuthHeader(headers, "api/Some_Endpoint");

      expect(result).toBe(true);
      expect(headers).toEqual({
        Authorization: "Basic " + btoa(`${appAccount}:new-token`),
      });
      expect(ajaxApi).toHaveBeenCalledTimes(1);
      expect(mockStorage.setItem).toHaveBeenCalledWith("apitoken", "new-token");
    });

    it("應在 Token 獲取失敗時移除無效 Token 並返回 false", async () => {
      const emptyGuid = vi.fn();
      mockStorage.getItem
        .mockReturnValueOnce(emptyGuid())
        .mockReturnValueOnce("2025-06-10T12:00:00Z");
      vi.mocked(ajaxApi).mockResolvedValue({ ErrorMessage: "Token 獲取失敗" });

      const headers: Record<string, string> = {};

      const result = await auth.prepareAuthHeader(headers, "api/Some_Endpoint");

      expect(result).toBe(false);
      expect(headers).toEqual({});
      expect(mockStorage.removeItem).toHaveBeenCalledWith("apitoken");
      expect(mockStorage.removeItem).toHaveBeenCalledWith("apitokentimeout");
    });
  });
});
