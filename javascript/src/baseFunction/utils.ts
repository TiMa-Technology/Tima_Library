import type { ApiError } from "types/api";

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
    const err = error as Partial<ApiError> & { status?: string | number };

    if (err.isApiError) {
      return {
        type: "business",
        message: `操作失敗: ${err.message ?? ""}`,
        showToUser: true,
        shouldRetry: false,
      };
    }

    const status = parseInt(String(err.status));
    if (status === 401) {
      return {
        type: "auth",
        message: "登入已過期，請重新登入",
        showToUser: true,
        shouldRetry: false,
        action: "redirect_login",
      };
    }

    if (!isNaN(status) && status >= 500) {
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

/**
 * 深層複製物件或陣列（需瀏覽器支援 `structuredClone`）
 * @param obj 要複製的物件
 * @returns 深拷貝的結果
 * @example
 * const original = { a: 1, b: { c: 2 } };
 * const copy = deepClone(original);
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 移除陣列中重複的元素
 * @param arr 原始陣列
 * @returns 不重複的新陣列
 * @example
 * removeDuplicate([1, 2, 2, 3]) // [1, 2, 3]
 */
export function removeDuplicate<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * 將 camelCase 字串轉換為 snake_case
 * @param str camelCase 字串
 * @returns snake_case 字串
 * @example
 * camelToSnake("myVariableName") // "my_variable_name"
 */
export function camelToSnake(str: string): string {
  return str.replace(/([A-Z])/g, "_$1").toLowerCase();
}

/**
 * 生成隨機的十六進位顏色碼
 * @returns 顏色字串（如 "#a3e12f"）
 * @example
 * getRandomColor() // "#f3d2b6"
 */
export function getRandomColor(): string {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;
}

/**
 * 扁平化多層巢狀陣列
 * @param arr 多層陣列
 * @returns 單層陣列
 * @example
 * flattenArray([1, [2, [3]]]) // [1, 2, 3]
 */
export function flattenArray<T>(arr: any[]): T[] {
  return arr.flat(Infinity) as T[];
}

/**
 * 根據物件的指定鍵排序陣列（預設升序）
 * @param array 要排序的陣列
 * @param key 依據排序的鍵
 * @returns 排序後的新陣列
 * @example
 * soryByKey([{ id: 2 }, { id: 1 }], 'id') // [{ id: 1 }, { id: 2 }]
 */
export function sortByKey<T extends Record<string, any>>(
  array: T[],
  key: string
): T[] {
  return [...array].sort((a, b) => (a[key] > b[key] ? 1 : -1));
}

/**
 * 將陣列轉換為物件，以指定鍵為 key
 * @param arr 陣列資料
 * @param key 作為物件 key 的屬性名稱
 * @returns 轉換後的物件
 * @example
 * convertArrayToObject([{ id: 'a' }, { id: 'b' }], 'id') // { a: { id: 'a' }, b: { id: 'b' } }
 */
export function convertArrayToObject<T extends Record<string, any>>(
  arr: T[],
  key: string
): Record<string, T> {
  return arr.reduce(
    (obj, item) => {
      obj[item[key]] = item;
      return obj;
    },
    {} as Record<string, T>
  );
}

/**
 * 將物件轉換為 URL 查詢字串
 * @param obj 物件資料
 * @returns 查詢字串（如 "a=1&b=2"）
 * @example
 * objToQueryString({ a: 1, b: "test" }) // "a=1&b=test"
 */
export function objToQueryString<T extends Record<string, any>>(
  obj: T
): string {
  return Object.keys(obj)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join("&");
}
