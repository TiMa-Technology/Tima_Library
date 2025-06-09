import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  afterAll,
} from "vitest";
import { redirect, goBack } from "../navigation";

// 模擬 window 物件
const mockWindow = {
  location: {
    origin: "http://localhost",
    href: "",
    replace: vi.fn(),
    protocol: "",
    host: "",
    pathname: "",
    port: "",
  },
  open: vi.fn(),
  history: {
    back: vi.fn(),
  },
  setTimeout: vi.fn((_fn, _delay) => {
    // 不要立即執行回調，讓測試可以檢查調用
    return 1;
  }),
};

// 將模擬的 window 物件設置為全局變量
vi.stubGlobal("window", mockWindow);

describe("redirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers(); // 使用假的計時器
    mockWindow.location.href = "";
    // 設置預設的 location 屬性
    mockWindow.location.protocol = "http:";
    mockWindow.location.host = "localhost:3000";
    mockWindow.location.pathname = "/";
  });

  afterEach(() => {
    vi.restoreAllMocks(); // 恢復所有模擬，包括計時器
  });

  it("應檢查無效路徑並記錄錯誤", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    redirect(""); // 空路徑
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "redirect: 請提供有效的路徑或網址"
    );

    redirect("   "); // 只有空白的路徑
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "redirect: 請提供有效的路徑或網址"
    );

    redirect(123 as any); // 非字串類型
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "redirect: 請提供有效的路徑或網址"
    );

    consoleErrorSpy.mockRestore();
  });

  describe("開發環境 (localhost)", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.useFakeTimers(); // 使用假的計時器
      mockWindow.location.host = "localhost:3000";
      mockWindow.location.port = "3000";
      mockWindow.location.pathname = "/";
      mockWindow.location.origin = "http://localhost:3000";
    });

    afterAll(() => {
      vi.resetAllMocks();
    });

    it("應正確處理絕對路徑", () => {
      redirect("/dashboard");
      expect(mockWindow.location.href).toBe("http://localhost:3000/dashboard");
    });

    it("應正確處理相對路徑", () => {
      redirect("/users/profile.html");
      expect(mockWindow.location.href).toBe(
        "http://localhost:3000/users/profile.html"
      );
    });

    it("應正確處理完整 HTTP 網址", () => {
      redirect("http://external-site.com/page");
      expect(mockWindow.location.href).toBe("http://external-site.com/page");
    });

    it("應正確處理完整 HTTPS 網址", () => {
      redirect("https://secure-site.com/login");
      expect(mockWindow.location.href).toBe("https://secure-site.com/login");
    });
  });

  describe("生產環境 (IIS 虛擬目錄)", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.useFakeTimers(); // 使用假的計時器
      mockWindow.location.protocol = "https:";
      mockWindow.location.host = "example.com.tw";
      mockWindow.location.pathname = "/project1/users/profile";
      mockWindow.location.origin = "https://example.com.tw";
      mockWindow.location.port = "";
    });

    afterAll(() => {
      vi.resetAllMocks();
    });

    it("應正確處理絕對路徑並加上虛擬目錄", () => {
      redirect("/dashboard");
      expect(mockWindow.location.href).toBe(
        "https://example.com.tw/project1/dashboard"
      );
    });

    it("應正確處理相對路徑", () => {
      redirect("users/edit.html");
      expect(mockWindow.location.href).toBe(
        "https://example.com.tw/project1/users/edit.html"
      );
    });

    it("應正確處理完整網址（不受虛擬目錄影響）", () => {
      redirect("https://external-api.com/data");
      expect(mockWindow.location.href).toBe("https://external-api.com/data");
    });
  });

  describe("導向選項測試", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.useFakeTimers(); // 使用假的計時器
      mockWindow.location.host = "localhost:3000";
      mockWindow.location.pathname = "/";
    });

    afterAll(() => {
      vi.resetAllMocks();
    });

    it("應以指定延遲進行導向", () => {
      redirect("/dashboard", { delay: 1000 });
      expect(mockWindow.setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        1000
      );

      vi.advanceTimersByTime(1000);
      // 手動執行 setTimeout 的回調來測試邏輯
      const setTimeoutCall = mockWindow.setTimeout.mock.calls[0];
      const callback = setTimeoutCall[0];
      callback(); // 執行回調

      expect(mockWindow.location.href).toBe("http://localhost:3000/dashboard");
      expect(mockWindow.open).not.toHaveBeenCalled();
      expect(mockWindow.location.replace).not.toHaveBeenCalled();
    });

    it("應在新分頁中開啟", () => {
      redirect("/dashboard", { newTab: true });
      expect(mockWindow.open).toHaveBeenCalledWith(
        "http://localhost:3000/dashboard",
        "_blank"
      );
      expect(mockWindow.location.href).toBe(""); // 確保 href 未被設置
      expect(mockWindow.location.replace).not.toHaveBeenCalled();
      expect(mockWindow.setTimeout).not.toHaveBeenCalled();
    });

    it("應在新分頁中開啟完整網址", () => {
      redirect("https://external-site.com", { newTab: true });
      expect(mockWindow.open).toHaveBeenCalledWith(
        "https://external-site.com",
        "_blank"
      );
    });

    it("應使用 window.location.replace 進行導向", () => {
      redirect("/dashboard", { replace: true });
      expect(mockWindow.location.replace).toHaveBeenCalledWith(
        "http://localhost:3000/dashboard"
      );
      expect(mockWindow.location.href).toBe(""); // 確保 href 未被設置
      expect(mockWindow.open).not.toHaveBeenCalled();
      expect(mockWindow.setTimeout).not.toHaveBeenCalled();
    });

    it("應正確處理所有選項組合（newTab 優先於 replace）", () => {
      redirect("/dashboard", { delay: 500, newTab: true, replace: true });

      // 檢查 setTimeout 是否被正確調用
      expect(mockWindow.setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        500
      );

      // 手動執行 setTimeout 的回調來測試邏輯
      const setTimeoutCall = mockWindow.setTimeout.mock.calls[0];
      const callback = setTimeoutCall[0];
      callback(); // 執行回調

      // 檢查 newTab 優先於 replace
      expect(mockWindow.open).toHaveBeenCalledWith(
        "http://localhost:3000/dashboard",
        "_blank"
      );
      expect(mockWindow.location.replace).not.toHaveBeenCalled();
      expect(mockWindow.location.href).toBe("");
    });
  });

  describe("邊緣情況測試", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.useFakeTimers(); // 使用假的計時器
    });

    afterAll(() => {
      vi.resetAllMocks();
    });
    it("應正確處理根目錄虛擬目錄", () => {
      mockWindow.location.protocol = "https:";
      mockWindow.location.host = "example.com";
      mockWindow.location.pathname = "/";

      redirect("/test");
      expect(mockWindow.location.href).toBe("https://example.com/test");
    });

    it("應正確處理深層路徑的相對導向", () => {
      redirect("app/users/profile/settings/security.html");
      expect(mockWindow.location.href).toBe(
        "http://localhost:3000/app/users/profile/settings/security.html"
      );
    });

    it("應正確處理 127.0.0.1 開發環境", () => {
      mockWindow.location.host = "127.0.0.1:8080";
      mockWindow.location.pathname = "/";

      redirect("/api/test");
      expect(mockWindow.location.href).toBe("http://127.0.0.1:8080/api/test");
    });
  });
});

describe("goBack", () => {
  it("應調用 window.history.back", () => {
    goBack();
    expect(mockWindow.history.back).toHaveBeenCalled();
  });
});
