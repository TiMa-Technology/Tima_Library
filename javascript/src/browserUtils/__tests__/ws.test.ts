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

  it("應在 connect() 時建立 WebSocket 並觸發 onOpen", async () => {
    const onOpen = vi.fn();
    client.setEventHandlers({ onOpen });

    await client.connect();

    const openHandlerCall =
      mockWebSocketInstance.addEventListener.mock.calls.find(
        ([eventType]: any[]) => eventType === "open"
      );

    expect(openHandlerCall).toBeTruthy();
    expect(mockWebSocketInstance.addEventListener).toHaveBeenCalledWith(
      "open",
      expect.any(Function)
    );

    const openHandler = openHandlerCall[1];
    openHandler(new Event("open"));

    expect(client.getState()).toBe(WebSocketState.CONNECTED);
    expect(onOpen).toHaveBeenCalled();
  });

  it("應在連線後自動送出登入訊息", async () => {
    await client.connect();

    const openHandlerCall =
      mockWebSocketInstance.addEventListener.mock.calls.find(
        ([eventType]: any[]) => eventType === "open"
      );

    expect(openHandlerCall).toBeTruthy();
    const openHandler = openHandlerCall[1];
    openHandler(new Event("open"));

    const expectedLoginMessage = JSON.stringify({
      TypeCode: "Login",
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
    await client.connect();

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
    await client.connect();

    const openHandlerCall =
      mockWebSocketInstance.addEventListener.mock.calls.find(
        ([eventType]: any[]) => eventType === "open"
      );
    openHandlerCall[1](new Event("open"));

    vi.advanceTimersByTime(30000);
    expect(mockWebSocketInstance.send).toHaveBeenCalledWith(
      JSON.stringify({ TypeCode: "Ping" })
    );
  });

  it("應在錯誤發生後自動重連", async () => {
    const connectSpy = vi.spyOn(client, "connect");
    await client.connect();

    expect(connectSpy).toHaveBeenCalledTimes(1);
    const errorHandlerCall =
      mockWebSocketInstance.addEventListener.mock.calls.find(
        ([eventType]: any[]) => eventType === "error"
      );

    expect(errorHandlerCall).toBeTruthy();
    errorHandlerCall[1](new Event("error"));

    vi.advanceTimersByTime(2000);
    expect(connectSpy).toHaveBeenCalledTimes(2);
  });

  it("應在關閉時清除資源與更新狀態", async () => {
    const onClose = vi.fn();
    client.setEventHandlers({ onClose });

    await client.connect();
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
