/**
 * @module WebSocketClient
 * @description WebSocket 客戶端模組，負責管理 WebSocket 連線。
 * - 請注意裡面的方法都是 Promise，請使用 async/await 或 .then() 處理。
 * - 使用前請先引入 `WebSocketClient` 類別。
 */

/**
 * @typedef {Object} WebSocketOptions
 * @property {string} webSocketURL - WebSocket 伺服器的 URL。
 * @property {string} keyNo - 用戶唯一識別碼。
 * @property {string} clientIp - 客戶端的 IP 地址。
 * @property {string} funName - 角色名稱。
 * @property {string} name - 使用者名稱。
 * @property {string} memNo - 使用者 ID。
 * @property {string} notifyClientCountRole - 通知客戶端計數的角色。
 * @property {string} notifyClientAddCloseRole - 通知客戶端連線變化的角色。
 * @property {string} mapNo - 相關 ID (可選)。
 * @property {Function} callBack - 每個訊息收到的時候會執行的回調函數。
 */

/**
 * @class WebSocketClient
 * @description WebSocket 客戶端類別。
 * @example
 * const wsClient = new WebSocketClient({
 *  ...options
 * });
 * wsClient.CreateWebSocket();
 */
export class WebSocketClient {
  ws_lockReconnect = false; // 防止短時間內多次重連
  ws_reConTime = 1000; // 初始 1 秒，指數回退
  ws_maxReConTime = 30000; // 最大重連間隔 30 秒
  ws_ws = null; // WebSocket 物件
  ws_webSocketURL = "";
  ws_keyNo = "";
  ws_role = "";
  ws_clientIp = "";
  ws_name = "";
  ws_memNo = "";
  ws_notifyClientCountRole = "";
  ws_notifyClientAddCloseRole = "";
  ws_mapNo = "";
  ws_callBack = null;

  /**
   * @description 創建 WebSocket 連線。
   * @param {WebSocketOptions} options - WebSocket 連線的設定參數。
   * @example
   * const wsClient = new WebSocketClient({
   *   webSocketURL: "wss://example.com",
   *   keyNo: "12345",
   *   clientIp: "192.168.1.1",
   *   funName: "ChatRoom",
   *   name: "系統管理者",
   *   memNo: "2eb10ace-430a-4b5a-b88c-04862772fd9b.xlsx",
   *   notifyClientCountRole: "Admin",
   *   notifyClientAddCloseRole: "Moderator",
   *   callBack: (message) => console.log("收到訊息:", message)
   * });
   * wsClient.CreateWebSocket();
   */
  constructor(options = {}) {
    Object.assign(this, options);
  }

  /**
   * @description 初始化 WebSocket 連線。
   * @example
   *  await wsClient.CreateWebSocket();
   */
  async CreateWebSocket() {
    if (!this.ws_webSocketURL) return;
    try {
      if ("WebSocket" in window) {
        this.ws_ws = new WebSocket(
          `${this.ws_webSocketURL}/api/WSClient?keyno=${
            this.ws_keyNo
          }&ip=${encodeURIComponent(
            this.ws_clientIp
          )}&role=${encodeURIComponent(this.ws_role)}&name=${encodeURIComponent(
            this.ws_name
          )}&memno=${encodeURIComponent(
            this.ws_memNo
          )}&notifyclientcountrole=${encodeURIComponent(
            this.ws_notifyClientCountRole
          )}&notifyclientaddcloserole=${encodeURIComponent(
            this.ws_notifyClientAddCloseRole
          )}${this.ws_mapNo ? `&mapno=${this.ws_mapNo}` : ""}`
        );
        this.InitWebSocketEventHandle();
      }
    } catch (e) {
      await this.ReConnectWebSocket();
      console.log("WebSocket 建立連線發生錯誤: ", e);
    }
  }

  /**
   * @description 當連線失敗時，進行指數回退的重連機制。
   * @example
   *  await wsClient.ReConnectWebSocket();
   */
  async ReConnectWebSocket() {
    if (this.ws_lockReconnect || !this.ws_webSocketURL) return;
    this.ws_lockReconnect = true;
    setTimeout(async () => {
      console.log("WebSocket 重新連線");
      await this.CreateWebSocket();
      this.ws_reConTime = Math.min(this.ws_reConTime * 2, this.ws_maxReConTime); // 指數回退
      this.ws_lockReconnect = false;
    }, this.ws_reConTime);
  }

  /**
   * @description 設置 WebSocket 事件處理。
   * @example
   *  wsClient.InitWebSocketEventHandle();
   */
  InitWebSocketEventHandle() {
    this.ws_ws.onopen = () => {
      heartCheck.reset().start();
      this.ws_reConTime = 1000; // 連線成功後重置重連時間
      console.log("WebSocket 連線成功");
    };
    this.ws_ws.onclose = async () => {
      console.log("WebSocket 斷開");
      await this.ReConnectWebSocket();
    };
    this.ws_ws.onmessage = (e) => {
      heartCheck.reset().start();
      const msg = JSON.parse(e.data);
      if (
        msg.TypeCode !== "Pong" &&
        msg.TypeCode !== "Error" &&
        this.ws_callBack
      ) {
        this.ws_callBack(msg);
      }
    };
    this.ws_ws.onerror = () => {
      console.log("WebSocket 發生錯誤");
    };
  }
}

/**
 * @description WebSocket 心跳檢測，確保連線穩定。
 */
export const heartCheck = {
  timeout: 30000, // 心跳間隔 30 秒
  timeoutObj: null,
  serverTimeoutObj: null,
  /**
   * @description 重置心跳計時器。
   */
  reset() {
    clearTimeout(this.timeoutObj);
    clearTimeout(this.serverTimeoutObj);
    return this;
  },
  /**
   * @description 啟動心跳檢測。
   */
  start() {
    this.timeoutObj = setTimeout(() => {
      WebSocketClient.prototype.SendContent("{'TypeCode': 'Ping'}");
      this.serverTimeoutObj = setTimeout(() => {
        WebSocketClient.prototype.SetClose();
      }, this.timeout);
    }, this.timeout);
  },
};
