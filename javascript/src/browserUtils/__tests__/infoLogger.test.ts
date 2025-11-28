import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockedFunction,
} from "vitest";
import { InfoLogger } from "../infoLogger";
import { handleApiError } from "../../baseFunction";
import { customRequest, type ApiStateManager } from "../fetcher";

vi.mock("../../baseFunction");
vi.mock("../fetcher");

// Mock navigator
const mockNavigator = {
  userAgent: "",
  userAgentData: undefined as { platform?: string } | undefined,
};

vi.stubGlobal("window", {
  location: {
    href: "https://example.com/test",
  },
  writable: true,
});

vi.stubGlobal("navigator", mockNavigator);

describe("InfoLogger", () => {
  let mockApiStateManager: ApiStateManager;
  let infoLogger: InfoLogger;
  let mockAjaxApi: MockedFunction<typeof customRequest>;
  let mockHandleApiError: MockedFunction<typeof handleApiError>;

  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks();

    // 建立 mock ApiStateManager
    mockApiStateManager = {} as ApiStateManager;

    // 設定 mock 函數
    mockAjaxApi = vi.mocked(customRequest);
    mockHandleApiError = vi.mocked(handleApiError);

    // 建立 InfoLogger 實例
    infoLogger = new InfoLogger(mockApiStateManager);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("應正確初始化 ApiStateManager", () => {
      const logger = new InfoLogger(mockApiStateManager);
      expect(logger["apiStateManager"]).toBe(mockApiStateManager);
    });
  });

  describe("getPlatform", () => {
    it("應返回 userAgentData.platform 當存在時", () => {
      mockNavigator.userAgentData = { platform: "Linux" };
      expect(InfoLogger.getPlatform()).toBe("Linux");
    });

    it("應偵測 iPhone", () => {
      mockNavigator.userAgentData = undefined;
      mockNavigator.userAgent =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)";
      expect(InfoLogger.getPlatform()).toBe("iPhone");
    });

    it("應偵測 iPad", () => {
      mockNavigator.userAgentData = undefined;
      mockNavigator.userAgent = "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)";
      expect(InfoLogger.getPlatform()).toBe("iPad");
    });

    it("應偵測 Android", () => {
      mockNavigator.userAgentData = undefined;
      mockNavigator.userAgent = "Mozilla/5.0 (Linux; Android 10; SM-G973F)";
      expect(InfoLogger.getPlatform()).toBe("Android");
    });

    it("應偵測 Windows", () => {
      mockNavigator.userAgentData = undefined;
      mockNavigator.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
      expect(InfoLogger.getPlatform()).toBe("Windows");
    });

    it("應偵測 Mac", () => {
      mockNavigator.userAgentData = undefined;
      mockNavigator.userAgent =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)";
      expect(InfoLogger.getPlatform()).toBe("Mac");
    });

    it("應返回 PC 作為預設值", () => {
      mockNavigator.userAgentData = undefined;
      mockNavigator.userAgent = "Mozilla/5.0 (X11; Linux x86_64)";
      expect(InfoLogger.getPlatform()).toBe("PC");
    });

    it("應進行不區分大小寫的比對", () => {
      mockNavigator.userAgentData = undefined;
      mockNavigator.userAgent =
        "Mozilla/5.0 (iphone; CPU iPhone OS 14_0 like Mac OS X)";
      expect(InfoLogger.getPlatform()).toBe("iPhone");
    });
  });

  describe("log", () => {
    const mockLogOptions = {
      bMemNo: "TEST123",
      type: "INFO",
      message: "Test message",
      message2: "Test message 2",
      message3: "Test message 3",
      url: "https://custom.url.com",
    };

    beforeEach(() => {
      // Mock getPlatform
      vi.spyOn(InfoLogger, "getPlatform").mockReturnValue("TestPlatform");
    });

    it("應成功發送完整的 log 資料", async () => {
      mockAjaxApi.mockResolvedValue({});

      await infoLogger.log(mockLogOptions);

      expect(mockAjaxApi).toHaveBeenCalledWith(mockApiStateManager, {
        method: "GET",
        endpoint: "My_Log_Info",
        requestBody: {
          bmemno: "TEST123",
          type: "INFO",
          message: "Test message",
          message2: "Test message 2",
          message3: "Test message 3",
          url: "https://custom.url.com",
          platform: "TestPlatform",
        },
      });
    });

    it("應使用預設值當選項未提供時", async () => {
      mockAjaxApi.mockResolvedValue({});

      await infoLogger.log({
        bMemNo: "TEST123",
        type: "INFO",
        message: "Test message",
      });

      expect(mockAjaxApi).toHaveBeenCalledWith(mockApiStateManager, {
        method: "GET",
        endpoint: "My_Log_Info",
        requestBody: {
          bmemno: "TEST123",
          type: "INFO",
          message: "Test message",
          message2: "",
          message3: "",
          url: "https://example.com/test",
          platform: "TestPlatform",
        },
      });
    });

    it("應處理 null bMemNo", async () => {
      mockAjaxApi.mockResolvedValue({});

      await infoLogger.log({
        bMemNo: null,
        type: "ERROR",
        message: "Error message",
      });

      expect(mockAjaxApi).toHaveBeenCalledWith(mockApiStateManager, {
        method: "GET",
        endpoint: "My_Log_Info",
        requestBody: {
          bmemno: null,
          type: "ERROR",
          message: "Error message",
          message2: "",
          message3: "",
          url: "https://example.com/test",
          platform: "TestPlatform",
        },
      });
    });

    it("應在 API 呼叫失敗時處理錯誤", async () => {
      const mockError = new Error("API Error");
      const mockErrorMessage = "Handled error message";

      mockAjaxApi.mockRejectedValue(mockError);
      mockHandleApiError.mockReturnValue({
        message: mockErrorMessage,
        type: "network",
        showToUser: true,
        shouldRetry: false,
      });

      // Mock console.error
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await infoLogger.log(mockLogOptions);

      expect(mockHandleApiError).toHaveBeenCalledWith(mockError);
      expect(consoleSpy).toHaveBeenCalledWith(
        "紀錄 Info log 錯誤: ",
        mockErrorMessage
      );

      consoleSpy.mockRestore();
    });

    it("應不會重新拋出錯誤", async () => {
      const mockError = new Error("API Error");
      mockAjaxApi.mockRejectedValue(mockError);
      mockHandleApiError.mockReturnValue({
        message: "Error handled",
        type: "network",
        showToUser: true,
        shouldRetry: false,
      });

      // Mock console.error 以避免測試輸出
      vi.spyOn(console, "error").mockImplementation(() => {});

      // 這不應該拋出錯誤
      await expect(infoLogger.log(mockLogOptions)).resolves.toBeUndefined();
    });

    it("應使用當前的 window.location.href 作為預設 URL", async () => {
      window.location.href = "https://different.url.com/page";

      mockAjaxApi.mockResolvedValue({});

      await infoLogger.log({
        bMemNo: "TEST123",
        type: "INFO",
        message: "Test message",
      });

      expect(mockAjaxApi).toHaveBeenCalledWith(mockApiStateManager, {
        method: "GET",
        endpoint: "My_Log_Info",
        requestBody: {
          bmemno: "TEST123",
          type: "INFO",
          message: "Test message",
          message2: "",
          message3: "",
          url: "https://different.url.com/page",
          platform: "TestPlatform",
        },
      });
    });
  });
});
