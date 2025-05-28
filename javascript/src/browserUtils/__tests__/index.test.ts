import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { redirect, goBack } from "../index";

// 模擬 window 物件
const mockWindow = {
  location: {
    origin: "http://localhost",
    href: "",
    replace: vi.fn(),
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
  });

  afterEach(() => {
    vi.restoreAllMocks(); // 恢復所有模擬，包括計時器
  });

  it("應檢查無效路徑並記錄錯誤", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    redirect("invalid"); // 無效路徑（不以 / 開頭）
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "redirect: 請提供有效的站內路徑（需以 / 開頭）"
    );

    redirect(""); // 空路徑
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "redirect: 請提供有效的站內路徑（需以 / 開頭）"
    );

    redirect(123 as any); // 非字串類型
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "redirect: 請提供有效的站內路徑（需以 / 開頭）"
    );

    consoleErrorSpy.mockRestore();
  });

  it("應使用 window.location.href 進行導向（無選項）", () => {
    redirect("/dashboard");
    expect(mockWindow.location.href).toBe("/dashboard");
    expect(mockWindow.setTimeout).not.toHaveBeenCalled();
    expect(mockWindow.open).not.toHaveBeenCalled();
    expect(mockWindow.location.replace).not.toHaveBeenCalled();
  });

  it("應以指定延遲進行導向", () => {
    redirect("/dashboard", { delay: 1000 });
    expect(mockWindow.setTimeout).toHaveBeenCalledWith(
      expect.any(Function),
      1000
    );
    // 快進時間來觸發 setTimeout
    vi.advanceTimersByTime(500);

    // 手動執行 setTimeout 的回調來測試邏輯
    const setTimeoutCall = mockWindow.setTimeout.mock.calls[0];
    const callback = setTimeoutCall[0];
    callback(); // 執行回調

    expect(mockWindow.location.href).toBe("/dashboard");
    expect(mockWindow.open).not.toHaveBeenCalled();
    expect(mockWindow.location.replace).not.toHaveBeenCalled();
  });

  it("應在新分頁中開啟完整 URL", () => {
    redirect("/dashboard", { newTab: true });
    expect(mockWindow.open).toHaveBeenCalledWith(
      "http://localhost/dashboard",
      "_blank"
    );
    expect(mockWindow.location.href).toBe(""); // 確保 href 未被設置
    expect(mockWindow.location.replace).not.toHaveBeenCalled();
    expect(mockWindow.setTimeout).not.toHaveBeenCalled();
  });

  it("應使用 window.location.replace 進行導向", () => {
    redirect("/dashboard", { replace: true });
    expect(mockWindow.location.replace).toHaveBeenCalledWith("/dashboard");
    expect(mockWindow.location.href).toBe(""); // 確保 href 未被設置
    expect(mockWindow.open).not.toHaveBeenCalled();
    expect(mockWindow.setTimeout).not.toHaveBeenCalled();
  });

  it("應正確處理所有選項組合", () => {
    redirect("/dashboard", { delay: 500, newTab: true, replace: true });

    // 檢查 setTimeout 是否被正確調用
    expect(mockWindow.setTimeout).toHaveBeenCalledWith(
      expect.any(Function),
      500
    );

    // 快進時間來觸發 setTimeout
    vi.advanceTimersByTime(500);

    // 手動執行 setTimeout 的回調來測試邏輯
    const setTimeoutCall = mockWindow.setTimeout.mock.calls[0];
    const callback = setTimeoutCall[0];
    callback(); // 執行回調

    // 檢查 newTab 優先於 replace
    expect(mockWindow.open).toHaveBeenCalledWith(
      "http://localhost/dashboard",
      "_blank"
    );
    expect(mockWindow.location.replace).not.toHaveBeenCalled();
    expect(mockWindow.location.href).toBe("");
  });
});

describe("goBack", () => {
  it("應調用 window.history.back", () => {
    goBack();
    expect(mockWindow.history.back).toHaveBeenCalled();
  });
});
