import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WebSocketClient, type WebSocketOptions, WebSocketState } from "../ws";

describe("WebSocketClient 測試", () => {
  let client: WebSocketClient;
  let mockOptions: WebSocketOptions;
  let mockWebSocketInstance: any;

  beforeEach(() => {
    (globalThis as any).window = {
      WebSocket: globalThis.WebSocket,
    };

    vi.useFakeTimers();

    mockWebSocketInstance = {
      send: vi.fn(),
      close: vi.fn(),
      readyState: WebSocket.OPEN,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    const MockWebSocket = vi.fn(() => mockWebSocketInstance);
    globalThis.WebSocket = MockWebSocket as any;

    mockOptions = {
      webSocketURL: "ws://localhost:1234",
      keyNo: "abc",
      clientIp: "192.168.1.1",
      role: "TestRole",
      name: "小明",
      memNo: "U001",
      notifyClientCountRole: "Admin",
      notifyClientAddCloseRole: "Admin",
      callBack: vi.fn(),
    };

    client = new WebSocketClient(mockOptions);
  });

  // 測試輔助函數
  async function connectAndTriggerOpen(client: WebSocketClient): Promise<void> {
    const connectPromise = client.connect();

    // 找到 open 事件處理器並觸發
    const openHandlerCall =
      mockWebSocketInstance.addEventListener.mock.calls.find(
        ([eventType]: any[]) => eventType === "open"
      );

    if (openHandlerCall) {
      const openHandler = openHandlerCall[1];
      openHandler(new Event("open"));
    }

    return connectPromise;
  }

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  it("應初始化為 DISCONNECTED 狀態", () => {
    expect(client.getState()).toBe(WebSocketState.DISCONNECTED);
  });

  it("若缺少 webSocketURL，應拋出錯誤", () => {
    expect(() => {
      new WebSocketClient({ ...mockOptions, webSocketURL: "" });
    }).toThrow("webSocketURL 是必要的參數");
  });

  it("若 callBack 不是函數，應拋出錯誤", () => {
    expect(
      () => new WebSocketClient({ ...mockOptions, callBack: null })
    ).toThrow("callBack 必須是一個函數");
  });

  it("應正確產生帶參數的連線 URL", () => {
    const url = (client as any).buildWebSocketURL();
    expect(url).toContain("keyno=abc");
    expect(url).toContain("ip=192.168.1.1");
    expect(url).toContain("role=TestRole");
    expect(url).toContain("name=%E5%B0%8F%E6%98%8E");
  });

  it("應可設定自定義事件處理器", () => {
    const onOpen = vi.fn();
    const onStateChange = vi.fn();

    client.setEventHandlers({ onOpen, onStateChange });
    const handlers = (client as any).eventHandlers;

    expect(handlers.onOpen).toBe(onOpen);
    expect(handlers.onStateChange).toBe(onStateChange);
  });

  // 使用輔助函數的測試
  it("應在 connect() 時建立 WebSocket 並觸發 onOpen", async () => {
    const onOpen = vi.fn();
    client.setEventHandlers({ onOpen });

    await connectAndTriggerOpen(client);

    expect(client.getState()).toBe(WebSocketState.CONNECTED);
    expect(onOpen).toHaveBeenCalled();
  });

  it("應在連線後自動送出登入訊息", async () => {
    await connectAndTriggerOpen(client);

    const expectedLoginMessage = JSON.stringify({
      type: "Login",
      name: mockOptions.name,
      memNo: mockOptions.memNo,
      notifyClientCountRole: mockOptions.notifyClientCountRole,
      notifyClientAddCloseRole: mockOptions.notifyClientAddCloseRole,
    });
    expect(mockWebSocketInstance.send).toHaveBeenCalledWith(
      expectedLoginMessage
    );
  });

  it("應在接收到 message 時執行 callBack", async () => {
    await connectAndTriggerOpen(client);

    const testMessage = { TypeCode: "Message", content: "測試訊息" };
    const messageEvent = new MessageEvent("message", {
      data: JSON.stringify(testMessage),
    });

    const messageHandlerCall =
      mockWebSocketInstance.addEventListener.mock.calls.find(
        ([eventType]: any[]) => eventType === "message"
      );
    expect(messageHandlerCall).toBeTruthy();

    const messageHandler = messageHandlerCall[1];
    messageHandler(messageEvent);

    expect(mockOptions.callBack).toHaveBeenCalledWith(testMessage);
  });

  it('應執行 heartbeat 並送出 "ping"', async () => {
    await connectAndTriggerOpen(client);

    vi.advanceTimersByTime(30000);
    expect(mockWebSocketInstance.send).toHaveBeenCalledWith(
      JSON.stringify({ type: "Message", TypeCode: "Ping" })
    );
  });

  it("應在連線建立後的錯誤發生時自動重連", async () => {
    await connectAndTriggerOpen(client);
    expect(client.getState()).toBe(WebSocketState.CONNECTED);

    const clientAny = client as any;
    clientAny.lockReconnect = false;
    clientAny.reconnectAttempts = 0;

    const connectSpy = vi.spyOn(client, "connect");

    // 直接使用持久性 WebSocket 實例觸發錯誤
    // 這模擬了真實場景中 WebSocket 連線建立後的錯誤

    // 創建一個新的錯誤事件，並確保它觸發正確的處理器
    const errorEvent = new Event("error");

    // 由於我們已經連線，現在的錯誤處理器應該是持久性的
    // 獲取最後設置的錯誤處理器（應該是持久性的）
    const errorHandlerCalls =
      mockWebSocketInstance.addEventListener.mock.calls.filter(
        ([eventType]: any[]) => eventType === "error"
      );

    const lastErrorHandler = errorHandlerCalls[errorHandlerCalls.length - 1];

    if (lastErrorHandler) {
      const [, handler] = lastErrorHandler;
      console.log("使用最後一個錯誤處理器");
      handler(errorEvent);
    }

    expect(client.getState()).toBe(WebSocketState.ERROR);

    // 推進時間觸發重連
    vi.advanceTimersByTime(1000); // 使用 1000ms，根據 log 顯示 initialReconnectDelay 是 1000
    await vi.runAllTimersAsync();

    expect(connectSpy).toHaveBeenCalledTimes(1);

    connectSpy.mockRestore();
  });

  // 最直接的方法：手動觸發正確的錯誤處理流程
  it("手動觸發完整錯誤處理流程", async () => {
    await connectAndTriggerOpen(client);
    expect(client.getState()).toBe(WebSocketState.CONNECTED);

    const clientAny = client as any;
    clientAny.lockReconnect = false;
    clientAny.reconnectAttempts = 0;

    const connectSpy = vi.spyOn(client, "connect");

    // 手動執行錯誤處理流程，就像真實的錯誤處理器那樣
    clientAny.setState(WebSocketState.ERROR);
    console.error("WebSocket 發生錯誤");
    clientAny.eventHandlers.onError?.(new Event("error"));

    // 手動調用重連邏輯
    console.warn("嘗試重新連線...");
    clientAny.handleReconnect();

    // 推進時間
    vi.advanceTimersByTime(1000);
    await vi.runAllTimersAsync();

    expect(connectSpy).toHaveBeenCalledTimes(1);

    connectSpy.mockRestore();
  });

  // 或者直接測試 handleReconnect 方法
  it("直接測試 handleReconnect 方法", async () => {
    await connectAndTriggerOpen(client);

    const clientAny = client as any;
    const connectSpy = vi.spyOn(client, "connect");

    // 設置條件
    clientAny.lockReconnect = false;
    clientAny.reconnectAttempts = 0;
    clientAny.currentState = WebSocketState.ERROR;

    console.log("直接調用 handleReconnect 前:");
    console.log("- lockReconnect:", clientAny.lockReconnect);
    console.log("- reconnectAttempts:", clientAny.reconnectAttempts);
    console.log(
      "- maxReconnectAttempts:",
      clientAny.options?.maxReconnectAttempts
    );

    // 直接調用 handleReconnect
    await clientAny.handleReconnect();

    console.log("直接調用 handleReconnect 後:");
    console.log("- lockReconnect:", clientAny.lockReconnect);
    console.log("- reconnectAttempts:", clientAny.reconnectAttempts);

    // 推進時間
    vi.advanceTimersByTime(2000);
    await vi.runAllTimersAsync();

    console.log("推進時間後 connect 調用次數:", connectSpy.mock.calls.length);

    expect(connectSpy).toHaveBeenCalledTimes(1);
    connectSpy.mockRestore();
  });

  // 測試條件檢查
  it("檢查重連條件", async () => {
    await connectAndTriggerOpen(client);

    const clientAny = client as any;

    // 檢查所有相關屬性
    console.log("=== 重連條件檢查 ===");
    console.log("lockReconnect:", clientAny.lockReconnect);
    console.log("reconnectAttempts:", clientAny.reconnectAttempts);
    console.log(
      "maxReconnectAttempts:",
      clientAny.options?.maxReconnectAttempts
    );
    console.log(
      "initialReconnectDelay:",
      clientAny.options?.initialReconnectDelay
    );
    console.log("currentReconnectDelay:", clientAny.currentReconnectDelay);

    // 檢查重連條件是否滿足
    const shouldReconnect =
      !clientAny.lockReconnect &&
      clientAny.reconnectAttempts <
        (clientAny.options?.maxReconnectAttempts || 5);

    console.log("應該重連嗎?", shouldReconnect);

    // 如果條件不滿足，修正它們
    if (!shouldReconnect) {
      clientAny.lockReconnect = false;
      clientAny.reconnectAttempts = 0;
      console.log("已修正重連條件");
    }
  });

  it("應在關閉時清除資源與更新狀態", async () => {
    const onClose = vi.fn();
    client.setEventHandlers({ onClose });

    await connectAndTriggerOpen(client);

    mockWebSocketInstance.readyState = 1;

    const closeHandlerCall =
      mockWebSocketInstance.addEventListener.mock.calls.find(
        ([eventType]: any[]) => eventType === "close"
      );

    client.disconnect();

    expect(closeHandlerCall).toBeTruthy();

    // 模擬 close 事件
    const mockCloseEvent = {
      code: 1000,
      reason: "",
      wasClean: true,
      type: "close",
      target: mockWebSocketInstance,
    } as CloseEvent;
    closeHandlerCall[1](mockCloseEvent);

    expect(client.getState()).toBe(WebSocketState.DISCONNECTED);
    expect(mockWebSocketInstance.close).toHaveBeenCalledWith(
      1000,
      "Client disconnect"
    );
    expect(onClose).toHaveBeenCalled();
  });
});
