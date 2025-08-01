/**
 * @module WebSocketClient
 * @description WebSocket client module，負責管理 WebSocket 連線。
 * - 請注意裡面的方法都是 Promise，請使用 async/await 或 .then() 處理。
 * - 使用前請先引入 `WebSocketClient` 類別。
 */

/**
 * WebSocket 連線狀態枚舉
 */
export enum WebSocketState {
  CONNECTING = "connecting",
  CONNECTED = "connected",
  DISCONNECTING = "disconnecting",
  DISCONNECTED = "disconnected",
  ERROR = "error",
}

/**
 * WebSocket 訊息類型
 */
export interface WebSocketMessage {
  type: string;
  [key: string]: string;
}

/**
 * WebSocket 設定選項
 */
export interface WebSocketOptions {
  /** WebSocket 伺服器的 URL */
  webSocketURL: string;
  /** 用戶唯一識別碼 UUID，傳送到底層作為人數控管 */
  keyNo: string;
  /** 客戶端的 IP 地址 */
  clientIp: string;
  /** 角色名稱 */
  role: string;
  /** 使用者名稱 */
  name: string;
  /** 使用者 ID */
  memNo: string;
  /** 通知客戶端計數的角色 */
  notifyClientCountRole: string;
  /** 通知客戶端連線變化的角色 */
  notifyClientAddCloseRole: string;
  /** 相關 ID (可選) */
  mapNo?: string;
  /** 每個訊息收到的時候會執行的回調函數 */
  callBack: ((msg: WebSocketMessage) => void) | null;
  /** 是否啟用心跳檢查（預設啟用） */
  enableHeartCheck?: boolean;
  /** 心跳間隔時間（毫秒，預設 30000） */
  heartbeatInterval?: number;
  /** 心跳超時時間（毫秒，預設 30000） */
  heartbeatTimeout?: number;
  /** 最大重連次數（預設 3 可到 Infinity） */
  maxReconnectAttempts?: number;
  /** 初始重連間隔（毫秒，預設 1000） */
  initialReconnectDelay?: number;
  /** 最大重連間隔（毫秒，預設 30000） */
  maxReconnectDelay?: number;
}

/**
 * WebSocket 事件處理器介面
 */
export interface WebSocketEventHandlers {
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onStateChange?: (state: WebSocketState) => void;
}

/**
 * WebSocket Class, 詳細設定選項請參考型別檔案
 * @example
 * ```typescript
 * const wsClient = new WebSocketClient({
 *   webSocketURL: "wss://example.com",
 *   keyNo: "12345",
 *   clientIp: "192.168.1.1",
 *   role: "ChatRoom",
 *   name: "系統管理者",
 *   memNo: "2eb10ace-430a-4b5a-b88c-04862772fd9b",
 *   notifyClientCountRole: "Admin",
 *   notifyClientAddCloseRole: "Moderator",
 *   callBack: (message) => console.log("收到訊息:", message)
 * });
 *
 * await wsClient.connect();
 * ```
 */
export class WebSocketClient {
  private readonly options: Required<WebSocketOptions>;
  private socket: WebSocket | null = null;
  private currentState: WebSocketState = WebSocketState.DISCONNECTED;

  // 重連相關
  private lockReconnect = false;
  private reconnectAttempts = 0;
  private currentReconnectDelay: number;

  // 心跳相關
  private heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimeoutTimer: ReturnType<typeof setTimeout> | null = null;

  // 事件處理器
  private eventHandlers: WebSocketEventHandlers = {};

  constructor(options: WebSocketOptions) {
    // 設定預設值
    this.options = {
      enableHeartCheck: true,
      heartbeatInterval: 30000,
      heartbeatTimeout: 30000,
      maxReconnectAttempts: 3,
      initialReconnectDelay: 1000,
      maxReconnectDelay: 30000,
      mapNo: "",
      ...options,
    };

    this.currentReconnectDelay = this.options.initialReconnectDelay;
    this.validateOptions();
  }

  /**
   * 驗證配置選項
   */
  private validateOptions(): void {
    if (!this.options.webSocketURL) {
      throw new Error("webSocketURL 是必要的參數");
    }
    if (!this.options.keyNo) {
      throw new Error("keyNo 是必要的參數");
    }
    if (typeof this.options.callBack !== "function") {
      throw new Error("callBack 必須是一個函數");
    }
  }

