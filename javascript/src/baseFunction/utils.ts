import type { ApiError } from "types/api";

/**
 * 將數字格式化為帶千位分隔符和小數位的字符串
 * @param {number} num - 要格式化的數字
 * @param {number} [decimalPlaces=2] - 小數位數，預設為 2
 * @param {string} [decimalSep="."] - 小數點分隔符，預設為"."
 * @param {string} [thousandSep=","] - 千位分隔符，預設為","
 * @returns {string} 格式化後的數字字符串
 * @example formatNumber(1234567.89) => "1,234,567.89"
 */
export function formatNumber(
  num: number,
  decimalPlaces: number = 2,
  decimalSep: string = ".",
  thousandSep: string = ","
): string {
  const n = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  const wholePart = parseInt(n.toFixed(decimalPlaces));
  const wholeStr = String(wholePart);
  const j = wholeStr.length > 3 ? wholeStr.length % 3 : 0;

  const formattedWhole =
    (j ? wholeStr.substring(0, j) + thousandSep : "") +
    wholeStr.substring(j).replace(/(\d{3})(?=\d)/g, "$1" + thousandSep);

  const decimals = n.toFixed(decimalPlaces).slice(-decimalPlaces);
  return sign + formattedWhole + (decimalPlaces ? decimalSep + decimals : "");
}

/**
 * 將數字格式化為指定的小數位數，並在小數位數不足時補零
 * @param {number} num - 要格式化的數字
 * @param {number} count - 小數位數
 * @returns {string} 格式化後的數字字符串，帶有補零的小數位
 * @example padDecimals(123.4, 3) => "123.400"
 * @example padDecimals(123, 2) => "123.00"
 */
export function padDecimals(num: number, count: number): string {
  const rounded =
    Math.round(parseFloat(num.toString()) * Math.pow(10, count)) /
    Math.pow(10, count);
  const parts = rounded.toString().split(".");
  if (parts.length === 1) {
    return `${parts[0]}.${padLeft("", count, "0")}`;
  }
  if (parts[1].length < count) {
    return `${parts[0]}.${parts[1]}${padLeft("", count - parts[1].length, "0")}`;
  }
  return rounded.toString();
}

/**
 * 移除字符串中的千位分隔符
 * @param {string} str - 包含千位分隔符的字符串
 * @returns {string} 移除千位分隔符後的字符串
 * @example removeThousands("1,234,567") => "1234567"
 */
export function removeThousands(str: string): string {
  return str.replaceAll(",", "");
}

/**
 * 在字符串左側填充指定字符
 * @param {string} str - 要填充的字符串
 * @param {number} length - 期望的長度
 * @param {string} padChar - 用於填充的字符
 * @returns {string} 填充後的字符串
 * @example padLeft("123", 5, "0") => "00123"
 */
export function padLeft(str: string, length: number, padChar: string): string {
  if (str.length >= length) return str;
  return padLeft(padChar + str, length, padChar);
}

/**
 * 將數字字符串添加逗號分隔符
 * @param {string|number} num - 要格式化的數字
 * @returns {string} 格式化後帶逗號的數字字符串
 * @example addCommas(1234567.89) => "1,234,567.89"
 */
export function addCommas(num: string | number): string {
  const parts = String(num).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

/**
 * 將字符串的首字母大寫
 * @param {string} str - 要處理的字符串
 * @returns {string} 首字母大寫的字符串
 * @example capitalize("hello world") => "Hello world"
 * @example capitalize("javascript") => "Javascript"
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 生成新的 GUID
 * @returns {string} 新的 GUID
 * @example newGuid() => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
 */
export function newGuid(): string {
  return crypto.randomUUID();
}

/**
 * 獲取空的 GUID
 * @returns {string} 空的 GUID
 * @example emptyGuid() => "00000000-0000-0000-0000-000000000000"
 */
export function emptyGuid(): string {
  return "00000000-0000-0000-0000-000000000000";
}

/**
 * 此函數接受一個字符串，將其`編碼`為 base64 編碼字符串。
 *
 * 這是對 window.btoa 的替代方案，因為 window.btoa 不能正確地`編碼` UTF-8 字符串。
 * @param {string} str - 要加密的字符串
 * @param {string} [prefix="0x"] - 用於轉換十六進制字符的前綴，預設為 "0x"
 * @returns {Promise<string>} 一個解析為 base64 編碼字符串的 Promise
 * @example btoaEncode("Hello world!") => "SGVsbG8gd29ybGQh"
 * @example btoaEncode(JSON.stringify({ key: "value" })) => "eyJrZXkiOiJ2YWx1ZSJ9"
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa
 */
export function btoaEncode(str: string, prefix: string = "0x"): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode(parseInt(prefix + p1));
    })
  );
}

/**
 * 解密 base64 `編碼`的字符串。
 *
 * 此函數接受一個 base64 編碼的字符串，解碼它，然後將每個字符轉換為其百分比編碼表示。
 * 最後，它解碼百分比編碼的字符串以返回原始字符串。
 *
 * @param {string} str - 要解密的 base64 編碼字符串。
 * @returns {Promise<string>} 一個解析為解密字符串的 Promise。
 * @example atobDecode("SGVsbG8gd29ybGQh") => "Hello world!"
 * @example atobDecode("eyJrZXkiOiJ2YWx1ZSJ9") => '{"key":"value"}'
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/at
 */
export async function atobDecode(str: string): Promise<string> {
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(str), function (c) {
        return "%" + c.charCodeAt(0).toString(16).padStart(2, "0");
      })
      .join("")
  );
}

/**
 * 等待指定的毫秒數後回傳 Promise。適合用來進行延遲操作。
 *
 * @param {number} ms - 休眠毫秒數
 * @returns {Promise<void>}
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 簡單的雜湊，適合做為緩存的鍵值
 * @param {string} str 要被雜湊的字串
 * @returns {string}
 */
export const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

/**
 * 錯誤處理，將 API 錯誤轉換為統一格式
 * @param error - 錯誤物件
 * @returns {object} 格式化的錯誤物件
 */
export const handleApiError = (
  error: unknown
): {
  type: "business" | "auth" | "server" | "network";
  message: string;
  showToUser: boolean;
  shouldRetry: boolean;
  action?: string;
} => {
  if (typeof error === "object" && error !== null) {
    const err = error as Partial<ApiError> & { status?: string };
    if (err.isApiError) {
      return {
        type: "business",
        message: `操作失敗: ${err.message ?? ""}`,
        showToUser: true,
        shouldRetry: false,
      };
    } else if (err.status === "401") {
      return {
        type: "auth",
        message: "登入已過期，請重新登入",
        showToUser: true,
        shouldRetry: false,
        action: "redirect_login",
      };
    } else if (err.status && parseInt(err.status) >= 500) {
      return {
        type: "server",
        message: "伺服器暫時無法回應",
        showToUser: true,
        shouldRetry: true,
      };
    }
  }
  return {
    type: "network",
    message: `系統錯誤: ${(error as Error)?.message || "未知錯誤"}`,
    showToUser: true,
    shouldRetry: true,
  };
};
