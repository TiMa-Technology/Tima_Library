// src/baseFunction/utils.ts
import { clearTimeout as clearTimeout2 } from "timers";
function newGuid() {
  return crypto.randomUUID();
}
function emptyGuid() {
  return "00000000-0000-0000-0000-000000000000";
}
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};
var handleApiError = (error) => {
  if (typeof error === "object" && error !== null) {
    const err = error;
    if (err.isApiError) {
      return {
        type: "business",
        message: `\u64CD\u4F5C\u5931\u6557: ${err.message ?? ""}`,
        showToUser: true,
        shouldRetry: false
      };
    }
    const status = parseInt(String(err.status));
    if (status === 401) {
      return {
        type: "auth",
        message: "\u767B\u5165\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u767B\u5165",
        showToUser: true,
        shouldRetry: false,
        action: "redirect_login"
      };
    }
    if (!isNaN(status) && status >= 500) {
      return {
        type: "server",
        message: "\u4F3A\u670D\u5668\u66AB\u6642\u7121\u6CD5\u56DE\u61C9",
        showToUser: true,
        shouldRetry: true
      };
    }
  }
  return {
    type: "network",
    message: `\u7CFB\u7D71\u932F\u8AA4: ${error?.message || "\u672A\u77E5\u932F\u8AA4"}`,
    showToUser: true,
    shouldRetry: true
  };
};
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
function removeDuplicate(arr) {
  return [...new Set(arr)];
}
function camelToSnake(str) {
  return str.replace(/([A-Z])/g, "_$1").toLowerCase();
}
function snakeToCamel(str) {
  return str.replace(/^_+|_+$/g, "").replace(/_+(.)/g, (_, char) => char.toUpperCase());
}
function getRandomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
}
function flattenArray(arr) {
  return arr.flat(Infinity);
}
function sortByKey(array, key) {
  return [...array].sort((a, b) => a[key] > b[key] ? 1 : -1);
}
function convertArrayToObject(arr, key) {
  return arr.reduce(
    (obj, item) => {
      obj[item[key]] = item;
      return obj;
    },
    {}
  );
}
function objToQueryString(obj) {
  return Object.keys(obj).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`).join("&");
}
function debounce(func, delay, immediate = false) {
  let timeoutId = null;
  let lastArgs = null;
  const debouncedFunction = (...args) => {
    lastArgs = args;
    const callNow = immediate && !timeoutId;
    if (timeoutId) {
      clearTimeout2(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate && lastArgs) {
        func(...lastArgs);
      }
    }, delay);
    if (callNow) {
      func(...args);
    }
  };
  debouncedFunction.cancel = () => {
    if (timeoutId) {
      clearTimeout2(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };
  debouncedFunction.flush = (...args) => {
    if (timeoutId) {
      clearTimeout2(timeoutId);
      timeoutId = null;
    }
    const argsToUse = args.length > 0 ? args : lastArgs;
    if (argsToUse) {
      return func(...argsToUse);
    }
    return func();
  };
  debouncedFunction.pending = () => {
    return timeoutId !== null;
  };
  return debouncedFunction;
}
function debounceAsync(func, delay) {
  let timeoutId;
  let promiseResolve = null;
  let promiseReject = null;
  return (...args) => {
    return new Promise((resolve, reject) => {
      if (timeoutId) {
        clearTimeout2(timeoutId);
      }
      if (promiseReject) {
        promiseReject(new Error("Debounced function called again"));
      }
      promiseResolve = resolve;
      promiseReject = reject;
      timeoutId = setTimeout(async () => {
        try {
          const result = await func(...args);
          if (promiseResolve) {
            promiseResolve(result);
          }
        } catch (error) {
          if (promiseReject) {
            promiseReject(error);
          }
        } finally {
          promiseResolve = null;
          promiseReject = null;
        }
      }, delay);
    });
  };
}
function throttle(func, delay = 500, options = {}) {
  let timeoutId = null;
  let lastExecTime = 0;
  let lastArgs = null;
  let lastResult;
  const { leading = true, trailing = true } = options;
  const throttledFunction = (...args) => {
    const now = Date.now();
    const timeSinceLastExec = now - lastExecTime;
    lastArgs = args;
    if (!lastExecTime && !leading) {
      lastExecTime = now;
    }
    if (timeSinceLastExec >= delay) {
      if (timeoutId) {
        clearTimeout2(timeoutId);
        timeoutId = null;
      }
      if (leading) {
        lastExecTime = now;
        lastResult = func(...args);
        return lastResult;
      } else {
        lastExecTime = now;
      }
    }
    if (trailing && !timeoutId) {
      timeoutId = setTimeout(() => {
        if (!leading) {
          lastExecTime = Date.now();
          if (lastArgs) {
            lastResult = func(...lastArgs);
          }
        } else if (timeSinceLastExec < delay) {
          lastExecTime = Date.now();
          if (lastArgs) {
            lastResult = func(...lastArgs);
          }
        }
        timeoutId = null;
      }, delay - timeSinceLastExec);
    }
    return lastResult;
  };
  throttledFunction.cancel = () => {
    if (timeoutId) {
      clearTimeout2(timeoutId);
      timeoutId = null;
    }
    lastExecTime = 0;
    lastArgs = null;
  };
  throttledFunction.flush = () => {
    if (timeoutId) {
      clearTimeout2(timeoutId);
      timeoutId = null;
    }
    if (lastArgs) {
      lastExecTime = Date.now();
      lastResult = func(...lastArgs);
      return lastResult;
    }
    return lastResult;
  };
  throttledFunction.pending = () => {
    return timeoutId !== null;
  };
  return throttledFunction;
}
function throttleAnimationFrame(func) {
  let rafId = null;
  let lastArgs = null;
  return (...args) => {
    lastArgs = args;
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          func(...lastArgs);
        }
        rafId = null;
        lastArgs = null;
      });
    }
  };
}
function isEqual(value, other) {
  if (typeof value !== "object" && typeof other !== "object") {
    const isValueNaN = typeof value === "number" && Number.isNaN(value);
    const isOtherNaN = typeof other === "number" && Number.isNaN(other);
    if (isValueNaN && isOtherNaN) {
      return true;
    }
    return value === other;
  }
  if (value === null && other === null) {
    return true;
  }
  if (typeof value !== typeof other || value === null || other === null) {
    return false;
  }
  if (value === other) {
    return true;
  }
  if (Array.isArray(value) && Array.isArray(other)) {
    if (value.length !== other.length) {
      return false;
    }
    for (let i = 0; i < value.length; i++) {
      if (!isEqual(value[i], other[i])) {
        return false;
      }
    }
    return true;
  }
  if (Array.isArray(value) || Array.isArray(other)) {
    return false;
  }
  const valueKeys = Object.keys(value);
  const otherKeys = Object.keys(other);
  if (valueKeys.length !== otherKeys.length) {
    return false;
  }
  for (const key of valueKeys) {
    if (!(key in other)) {
      return false;
    }
    const val = value[key];
    const oth = other[key];
    if (!isEqual(val, oth)) {
      return false;
    }
  }
  return true;
}

// src/baseFunction/validations.ts
function isValidMac(address) {
  const reg = /^[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}$/;
  return reg.test(address);
}
function isValidIPv4(address) {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
    address
  );
}
function isNumberString(str) {
  return /^[0-9]+$/.test(str);
}
function isEmail(email) {
  return /^([a-zA-Z0-9_.\-+])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(
    email
  );
}
function isValidDate(dateString) {
  if (!dateString || dateString === "0001-01-01T00:00:00") {
    return false;
  }
  const regex = /^(\d{4})[-/](\d{2})[-/](\d{2})/;
  const match = dateString.match(regex);
  if (!match) {
    return false;
  }
  const [_, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);
  return !isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
function isEmptyGuid(id) {
  const emptyId = emptyGuid();
  return id === emptyId || !id.length;
}
function isEmptyArray(arr) {
  return Array.isArray(arr) && arr.length === 0;
}
function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}
function isEven(num) {
  return num % 2 === 0;
}

// src/baseFunction/date.ts
function formatDate(date, options = {}) {
  const {
    components = ["year", "month", "day"],
    useChineseFormat = false,
    separator = "/",
    roc = false
  } = options;
  const chineseConfig = typeof useChineseFormat === "boolean" ? {
    date: useChineseFormat,
    time: useChineseFormat,
    weekday: useChineseFormat
  } : { date: false, time: false, weekday: false, ...useChineseFormat };
  if (!date) return "";
  let d;
  if (typeof date === "string") {
    if (!isValidDate(date)) return "";
    d = new Date(date);
  } else {
    d = new Date(date);
    if (isNaN(d.getTime())) return "";
  }
  const fullYear = d.getFullYear();
  const year = roc ? fullYear - 1911 : fullYear;
  if (roc && year <= 0) return "";
  const result = [];
  const dayList = ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"];
  let timePart = "";
  let weekdayPart = "";
  for (const component of components) {
    switch (component) {
      case "year":
        if (chineseConfig.date) {
          result.push(`${roc ? year : year}\u5E74`);
        } else {
          result.push(roc ? String(year) : String(year).padStart(4, "0"));
        }
        break;
      case "month":
        if (chineseConfig.date) {
          result.push(`${d.getMonth() + 1}\u6708`);
        } else {
          result.push(String(d.getMonth() + 1).padStart(2, "0"));
        }
        break;
      case "day":
        if (chineseConfig.date) {
          result.push(`${d.getDate()}\u65E5`);
        } else {
          result.push(String(d.getDate()).padStart(2, "0"));
        }
        break;
      case "weekday":
        weekdayPart = chineseConfig.weekday ? `\u661F\u671F${dayList[d.getDay()]}` : `(${dayList[d.getDay()]})`;
        break;
      case "time":
        if (chineseConfig.time) {
          timePart = `${d.getHours()}\u6642${d.getMinutes()}\u5206`;
        } else {
          timePart = `${String(d.getHours()).padStart(2, "0")}:${String(
            d.getMinutes()
          ).padStart(2, "0")}`;
        }
        break;
      case "seconds":
        if (chineseConfig.time) {
          timePart += `${d.getSeconds()}\u79D2`;
        } else {
          timePart += `:${String(d.getSeconds()).padStart(2, "0")}`;
        }
        break;
    }
  }
  const datePart = chineseConfig.date ? result.join("") : result.join(separator);
  const finalParts = [];
  if (datePart) {
    finalParts.push(datePart);
  }
  if (timePart) {
    finalParts.push(timePart);
  }
  if (weekdayPart) {
    finalParts.push(weekdayPart);
  }
  return finalParts.join(" ");
}
function convertROCToGregorian(rocDate, separator = "/") {
  if (!rocDate) return "";
  const normalized = rocDate.replace(/[.-]/g, "/");
  const parts = normalized.split("/");
  if (parts.length !== 3) return "";
  const [y, m, d] = parts;
  const year = parseInt(y);
  if (isNaN(year) || year <= 0) return "";
  const gregorianYear = year + 1911;
  const dateString = `${gregorianYear}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  if (!isValidDate(dateString)) return "";
  return formatDate(dateString, {
    components: ["year", "month", "day"],
    separator
  });
}
function adjustDateTime(date, adjustments = {}, formatOptions = {}) {
  const {
    years = 0,
    months = 0,
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0
  } = adjustments;
  let newDate;
  if (typeof date === "string") {
    if (!isValidDate(date)) return "";
    newDate = new Date(date);
  } else {
    newDate = new Date(date);
    if (isNaN(newDate.getTime())) return "";
  }
  if (years !== 0) {
    newDate.setFullYear(newDate.getFullYear() + years);
  }
  if (months !== 0) {
    newDate.setMonth(newDate.getMonth() + months);
  }
  if (days !== 0) {
    newDate.setDate(newDate.getDate() + days);
  }
  if (hours !== 0) {
    newDate.setHours(newDate.getHours() + hours);
  }
  if (minutes !== 0) {
    newDate.setMinutes(newDate.getMinutes() + minutes);
  }
  if (seconds !== 0) {
    newDate.setSeconds(newDate.getSeconds() + seconds);
  }
  return formatDate(newDate, {
    components: ["year", "month", "day"],
    // Default components
    ...formatOptions
  });
}