  /**
   * 設定事件處理器
   */
  public setEventHandlers(handlers: WebSocketEventHandlers): this {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
    return this;
  }

  /**
   * 獲取當前連線狀態
   */
  public getState(): WebSocketState {
    return this.currentState;
  }

  /**
   * 檢查是否已連線
   */
  public isConnected(): boolean {
    return this.currentState === WebSocketState.CONNECTED;
  }

  /**
   * 更新連線狀態
   */
  private setState(state: WebSocketState): void {
    if (this.currentState !== state) {
      this.currentState = state;
      this.eventHandlers.onStateChange?.(state);
    }
  }

  /**
   * 建構 WebSocket URL
   */
  private buildWebSocketURL(): string {
    const params = new URLSearchParams({
      keyno: this.options.keyNo,
      ip: this.options.clientIp,
      role: this.options.role,
      name: this.options.name,
      memno: this.options.memNo,
      notifyclientcountrole: this.options.notifyClientCountRole,
      notifyclientaddcloserole: this.options.notifyClientAddCloseRole,
    });

    if (this.options.mapNo) {
      params.set("mapno", this.options.mapNo);
    }

    return `${this.options.webSocketURL}/api/WSClient?${params.toString()}`;
  }

  /**
   * 處理 WebSocket 連線，必須在使用前調用，且等待連線成功後才能發送訊息。
   * @returns Promise<void>
   */
  public async connect(): Promise<void> {
    if (
      this.currentState === WebSocketState.CONNECTING ||
      this.currentState === WebSocketState.CONNECTED
    ) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.setState(WebSocketState.CONNECTING);

        if (!("WebSocket" in window)) {
          throw new Error("瀏覽器不支援 WebSocket");
        }

        const url = this.buildWebSocketURL();
        this.socket = new WebSocket(url);

        // 設置一次性事件監聽器來處理連線結果
        const onOpen = () => {
          this.setState(WebSocketState.CONNECTED);
          this.reconnectAttempts = 0;
          this.currentReconnectDelay = this.options.initialReconnectDelay;

          // Send login message
          const loginMessage: WebSocketMessage = {
            type: "Login",
            name: this.options.name,
            memNo: this.options.memNo,
            notifyClientCountRole: this.options.notifyClientCountRole,
            notifyClientAddCloseRole: this.options.notifyClientAddCloseRole,
          };
          this.send(loginMessage);

          if (this.options.enableHeartCheck) {
            this.startHeartbeat();
          }

          console.log(
            `WebSocket 連線成功${this.options.enableHeartCheck ? "，開始心跳檢查" : ""}`
          );

          // 清理一次性監聽器
          this.socket?.removeEventListener("open", onOpen);
          this.socket?.removeEventListener("error", onError);

          // 設置持久性事件處理器
          this.setupEventHandlers();

          this.eventHandlers.onOpen?.();
          resolve(); // 連線成功，resolve Promise
        };

        const onError = (event: Event) => {
          this.setState(WebSocketState.ERROR);
          console.error("WebSocket 建立連線發生錯誤:", event);

          // 清理一次性監聽器
          this.socket?.removeEventListener("open", onOpen);
          this.socket?.removeEventListener("error", onError);

          reject(new Error("WebSocket 連線失敗")); // 連線失敗，reject Promise
        };

        // 添加一次性事件監聽器
        this.socket.addEventListener("open", onOpen);
        this.socket.addEventListener("error", onError);
      } catch (error) {
        this.setState(WebSocketState.ERROR);
        console.error("WebSocket 建立連線發生錯誤:", error);
        reject(error); // 同步錯誤也要 reject
      }
    });
  }

  /**
   * 設置 WebSocket 持久性事件處理（不包含 open 事件，因為已經在 connect 中處理）
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.addEventListener("close", (event) => {
      this.setState(WebSocketState.DISCONNECTED);
      this.stopHeartbeat();
      console.log("WebSocket 連線關閉");
      this.eventHandlers.onClose?.(event);
      if (event.code !== 1000) {
        this.handleReconnect();
      }
    });

    this.socket.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        if (this.options.enableHeartCheck) {
          this.resetHeartbeat();
        }
        if (message.TypeCode === "Pong") {
          this.clearHeartbeatTimeout();
          return;
        }
        if (message.type !== "Error") {
          this.options.callBack?.(message);
          this.eventHandlers.onMessage?.(message);
        }
      } catch (error) {
        console.error("解析 WebSocket 訊息時發生錯誤:", error);
      }
    });

    this.socket.addEventListener("error", (event) => {
      this.setState(WebSocketState.ERROR);
      console.error("WebSocket 發生錯誤");
      this.eventHandlers.onError?.(event);
      // 嘗試重連
      console.warn("嘗試重新連線...");
      this.handleReconnect();
    });
  }

  /**
   * 處理重連, 將重連次數 log
   */
  private async handleReconnect(): Promise<void> {
    if (
      this.lockReconnect ||
      this.reconnectAttempts >= this.options.maxReconnectAttempts
    ) {
      return;
    }

    this.lockReconnect = true;
    this.reconnectAttempts++;

    setTimeout(async () => {
      console.log(`WebSocket 重新連線 (第 ${this.reconnectAttempts} 次嘗試)`);
      try {
        await this.connect();
      } catch (error) {
        console.error("重連失敗:", error);
      }

      // 指數回退嘗試
      this.currentReconnectDelay = Math.min(
        this.currentReconnectDelay * 2,
        this.options.maxReconnectDelay
      );
      this.lockReconnect = false;
    }, this.currentReconnectDelay);
  }

  /**
   * 開始心跳檢查
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatTimer = setTimeout(() => {
      this.sendHeartbeat();
    }, this.options.heartbeatInterval);
  }

  /**
   * 重置心跳計時器
   */
  private resetHeartbeat(): void {
    if (this.options.enableHeartCheck && this.isConnected()) {
      this.startHeartbeat();
    }
  }

  /**
   * 發送心跳
   */
  private sendHeartbeat(): void {
    if (this.isConnected()) {
      this.send({ type: "Message", TypeCode: "Ping" });

      // 設置心跳超時檢查
      this.heartbeatTimeoutTimer = setTimeout(() => {
        console.warn("心跳超時，關閉連線");
        this.disconnect();
      }, this.options.heartbeatTimeout);
    }
  }

  /**
   * 清除心跳超時計時器
   */
  private clearHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
  }

  /**
   * 停止心跳檢查
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.clearHeartbeatTimeout();
  }

  /**
   * 發送訊息
   * @param message - 要發送的訊息物件
   */
  public send(message: WebSocketMessage | string): boolean {
    if (!this.isConnected() || !this.socket) {
      console.warn("WebSocket 未連線，無法發送訊息");
      return false;
    }

    try {
      const data =
        typeof message === "string" ? message : JSON.stringify(message);
      this.socket.send(data);
      return true;
    } catch (error) {
      console.error("發送 WebSocket 訊息時發生錯誤:", error);
      return false;
    }
  }

  /**
   * 主動關閉連線
   */
  public disconnect(): void {
    if (this.socket) {
      this.setState(WebSocketState.DISCONNECTING);
      this.stopHeartbeat();
      this.socket.close(1000, "Client disconnect");
      this.socket = null;
    }
  }

  /**
   * 清理資源
   */
  public destroy(): void {
    this.disconnect();
    this.lockReconnect = true;
    this.eventHandlers = {};
  }
}

/** 
 * * 使用範例
const wsClient = new WebSocketClient({
  webSocketURL: "wss://example.com",
  keyNo: "12345",
  clientIp: "192.168.1.1",
  role: "ChatRoom",
  name: "系統管理者",
  memNo: "user-id-123",
  notifyClientCountRole: "Admin",
  notifyClientAddCloseRole: "Moderator",
  callBack: (message) => console.log("收到訊息:", message),
  maxReconnectAttempts: 5,
  heartbeatInterval: 25000
});

// 設定事件處理器
wsClient.setEventHandlers({
  onOpen: () => console.log('連線已建立'),
  onClose: (event) => console.log('連線已關閉', event),
  onStateChange: (state) => console.log('狀態變化:', state)
});

// 連線
await wsClient.connect();

// 發送訊息
wsClient.send({ type: 'Message', content: 'Hello World' });

// 關閉連線
wsClient.disconnect();
 */
