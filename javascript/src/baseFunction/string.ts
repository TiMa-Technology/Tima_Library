/**
 * 左側補齊指定長度的字串（非遞迴）
 *
 * @param str 原始字串
 * @param length 補齊後的總長度
 * @param padChar 用於補齊的字元
 * @returns 補齊後的新字串
 * @example
 * padLeft('7', 3, '0'); // 回傳 '007'
 */
export function padLeft(str: string, length: number, padChar: string): string {
  return padChar.repeat(Math.max(0, length - str.length)) + str;
}

/**
 * 將字串的各首字母轉成大寫
 *
 * @param str 原始字串
 * @returns 首字母轉為大寫後的新字串
 * @example
 * ```typescript
 * capitalizeWords('hello'); // 回傳 'Hello'
 * capitalizeWords('world'); // 回傳 'World'
 * capitalizeWords('hello world'); // 'Hello World'
 * ```
 */
export function capitalizeWords(str: string): string {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Base64 編碼（支援 UTF-8 字元）
 *
 * @param str 欲編碼的字串
 * @returns 編碼後的 Base64 字串
 * @example
 * ```typescript
 * btoaEncode('中文'); // 回傳 '5Lit5paH'
 * btoaEncode('hello'); // 回傳 'aGVsbG8='
 * ```
 */
export function btoaEncode(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  const binary = Array.from(utf8Bytes)
    .map((byte) => String.fromCharCode(byte))
    .join("");
  return btoa(binary);
}

/**
 * Base64 解碼（支援 UTF-8 字元，含錯誤處理）
 *
 * @param str 欲解碼的 Base64 字串
 * @returns 解碼後的原始字串，若解碼失敗則回傳空字串
 * @example
 * ```typescript
 * await atobDecode('5Lit5paH'); // 回傳 '中文'
 * await atobDecode('aGVsbG8='); // 回傳 'hello'
 * await atobDecode('錯誤字串'); // 回傳 ''
 * ```
 */
export async function atobDecode(str: string): Promise<string> {
  try {
    return decodeURIComponent(
      [...atob(str)]
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
  } catch {
    return "";
  }
}