// src/baseFunction/number.ts
function formatNumber(num, decimalPlaces = 2, decimalSep = ".", thousandSep = ",") {
  if (!Number.isFinite(num)) return "";
  const n = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  const rounded = n.toFixed(Math.max(decimalPlaces, 0));
  const [whole, decimals] = rounded.split(".");
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep);
  return sign + formattedWhole + (decimalPlaces > 0 ? decimalSep + decimals : "");
}
function padDecimals(num, count) {
  if (!Number.isFinite(num) || count < 0) return "";
  const factor = Math.pow(10, count);
  const rounded = Math.round(num * factor) / factor;
  const [intPart, decPart = ""] = rounded.toString().split(".");
  const paddedDecimals = decPart.padEnd(count, "0");
  return `${intPart}.${paddedDecimals}`;
}
function removeThousands(str, sep = ",") {
  return str.split(sep).join("");
}
function addCommas(num) {
  if (isNaN(Number(num))) return String(num);
  const [intPart, decPart = ""] = String(num).split(".");
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart ? `${formatted}.${decPart}` : formatted;
}
function getRandowmNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// src/baseFunction/string.ts
function padLeft(str, length, padChar) {
  const padLength = Math.max(0, length - str.length);
  const fullRepeats = Math.floor(padLength / padChar.length);
  const remainder = padLength % padChar.length;
  return padChar.repeat(fullRepeats) + padChar.slice(0, remainder) + str;
}
function capitalizeWords(str) {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}
function btoaEncode(str) {
  const utf8Bytes = new TextEncoder().encode(str);
  const binary = Array.from(utf8Bytes).map((byte) => String.fromCharCode(byte)).join("");
  return btoa(binary);
}
async function atobDecode(str) {
  try {
    return decodeURIComponent(
      [...atob(str)].map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    );
  } catch {
    return "";
  }
}

