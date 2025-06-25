import { clearTimeout } from "node:timers";
import type { ApiError } from "types/api";
import type {
  DebounceFunction,
  ThrottleFunction,
  ThrottleOptions,
} from "types/utils";

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
 * 將 snake_case 字串轉換為 camelCase
 * @param str snake_case 字串
 * @returns camelCase 字串
 * @example
 * snakeToCamel("my_variable_name") // "myVariableName"
 */
export function snakeToCamel(str: string): string {
  return str
    .replace(/^_+|_+$/g, "") // 移除開頭和結尾的底線
    .replace(/_+(.)/g, (_, char) => char.toUpperCase()); // 轉換中間的底線為駝峰
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

/**
 * 防抖 - 延遲執行函數，直到指定時間內沒有新的調用
 * @param func 要被 debounce 的函數
 * @param delay 延遲時間（毫秒）
 * @param immediate 是否立即執行第一次調用
 * @returns 返回 debounced 函數
 * @example
 * // 基本用法
 * const debouncedLog = debounce((msg: string) => console.log(msg), 300);
 * debouncedLog("Hello");
 * debouncedLog("World");
 * // 只會在 300ms 後輸出 "World"
 *
 * // 立即執行第一次調用
 * const debouncedImmediate = debounce((msg: string) => console.log(msg), 300, true);
 * debouncedImmediate("First");
 * debouncedImmediate("Second");
 * // 立即輸出 "First"，之後 300ms 內不會再執行
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  immediate: boolean = false
): DebounceFunction<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debouncedFunction = (...args: Parameters<T>): void => {
    lastArgs = args;
    const callNow = immediate && !timeoutId;

    // 每一次 debounce function 被觸發時，會先清除之前的 timer，避免觸發先前的 fn 函式
    // 因此只要在 delay 時間內觸發 debounce function，就會一直清除先前的 timer，避免 fn 一直被執行
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // 清除之後，再重新計時
    // 當 delay 時間到時，執行 fn
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

  // 取消 debounce
  debouncedFunction.cancel = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };

  // 立即執行
  debouncedFunction.flush = (...args: Parameters<T>): ReturnType<T> => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    const argsToUse = args.length > 0 ? args : lastArgs;
    if (argsToUse) {
      return func(...argsToUse);
    }
    return func() as ReturnType<T>;
  };

  // 檢查是否待執行
  debouncedFunction.pending = (): boolean => {
    return timeoutId !== null;
  };

  return debouncedFunction;
}

/**
 * Promise 版本的 debounce
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout;
  let promiseResolve: ((value: any) => void) | null = null;
  let promiseReject: ((reason?: any) => void) | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      // 取消之前的 timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // 如果有待處理的 promise，先 reject 它
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

/**
 * 節流器 - 限制函數在指定時間內只能執行一次
 * @param func 要被 throttle 的函數
 * @param delay 節流時間間隔（毫秒）
 * @param options 選項配置
 * @returns 返回 throttled 函數
 * @example
 * // 基本用法
 * const throttledLog = throttle((msg: string) => console.log(msg), 1000);
 * throttledLog("Hello");
 * throttledLog("World");
 * // 只會在 1 秒內輸出一次，後續調用會被忽略或延遲
 *
 * // 使用 leading 和 trailing 選項
 * const throttled = throttle(
 *   () => console.log("triggered"),
 *   2000,
 *   { leading: false, trailing: true }
 * );
 * throttled();
 * throttled();
 * // 只會在 2 秒後執行一次
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 500,
  options: ThrottleOptions = {}
): ThrottleFunction<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime: number = 0;
  let lastArgs: Parameters<T> | null = null;
  let lastResult: ReturnType<T>;

  const { leading = true, trailing = true } = options;

  const throttledFunction = (
    ...args: Parameters<T>
  ): ReturnType<T> | undefined => {
    const now = Date.now();
    const timeSinceLastExec = now - lastExecTime;

    lastArgs = args;

    // 如果是第一次調用且 leading 為 false，則設置 lastExecTime
    if (!lastExecTime && !leading) {
      lastExecTime = now;
    }

    // 如果距離上次執行已經超過延遲時間
    if (timeSinceLastExec >= delay) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (leading) {
        lastExecTime = now;
        lastResult = func(...args);
        return lastResult;
      } else {
        // 不執行，等待 trailing 呼叫
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
          // 避免重複執行
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

  // 取消 throttle
  throttledFunction.cancel = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastExecTime = 0;
    lastArgs = null;
  };

  // 立即執行
  throttledFunction.flush = (): ReturnType<T> | undefined => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (lastArgs) {
      lastExecTime = Date.now();
      lastResult = func(...lastArgs);
      return lastResult;
    }

    return lastResult;
  };

  // 檢查是否有待執行的調用
  throttledFunction.pending = (): boolean => {
    return timeoutId !== null;
  };

  return throttledFunction;
}

/**
 * 基於 requestAnimationFrame 的 throttle
 */
export function throttleAnimationFrame<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>): void => {
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