// src/browserUtils/navigation.ts
function redirect(path, options = {}) {
  if (typeof path !== "string" || path.trim() === "") {
    console.error("redirect: \u8ACB\u63D0\u4F9B\u6709\u6548\u7684\u8DEF\u5F91\u6216\u7DB2\u5740");
    return;
  }
  const { delay = 0, newTab = false, replace = false } = options;
  const doRedirect = () => {
    let targetUrl;
    if (path.startsWith("http://") || path.startsWith("https://")) {
      targetUrl = path;
    } else if (path.startsWith("/")) {
      targetUrl = getBaseUrl() + path;
    } else {
      const currentPath = getBaseUrl();
      targetUrl = `${currentPath}/${path}`;
    }
    if (newTab) {
      window.open(targetUrl, "_blank");
    } else if (replace) {
      window.location.replace(targetUrl);
    } else {
      window.location.href = targetUrl;
    }
  };
  if (delay > 0) {
    window.setTimeout(doRedirect, delay);
  } else {
    doRedirect();
  }
}
function getBaseUrl() {
  const { protocol, host, pathname } = window.location;
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return `${protocol}//${host}`;
  }
  const pathSegments = pathname.split("/").filter((segment) => segment.length > 0);
  if (pathSegments.length > 0) {
    const virtualDir = pathSegments[0];
    return `${protocol}//${host}/${virtualDir}`;
  }
  return `${protocol}//${host}`;
}
function getPath() {
  const { host, pathname } = window.location;
  const segments = pathname.replace(/^\//, "").split("/");
  const isDev = host.includes("localhost") || host.includes("127.0.0.1");
  const relevant = isDev ? segments : segments.slice(1);
  return "/" + relevant.join("/");
}
function getPageName() {
  const { host, pathname } = window.location;
  const segments = pathname.replace(/^\//, "").split("/");
  const isDev = host.includes("localhost") || host.includes("127.0.0.1");
  const relevant = isDev ? segments : segments.slice(1);
  return relevant[relevant.length - 1] || "";
}
function goBack() {
  window.history.back();
}
function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}
function removeUrlParam(url, name) {
  const [base, queryString] = url.split("?");
  if (!queryString) return url;
  const params = new URLSearchParams(queryString);
  params.delete(name);
  const newQuery = params.toString();
  return newQuery ? `${base}?${newQuery}` : base;
}

// src/browserUtils/ws.ts
var WebSocketState = /* @__PURE__ */ ((WebSocketState2) => {
  WebSocketState2["CONNECTING"] = "connecting";
  WebSocketState2["CONNECTED"] = "connected";
  WebSocketState2["DISCONNECTING"] = "disconnecting";
  WebSocketState2["DISCONNECTED"] = "disconnected";
  WebSocketState2["ERROR"] = "error";
  return WebSocketState2;
})(WebSocketState || {});
var WebSocketClient = class {
  options;
  socket = null;
  currentState = "disconnected" /* DISCONNECTED */;
  // 重連相關
  lockReconnect = false;
  reconnectAttempts = 0;
  currentReconnectDelay;
  // 心跳相關
  heartbeatTimer = null;
  heartbeatTimeoutTimer = null;
  // 事件處理器
  eventHandlers = {};
  constructor(options) {
    this.options = {
      enableHeartCheck: true,
      heartbeatInterval: 3e4,
      heartbeatTimeout: 3e4,
      maxReconnectAttempts: 3,
      initialReconnectDelay: 1e3,
      maxReconnectDelay: 3e4,
      mapNo: "",
      ...options
    };
    this.currentReconnectDelay = this.options.initialReconnectDelay;
    this.validateOptions();
  }
  /**
   * 驗證配置選項
   */
  validateOptions() {
    if (!this.options.webSocketURL) {
      throw new Error("webSocketURL \u662F\u5FC5\u8981\u7684\u53C3\u6578");
    }
    if (!this.options.keyNo) {
      throw new Error("keyNo \u662F\u5FC5\u8981\u7684\u53C3\u6578");
    }
    if (typeof this.options.callBack !== "function") {
      throw new Error("callBack \u5FC5\u9808\u662F\u4E00\u500B\u51FD\u6578");
    }
  }
  /**
   * 設定事件處理器
   */
  setEventHandlers(handlers) {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
    return this;
  }
  /**
   * 獲取當前連線狀態
   */
  getState() {
    return this.currentState;
  }
  /**
   * 檢查是否已連線
   */
  isConnected() {
    return this.currentState === "connected" /* CONNECTED */;
  }
  /**
   * 更新連線狀態
   */
  setState(state) {
    if (this.currentState !== state) {
      this.currentState = state;
      this.eventHandlers.onStateChange?.(state);
    }
  }
  /**
   * 建構 WebSocket URL
   */
  buildWebSocketURL() {
    const params = new URLSearchParams({
      keyno: this.options.keyNo,
      ip: this.options.clientIp,
      role: this.options.role,
      name: this.options.name,
      memno: this.options.memNo,
      notifyclientcountrole: this.options.notifyClientCountRole,
      notifyclientaddcloserole: this.options.notifyClientAddCloseRole
    });
    if (this.options.mapNo) {
      params.set("mapno", this.options.mapNo);
    }
    return `${this.options.webSocketURL}/api/WSClient?${params.toString()}`;
  }
  /**
   * 建立 WebSocket 連線
   */
  async connect() {
    if (this.currentState === "connecting" /* CONNECTING */ || this.currentState === "connected" /* CONNECTED */) {
      return;
    }
    try {
      this.setState("connecting" /* CONNECTING */);
      if (!("WebSocket" in window)) {
        throw new Error("\u700F\u89BD\u5668\u4E0D\u652F\u63F4 WebSocket");
      }
      const url = this.buildWebSocketURL();
      this.socket = new WebSocket(url);
      this.setupEventHandlers();
    } catch (error) {
      this.setState("error" /* ERROR */);
      console.error("WebSocket \u5EFA\u7ACB\u9023\u7DDA\u767C\u751F\u932F\u8AA4:", error);
      await this.handleReconnect();
    }
  }
  /**
   * 設置 WebSocket 事件處理
   */
  setupEventHandlers() {
    if (!this.socket) return;
    this.socket.addEventListener("open", () => {
      this.setState("connected" /* CONNECTED */);
      this.reconnectAttempts = 0;
      this.currentReconnectDelay = this.options.initialReconnectDelay;
      const loginMessage = {
        type: "Login",
        name: this.options.name,
        memNo: this.options.memNo,
        notifyClientCountRole: this.options.notifyClientCountRole,
        notifyClientAddCloseRole: this.options.notifyClientAddCloseRole
      };
      this.send(loginMessage);
      if (this.options.enableHeartCheck) {
        this.startHeartbeat();
      }
      console.log(
        `WebSocket \u9023\u7DDA\u6210\u529F${this.options.enableHeartCheck ? "\uFF0C\u958B\u59CB\u5FC3\u8DF3\u6AA2\u67E5" : ""}`
      );
      this.eventHandlers.onOpen?.();
    });
    this.socket.addEventListener("close", (event) => {
      this.setState("disconnected" /* DISCONNECTED */);
      this.stopHeartbeat();
      console.log("WebSocket \u9023\u7DDA\u95DC\u9589");
      this.eventHandlers.onClose?.(event);
      if (event.code !== 1e3) {
        this.handleReconnect();
      }
    });
    this.socket.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(event.data);
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
        console.error("\u89E3\u6790 WebSocket \u8A0A\u606F\u6642\u767C\u751F\u932F\u8AA4:", error);
      }
    });
    this.socket.addEventListener("error", (event) => {
      this.setState("error" /* ERROR */);
      console.error("WebSocket \u767C\u751F\u932F\u8AA4");
      this.eventHandlers.onError?.(event);
      console.warn("\u5617\u8A66\u91CD\u65B0\u9023\u7DDA...");
      this.handleReconnect();
    });
  }
  /**
   * 處理重連, 將重連次數 log
   */
  async handleReconnect() {
    if (this.lockReconnect || this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      return;
    }
    this.lockReconnect = true;
    this.reconnectAttempts++;
    setTimeout(async () => {
      console.log(`WebSocket \u91CD\u65B0\u9023\u7DDA (\u7B2C ${this.reconnectAttempts} \u6B21\u5617\u8A66)`);
      await this.connect();
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
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setTimeout(() => {
      this.sendHeartbeat();
    }, this.options.heartbeatInterval);
  }
  /**
   * 重置心跳計時器
   */
  resetHeartbeat() {
    if (this.options.enableHeartCheck && this.isConnected()) {
      this.startHeartbeat();
    }
  }
  /**
   * 發送心跳
   */
  sendHeartbeat() {
    if (this.isConnected()) {
      this.send({ type: "Message", TypeCode: "Ping" });
      this.heartbeatTimeoutTimer = setTimeout(() => {
        console.warn("\u5FC3\u8DF3\u8D85\u6642\uFF0C\u95DC\u9589\u9023\u7DDA");
        this.disconnect();
      }, this.options.heartbeatTimeout);
    }
  }
  /**
   * 清除心跳超時計時器
   */
  clearHeartbeatTimeout() {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
  }
  /**
   * 停止心跳檢查
   */
  stopHeartbeat() {
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
  send(message) {
    if (!this.isConnected() || !this.socket) {
      console.warn("WebSocket \u672A\u9023\u7DDA\uFF0C\u7121\u6CD5\u767C\u9001\u8A0A\u606F");
      return false;
    }
    try {
      const data = typeof message === "string" ? message : JSON.stringify(message);
      this.socket.send(data);
      return true;
    } catch (error) {
      console.error("\u767C\u9001 WebSocket \u8A0A\u606F\u6642\u767C\u751F\u932F\u8AA4:", error);
      return false;
    }
  }
  /**
   * 主動關閉連線
   */
  disconnect() {
    if (this.socket) {
      this.setState("disconnecting" /* DISCONNECTING */);
      this.stopHeartbeat();
      this.socket.close(1e3, "Client disconnect");
      this.socket = null;
    }
  }
  /**
   * 清理資源
   */
  destroy() {
    this.disconnect();
    this.lockReconnect = true;
    this.eventHandlers = {};
  }
};

// src/auth/auth.ts
var AppAuthorization = class {
  constructor(appAccount = "", appPassword = "") {
    this.appAccount = appAccount;
    this.appPassword = appPassword;
    if (!appAccount || !appPassword) {
      throw new Error("\u8ACB\u8A2D\u5B9A APP_ACCOUNT \u548C APP_PASSWORD \u74B0\u5883\u8B8A\u6578");
    }
  }
  tokenPromise = null;
  async getToken() {
    if (this.tokenPromise) {
      return this.tokenPromise;
    }
    this.tokenPromise = fetch(
      `${window.location.origin}/api/TM_ApiMgr_App_CheckSsword?account=${this.appAccount}&ssword=${this.appPassword}`
    ).then((res) => res.json()).finally(() => {
      this.tokenPromise = null;
    });
    const data = await this.tokenPromise;
    if (data?.errorMessage) {
      throw new Error(data?.errorMessage);
    }
    if (!data.token) {
      throw new Error("\u7121\u6548\u7684\u6191\u8B49!");
    }
    sessionStorage.setItem("apitoken", data?.token || "");
    sessionStorage.setItem("apitokentimeout", data?.tokenExpire || "");
    return data;
  }
  async prepareAuthHeader(headers, url) {
    const excludedEndpoints = [
      "api/TM_ApiMgr_App_CheckSsword",
      "api/TM_ApiMgr_App_GetOne",
      "api/TM_ApiMgr_App_Insert"
    ];
    if (excludedEndpoints.some((endpoint) => url.includes(endpoint))) {
      return false;
    }
    const apiToken = sessionStorage.getItem("apitoken");
    const apiTokenTimeout = sessionStorage.getItem("apitokentimeout");
    if (apiToken && apiToken !== emptyGuid() && apiTokenTimeout && /* @__PURE__ */ new Date() < new Date(apiTokenTimeout)) {
      headers["Authorization"] = "Basic " + btoa(`${this.appAccount}:${apiToken}`);
      return true;
    }
    const token = await this.getToken().catch(() => {
      sessionStorage.removeItem("apitoken");
      sessionStorage.removeItem("apitokentimeout");
    });
    if (token?.token && token?.tokenExpire) {
      headers["Authorization"] = "Basic " + btoa(`${this.appAccount}:${token.token}`);
      return true;
    }
    sessionStorage.removeItem("apitoken");
    sessionStorage.removeItem("apitokentimeout");
    return false;
  }
};

// src/browserUtils/ajax.ts
var ApiStateManager = class {
  cache;
  queries;
  defaultConfig;
  auth;
  constructor(appAccount, appPassword) {
    this.cache = /* @__PURE__ */ new Map();
    this.queries = /* @__PURE__ */ new Map();
    this.defaultConfig = {
      staleTime: 5 * 60 * 1e3,
      cacheTime: 10 * 60 * 1e3,
      retry: 0,
      retryDelay: (attemptIndex) => Math.min(1e3 * 2 ** attemptIndex, 3e4),
      enabled: true,
      treatErrorMessageAsError: true,
      cache: true
    };
    this.auth = new AppAuthorization(appAccount, appPassword);
  }
  generateQueryKey(endpoint, requestBody, method) {
    const bodyHash = requestBody ? simpleHash(JSON.stringify(requestBody)) : "";
    return `${method}:${endpoint}:${bodyHash}`;
  }
  getQuery(queryKey) {
    return this.queries.get(queryKey);
  }
  setCache(queryKey, data) {
    this.cache.set(queryKey, { data, timestamp: Date.now() });
  }
  isCacheValid(cacheEntry, staleTime) {
    if (!cacheEntry) return false;
    return Date.now() - cacheEntry.timestamp < staleTime;
  }
  cleanExpiredCache(maxSize = 100) {
    const now = Date.now();
    const cacheSize = this.cache.size;
    if (cacheSize > maxSize) {
      const sortedEntries = Array.from(this.cache.entries()).sort(
        (a, b) => a[1].timestamp - b[1].timestamp
      );
      const entriesToRemove = sortedEntries.slice(0, cacheSize - maxSize);
      entriesToRemove.forEach(([key]) => this.cache.delete(key));
    }
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.defaultConfig.cacheTime) {
        this.cache.delete(key);
      }
    }
  }
  async executeRequest(baseUrl, endpoint, requestBody, method, options = {}, fetchOptions = {}) {
    const buildUrlWithParams = (url, params) => {
      const usp = new URLSearchParams(params).toString();
      return usp ? `${url}?${usp}` : url;
    };
    let requestUrl = `${baseUrl}/${endpoint}`;
    if (method === "GET" && requestBody && typeof requestBody === "object") {
      requestUrl = buildUrlWithParams(requestUrl, requestBody);
    }
    const isFormData = requestBody instanceof FormData;
    const headers = {};
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }
    await this.auth.prepareAuthHeader(headers, requestUrl);
    const defaultFetchOptions = {
      method,
      headers,
      body: isFormData ? requestBody : method === "GET" ? void 0 : JSON.stringify(requestBody),
      cache: "no-store",
      credentials: "same-origin",
      mode: "cors"
    };
    const finalFetchOptions = {
      ...defaultFetchOptions,
      ...fetchOptions,
      headers: { ...defaultFetchOptions.headers, ...fetchOptions.headers }
    };
    const response = await fetch(requestUrl, finalFetchOptions);
    const data = await response.json();
    if (!response.ok) {
      const apiError = new Error(
        data?.errorMessage || "API \u8ACB\u6C42\u5931\u6557"
      );
      apiError.isApiError = true;
      apiError.response = data;
      apiError.status = response.status.toString();
      throw apiError;
    }
    if (data?.errorMessage && options.treatErrorMessageAsError) {
      const apiError = new Error(data.errorMessage);
      apiError.isApiError = true;
      apiError.response = data;
      apiError.status = "api_error";
      throw apiError;
    }
    return data;
  }
  getDefaultConfig() {
    return { ...this.defaultConfig };
  }
  setDefaultConfig(config) {
    Object.assign(this.defaultConfig, config);
  }
  // 清理機制
  cleanup() {
    this.queries.forEach((query) => {
      query.subscribers.clear();
    });
    this.queries.clear();
    this.cache.clear();
  }
};
var QueryState = class {
  queryKey;
  status;
  data;
  error;
  isLoading;
  isError;
  isSuccess;
  isFetching;
  failureCount;
  subscribers;
  lastUpdated;
  constructor(queryKey) {
    this.queryKey = queryKey;
    this.status = "idle";
    this.data = null;
    this.error = null;
    this.isLoading = false;
    this.isError = false;
    this.isSuccess = false;
    this.isFetching = false;
    this.failureCount = 0;
    this.subscribers = /* @__PURE__ */ new Set();
    this.lastUpdated = null;
  }
  updateStatus(status, data = null, error = null) {
    this.status = status;
    this.isLoading = status === "loading";
    this.isError = status === "error";
    this.isSuccess = status === "success";
    this.isFetching = status === "loading";
    if (data !== null) {
      this.data = data;
      this.lastUpdated = Date.now();
    }
    if (error !== null) {
      this.error = error;
    }
    this.notifySubscribers();
  }
  notifySubscribers() {
    this.subscribers.forEach((callback) => {
      try {
        callback(this.getState());
      } catch (err) {
        console.error("Error in query subscriber:", err);
      }
    });
  }
  getState() {
    return {
      status: this.status,
      data: this.data,
      error: this.error,
      isLoading: this.isLoading,
      isError: this.isError,
      isSuccess: this.isSuccess,
      isFetching: this.isFetching,
      failureCount: this.failureCount,
      lastUpdated: this.lastUpdated
    };
  }
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
};
function createApiStateManager(appAccount, appPassword) {
  return new ApiStateManager(appAccount, appPassword);
}
async function ajaxApi(apiStateManager, {
  baseUrl = "../api",
  endpoint,
  requestBody,
  method = "GET",
  config = {},
  fetchOptions = {}
}) {
  const finalConfig = { ...apiStateManager.getDefaultConfig(), ...config };
  let attempt = 0;
  const maxAttempts = finalConfig.retry + 1;
  while (attempt < maxAttempts) {
    try {
      if (!endpoint) throw new Error("\u7121\u63D0\u4F9B API \u7AEF\u9EDE");
      return await apiStateManager.executeRequest(
        baseUrl,
        endpoint,
        requestBody,
        method,
        {
          treatErrorMessageAsError: finalConfig.treatErrorMessageAsError
        },
        fetchOptions
      );
    } catch (error) {
      attempt++;
      if (error.status === "401") {
        sessionStorage.removeItem("apitoken");
        sessionStorage.removeItem("apitokentimeout");
      } else if (error.isApiError) {
        throw error;
      }
      if (attempt < maxAttempts && !error.isApiError) {
        const delay = finalConfig.retryDelay(attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Unexpected error: Max attempts reached");
}
function useAjaxApi(apiStateManager, {
  baseUrl = "../api",
  endpoint,
  requestBody,
  method = "GET",
  config = {},
  fetchOptions = {}
}) {
  const finalConfig = { ...apiStateManager.getDefaultConfig(), ...config };
  const queryKey = apiStateManager.generateQueryKey(
    endpoint,
    requestBody,
    method
  );
  let queryState = apiStateManager["queries"].get(queryKey);
  if (!queryState) {
    queryState = new QueryState(queryKey);
    apiStateManager["queries"].set(queryKey, queryState);
  }
  const shouldFetch = finalConfig.enabled && (queryState.status === "idle" || !apiStateManager.isCacheValid(
    apiStateManager["cache"].get(queryKey),
    finalConfig.staleTime
  ));
  if (shouldFetch && !queryState.isFetching) {
    executeQuery(apiStateManager, {
      queryState,
      baseUrl,
      endpoint,
      requestBody,
      method,
      config: finalConfig,
      fetchOptions
    }).catch((error) => {
      console.debug("Query execution completed with error:", error.message);
    });
  }
  return queryState;
}
async function executeQuery(apiStateManager, {
  queryState,
  baseUrl,
  endpoint,
  requestBody,
  method,
  config,
  fetchOptions = {}
}) {
  const queryKey = queryState.queryKey;
  queryState.updateStatus("loading");
  let attempt = 0;
  const maxAttempts = (config.retry ?? 0) + 1;
  while (attempt < maxAttempts) {
    try {
      if (!endpoint) throw new Error("\u7121\u63D0\u4F9B API \u7AEF\u9EDE");
      const data = await apiStateManager.executeRequest(
        baseUrl,
        endpoint,
        requestBody,
        method,
        {
          treatErrorMessageAsError: config.treatErrorMessageAsError
        },
        fetchOptions
      );
      if (config.cache !== false) {
        apiStateManager["cache"].set(queryKey, { data, timestamp: Date.now() });
      }
      queryState.updateStatus("success", data);
      queryState.failureCount = 0;
      return data;
    } catch (error) {
      attempt++;
      queryState.failureCount = attempt;
      if (error.status === "401") {
        sessionStorage.removeItem("apitoken");
        sessionStorage.removeItem("apitokentimeout");
      } else if (error.isApiError) {
        queryState.updateStatus("error", null, error);
        throw error;
      }
      if (attempt < maxAttempts && !error.isApiError) {
        const delay = config.retryDelay?.(attempt - 1) ?? 1e3;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      queryState.updateStatus("error", null, error);
      throw error;
    }
  }
  throw new Error("Unexpected error: Max attempts reached");
}
function refetchQuery(apiStateManager, {
  baseUrl = "../api",
  endpoint,
  requestBody = {},
  method = "GET",
  config = {},
  fetchOptions = {}
}) {
  const finalConfig = { ...apiStateManager.getDefaultConfig(), ...config };
  const queryKey = apiStateManager.generateQueryKey(
    endpoint,
    requestBody,
    method
  );
  const queryState = apiStateManager["queries"].get(queryKey);
  if (queryState) {
    return executeQuery(apiStateManager, {
      queryState,
      baseUrl,
      endpoint,
      requestBody,
      method,
      config: finalConfig,
      fetchOptions
    });
  }
  return Promise.reject(new Error("Query not found"));
}
async function invalidateQuery(apiStateManager, {
  baseUrl = "../api",
  endpoint,
  requestBody = {},
  method = "GET",
  config = {},
  fetchOptions = {}
}) {
  const finalConfig = { ...apiStateManager.getDefaultConfig(), ...config };
  const queryKey = apiStateManager.generateQueryKey(
    endpoint,
    requestBody,
    method
  );
  apiStateManager["cache"].delete(queryKey);
  const queryState = apiStateManager["queries"].get(queryKey);
  if (queryState && queryState.status === "success" && finalConfig.enabled) {
    return executeQuery(apiStateManager, {
      queryState,
      baseUrl,
      endpoint,
      requestBody,
      method,
      config: finalConfig,
      fetchOptions
    }).then(() => {
    });
  }
  return Promise.resolve();
}
function clearAllCache(apiStateManager) {
  apiStateManager["cache"].clear();
}
function setDefaultConfig(apiStateManager, config) {
  apiStateManager.setDefaultConfig(config);
}
function cleanCacheInterval(apiStateManager) {
  setInterval(() => {
    apiStateManager.cleanExpiredCache();
  }, 6e4);
}

// src/browserUtils/infoLogger.ts
var InfoLogger = class _InfoLogger {
  apiStateManager;
  // 儲存 ApiStateManager 實例
  /**
   * 構造函數，接受 ApiStateManager 實例
   * @param apiStateManager - 已初始化的 ApiStateManager 實例
   */
  constructor(apiStateManager) {
    this.apiStateManager = apiStateManager;
  }
  /**
   * 取得使用者平台名稱（手機、電腦、iOS 等）
   * @returns {string} 平台名稱
   */
  static getPlatform() {
    const ua = navigator.userAgent;
    const navAny = navigator;
    if (navAny.userAgentData?.platform) return navAny.userAgentData.platform;
    if (/iPhone/i.test(ua)) return "iPhone";
    if (/iPad/i.test(ua)) return "iPad";
    if (/Android/i.test(ua)) return "Android";
    if (/Windows/i.test(ua)) return "Windows";
    if (/Macintosh/i.test(ua)) return "Mac";
    return "PC";
  }
  /**
   * 記錄一筆 Info Log 到伺服器
   * @param options - Log 參數
   * @returns {Promise<void>}
   */
  async log({
    bMemNo,
    type,
    message,
    message2 = "",
    message3 = "",
    url = window.location.href
  }) {
    try {
      await ajaxApi(this.apiStateManager, {
        method: "GET",
        endpoint: "My_Log_Info",
        requestBody: {
          bmemno: bMemNo,
          type,
          message,
          message2,
          message3,
          url,
          platform: _InfoLogger.getPlatform()
        }
      });
    } catch (err) {
      const { message: message4 } = handleApiError(err);
      console.error("\u7D00\u9304 Info log \u932F\u8AA4: ", message4);
    }
  }
};
export {
  ApiStateManager,
  AppAuthorization,
  InfoLogger,
  QueryState,
  WebSocketClient,
  WebSocketState,
  addCommas,
  adjustDateTime,
  ajaxApi,
  atobDecode,
  btoaEncode,
  camelToSnake,
  capitalizeWords,
  cleanCacheInterval,
  clearAllCache,
  convertArrayToObject,
  convertROCToGregorian,
  createApiStateManager,
  debounce,
  debounceAsync,
  deepClone,
  emptyGuid,
  flattenArray,
  formatDate,
  formatNumber,
  getBaseUrl,
  getPageName,
  getPath,
  getQueryParam,
  getRandomColor,
  getRandowmNumber,
  goBack,
  handleApiError,
  invalidateQuery,
  isEmail,
  isEmptyArray,
  isEmptyGuid,
  isEmptyObject,
  isEqual,
  isEven,
  isNumberString,
  isValidDate,
  isValidIPv4,
  isValidMac,
  newGuid,
  objToQueryString,
  padDecimals,
  padLeft,
  redirect,
  refetchQuery,
  removeDuplicate,
  removeThousands,
  removeUrlParam,
  setDefaultConfig,
  simpleHash,
  sleep,
  snakeToCamel,
  sortByKey,
  throttle,
  throttleAnimationFrame,
  useAjaxApi
};
