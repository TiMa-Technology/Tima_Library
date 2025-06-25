import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ApiError } from "types/api";
import {
  newGuid,
  emptyGuid,
  sleep,
  simpleHash,
  handleApiError,
  deepClone,
  removeDuplicate,
  camelToSnake,
  getRandomColor,
  flattenArray,
  sortByKey,
  convertArrayToObject,
  objToQueryString,
  snakeToCamel,
  debounce,
  debounceAsync,
  throttle,
  throttleAnimationFrame,
} from "../utils";

describe("newGuid", () => {
  it("應該生成有效的 GUID 格式", () => {
    const guid = newGuid();
    const guidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(guid).toMatch(guidRegex);
  });

  it("每次呼叫應該生成不同的 GUID", () => {
    const guid1 = newGuid();
    const guid2 = newGuid();
    expect(guid1).not.toBe(guid2);
  });
});

describe("emptyGuid", () => {
  it("應該返回空的 GUID", () => {
    expect(emptyGuid()).toBe("00000000-0000-0000-0000-000000000000");
  });

  it("每次呼叫都應該返回相同的空 GUID", () => {
    expect(emptyGuid()).toBe(emptyGuid());
  });
});

describe("sleep", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("應該等待指定的毫秒數", async () => {
    const promise = sleep(1000);

    // 快進時間
    vi.advanceTimersByTime(1000);

    await expect(promise).resolves.toBeUndefined();
  });

  it("應該返回 Promise", () => {
    const result = sleep(100);
    expect(result).toBeInstanceOf(Promise);
  });
});

describe("simpleHash", () => {
  it("應該為相同字串生成相同的雜湊值", () => {
    const str = "test string";
    expect(simpleHash(str)).toBe(simpleHash(str));
  });

  it("應該為不同字串生成不同的雜湊值", () => {
    expect(simpleHash("string1")).not.toBe(simpleHash("string2"));
  });

  it("應該處理空字串", () => {
    expect(simpleHash("")).toBe("0");
  });

  it("應該返回字串類型", () => {
    expect(typeof simpleHash("test")).toBe("string");
  });
});

describe("handleApiError", () => {
  it("應該處理 API 錯誤", () => {
    const apiError: Partial<ApiError> = {
      isApiError: true,
      message: "業務邏輯錯誤",
    };

    const result = handleApiError(apiError);

    expect(result).toEqual({
      type: "business",
      message: "操作失敗: 業務邏輯錯誤",
      showToUser: true,
      shouldRetry: false,
    });
  });

  it("應該處理 401 認證錯誤", () => {
    const authError = { status: 401 };

    const result = handleApiError(authError);

    expect(result).toEqual({
      type: "auth",
      message: "登入已過期，請重新登入",
      showToUser: true,
      shouldRetry: false,
      action: "redirect_login",
    });
  });

  it("應該處理 500 系列伺服器錯誤", () => {
    const serverError = { status: 500 };

    const result = handleApiError(serverError);

    expect(result).toEqual({
      type: "server",
      message: "伺服器暫時無法回應",
      showToUser: true,
      shouldRetry: true,
    });
  });

  it("應該處理網路錯誤", () => {
    const networkError = new Error("Network connection failed");

    const result = handleApiError(networkError);

    expect(result).toEqual({
      type: "network",
      message: "系統錯誤: Network connection failed",
      showToUser: true,
      shouldRetry: true,
    });
  });

  it("應該處理未知錯誤", () => {
    const result = handleApiError(null);

    expect(result).toEqual({
      type: "network",
      message: "系統錯誤: 未知錯誤",
      showToUser: true,
      shouldRetry: true,
    });
  });

  it("應該處理字串狀態碼", () => {
    const error = { status: "401" };

    const result = handleApiError(error);

    expect(result.type).toBe("auth");
  });
});

describe("deepClone", () => {
  it("應深拷貝物件", () => {
    const original = { a: 1, b: { c: 2 } };
    const cloned = deepClone(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.b).not.toBe(original.b);
  });

  it("應深拷貝陣列", () => {
    const original = [1, [2, 3], { a: 4 }];
    const cloned = deepClone(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned[1]).not.toBe(original[1]);
    expect(cloned[2]).not.toBe(original[2]);
  });

  it("應處理原生類型", () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone("string")).toBe("string");
    expect(deepClone(true)).toBe(true);
    expect(deepClone(null)).toBe(null);
  });
});

describe("removeDuplicate", () => {
  it("應該移除重複的數字", () => {
    expect(removeDuplicate([1, 2, 2, 3])).toEqual([1, 2, 3]);
  });

  it("應該移除重複的字串", () => {
    expect(removeDuplicate(["a", "b", "b", "c"])).toEqual(["a", "b", "c"]);
  });

  it("應該處理空陣列", () => {
    expect(removeDuplicate([])).toEqual([]);
  });

  it("應該處理沒有重複元素的陣列", () => {
    expect(removeDuplicate([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("應該保持原始陣列順序", () => {
    expect(removeDuplicate([3, 1, 2, 1, 3])).toEqual([3, 1, 2]);
  });
});

describe("camelToSnake", () => {
  it("應轉換駝峰命名為蛇形命名", () => {
    expect(camelToSnake("myVariableName")).toBe("my_variable_name");
    expect(camelToSnake("firstName")).toBe("first_name");
    expect(camelToSnake("getUserInfo")).toBe("get_user_info");
  });

  it("應處理單一單詞", () => {
    expect(camelToSnake("name")).toBe("name");
    expect(camelToSnake("user")).toBe("user");
  });

  it("應處理空字串", () => {
    expect(camelToSnake("")).toBe("");
  });

  it("應處理已經是小寫的字串", () => {
    expect(camelToSnake("lowercase")).toBe("lowercase");
  });
});

describe("snakeToCamel", () => {
  it("應該轉換蛇形命名為駝峰命名", () => {
    expect(snakeToCamel("my_variable_name")).toBe("myVariableName");
    expect(snakeToCamel("first_name")).toBe("firstName");
    expect(snakeToCamel("get_user_info")).toBe("getUserInfo");
  });

  it("應該處理單一單詞", () => {
    expect(snakeToCamel("name")).toBe("name");
    expect(snakeToCamel("user")).toBe("user");
  });

  it("應該處理空字串", () => {
    expect(snakeToCamel("")).toBe("");
  });

  it("應該處理已經是駝峰命名的字串", () => {
    expect(snakeToCamel("camelCase")).toBe("camelCase");
  });

  it("應該處理多個連續底線", () => {
    expect(snakeToCamel("my__variable___name")).toBe("myVariableName");
  });

  it("應該處理開頭和結尾的底線", () => {
    expect(snakeToCamel("_my_variable_")).toBe("myVariable");
    expect(snakeToCamel("__test__")).toBe("test");
    expect(snakeToCamel("_start")).toBe("start");
    expect(snakeToCamel("end_")).toBe("end");
  });

  it("應該與 camelToSnake 互為逆操作", () => {
    const originalCamel = "myVariableName";
    const snake = camelToSnake(originalCamel);
    const backToCamel = snakeToCamel(snake);
    expect(backToCamel).toBe(originalCamel);
  });
});

describe("getRandomColor", () => {
  it("應該生成有效的十六進位顏色碼", () => {
    const color = getRandomColor();
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("每次呼叫應該生成不同的顏色", () => {
    const colors = Array.from({ length: 10 }, () => getRandomColor());
    const uniqueColors = new Set(colors);
    // 雖然理論上可能生成相同顏色，但機率很低
    expect(uniqueColors.size).toBeGreaterThan(1);
  });

  it("應該始終返回 7 個字符的字串（包含 #）", () => {
    const color = getRandomColor();
    expect(color.length).toBe(7);
  });
});

describe("flattenArray", () => {
  it("應該扁平化巢狀陣列", () => {
    expect(flattenArray([1, [2, [3]]])).toEqual([1, 2, 3]);
    expect(flattenArray([1, [2, 3], [4, [5, 6]]])).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("應該處理已經是平坦的陣列", () => {
    expect(flattenArray([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("應正確處理空陣列", () => {
    expect(flattenArray([])).toEqual([]);
  });

  it("應該處理深度巢狀", () => {
    expect(flattenArray([1, [2, [3, [4, [5]]]]])).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("sortByKey", () => {
  it("應該根據數字鍵排序", () => {
    const array = [{ id: 3 }, { id: 1 }, { id: 2 }];
    const sorted = sortByKey(array, "id");
    expect(sorted).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });

  it("應該根據字串鍵排序", () => {
    const array = [{ name: "Charlie" }, { name: "Alice" }, { name: "Bob" }];
    const sorted = sortByKey(array, "name");
    expect(sorted).toEqual([
      { name: "Alice" },
      { name: "Bob" },
      { name: "Charlie" },
    ]);
  });

  it("應不影響原始陣列", () => {
    const array = [{ id: 3 }, { id: 1 }];
    const sorted = sortByKey(array, "id");
    expect(array).toEqual([{ id: 3 }, { id: 1 }]);
    expect(sorted).not.toBe(array);
  });

  it("應處理空陣列", () => {
    expect(sortByKey([], "id")).toEqual([]);
  });
});

describe("convertArrayToObject", () => {
  it("應該將陣列轉換為物件", () => {
    const array = [
      { id: "a", value: 1 },
      { id: "b", value: 2 },
    ];
    const result = convertArrayToObject(array, "id");

    expect(result).toEqual({
      a: { id: "a", value: 1 },
      b: { id: "b", value: 2 },
    });
  });

  it("應該處理數字鍵", () => {
    const array = [
      { id: 1, name: "first" },
      { id: 2, name: "second" },
    ];
    const result = convertArrayToObject(array, "id");

    expect(result).toEqual({
      1: { id: 1, name: "first" },
      2: { id: 2, name: "second" },
    });
  });

  it("應該處理空陣列", () => {
    expect(convertArrayToObject([], "id")).toEqual({});
  });

  it("重複的鍵應該被覆蓋", () => {
    const array = [
      { id: "a", value: 1 },
      { id: "a", value: 2 },
    ];
    const result = convertArrayToObject(array, "id");

    expect(result).toEqual({
      a: { id: "a", value: 2 },
    });
  });
});

describe("objToQueryString", () => {
  it("應該將物件轉換為查詢字串", () => {
    const obj = { a: 1, b: "test" };
    expect(objToQueryString(obj)).toBe("a=1&b=test");
  });

  it("應該處理特殊字符", () => {
    const obj = { "key with space": "value&with=special" };
    const result = objToQueryString(obj);
    expect(result).toBe("key%20with%20space=value%26with%3Dspecial");
  });

  it("應該處理數字和布林值", () => {
    const obj = { num: 42, bool: true, str: "hello" };
    expect(objToQueryString(obj)).toBe("num=42&bool=true&str=hello");
  });

  it("應該處理空物件", () => {
    expect(objToQueryString({})).toBe("");
  });

  it("應該處理包含中文的值", () => {
    const obj = { name: "測試", city: "台北" };
    const result = objToQueryString(obj);
    expect(result).toContain("name=%E6%B8%AC%E8%A9%A6");
    expect(result).toContain("city=%E5%8F%B0%E5%8C%97");
  });
});

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("應該延遲執行函數", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn("test");
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledWith("test");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("應該只執行最後一次調用", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn("first");
    debouncedFn("second");
    debouncedFn("third");

    vi.advanceTimersByTime(100);
    expect(mockFn).not.toHaveBeenCalledWith("first");
    expect(mockFn).not.toHaveBeenCalledWith("second");
    expect(mockFn).toHaveBeenCalledWith("third");
    expect(mockFn).toHaveBeenCalledTimes(3); // 會被呼叫三次但其他時間內的都會被直接清除
  });

  it("應該支援立即執行模式", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100, true);

    debouncedFn("immediate");
    expect(mockFn).toHaveBeenCalledWith("immediate");
    expect(mockFn).toHaveBeenCalledTimes(1);

    // 在冷卻期間的調用應該被忽略
    debouncedFn("ignored");
    vi.advanceTimersByTime(50);
    expect(mockFn).toHaveBeenCalledTimes(1);

    // 冷卻期結束後應該可以再次調用
    vi.advanceTimersByTime(51);
    debouncedFn("after-cooldown");
    expect(mockFn).toHaveBeenCalledWith("after-cooldown");
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it("cancel 方法應該取消待執行的調用", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn("test");
    debouncedFn.cancel();

    vi.advanceTimersByTime(100);
    expect(mockFn).not.toHaveBeenCalled();
  });

  it("flush 方法應該立即執行", () => {
    const mockFn = vi.fn().mockReturnValue("result");
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn("test");
    const result = debouncedFn.flush("flush-test");

    expect(result).toBe("result");
    expect(mockFn).toHaveBeenCalledWith("flush-test");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("pending 方法應該正確回報狀態", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    expect(debouncedFn.pending()).toBe(false);

    debouncedFn("test");
    expect(debouncedFn.pending()).toBe(true);

    vi.advanceTimersByTime(100);
    expect(debouncedFn.pending()).toBe(false);
  });
});

describe("debounceAsync", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("應該處理 Promise 返回值", async () => {
    const mockAsyncFn = vi.fn().mockResolvedValue("async-result");
    const debouncedFn = debounceAsync(mockAsyncFn, 100);

    const promise = debouncedFn("test");
    vi.advanceTimersByTime(100);

    const result = await promise;
    expect(result).toBe("async-result");
    expect(mockAsyncFn).toHaveBeenCalledWith("test");
  });

  it("應該取消之前的 Promise", async () => {
    const mockAsyncFn = vi.fn().mockResolvedValue("result");
    const debouncedFn = debounceAsync(mockAsyncFn, 100);

    const promise1 = debouncedFn("first");
    const promise2 = debouncedFn("second");

    vi.advanceTimersByTime(100);

    await expect(promise1).rejects.toThrow("Debounced function called again");
    await expect(promise2).resolves.toBe("result");
  });
});

describe("throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("應該限制函數執行頻率", () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100);

    // 第一次調用應該立即執行（leading = true）
    throttledFn("first");
    expect(mockFn).toHaveBeenCalledWith("first");
    expect(mockFn).toHaveBeenCalledTimes(1);

    // 在節流期間的調用不會立即執行
    throttledFn("second");
    throttledFn("third");
    expect(mockFn).toHaveBeenCalledTimes(1);

    // 節流期間結束後，應該執行最後一次調用（trailing = true）
    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledWith("third");
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it("應該支援 leading: false 選項", () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100, { leading: false });

    throttledFn("first");
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledWith("first");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("應該支援 trailing: false 選項", () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100, { trailing: false });

    // 第一次調用立即執行
    throttledFn("first");
    expect(mockFn).toHaveBeenCalledWith("first");
    expect(mockFn).toHaveBeenCalledTimes(1);

    // 後續調用在節流期間不會執行
    throttledFn("second");
    throttledFn("third");

    vi.advanceTimersByTime(100);
    // trailing 為 false，所以不會執行最後的調用
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("應該支援 leading: false, trailing: false", () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100, {
      leading: false,
      trailing: false,
    });

    throttledFn("test");
    vi.advanceTimersByTime(100);

    // 兩個選項都為 false，函數不應該被執行
    expect(mockFn).not.toHaveBeenCalled();
  });

  it("cancel 方法應該取消待執行的調用", () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn("first");
    throttledFn("second");
    throttledFn.cancel();

    vi.advanceTimersByTime(100);
    // 只有第一次調用被執行，trailing 調用被取消
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith("first");
  });

  it("flush 方法應該立即執行待處理的調用", () => {
    const mockFn = vi.fn().mockReturnValue("result");
    const throttledFn = throttle(mockFn, 100);

    throttledFn("first");
    throttledFn("second");

    const result = throttledFn.flush();
    expect(result).toBe("result");
    expect(mockFn).toHaveBeenCalledWith("second");
    expect(mockFn).toHaveBeenCalledTimes(2); // leading + flush
  });

  it("pending 方法應該正確回報狀態", () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100);

    expect(throttledFn.pending()).toBe(false);

    throttledFn("first");
    throttledFn("second");
    expect(throttledFn.pending()).toBe(true);

    vi.advanceTimersByTime(100);
    expect(throttledFn.pending()).toBe(false);
  });

  it("應該在連續調用後正確重置", () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100);

    // 第一輪調用
    throttledFn("first");
    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);

    // 等待足夠時間確保節流重置
    vi.advanceTimersByTime(100);

    // 第二輪調用
    throttledFn("second");
    expect(mockFn).toHaveBeenCalledWith("second");
    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});

describe("throttleAnimationFrame", () => {
  beforeEach(() => {
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((callback) => {
      return setTimeout(callback, 16) as any; // 模擬 ~60fps
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("應該使用 requestAnimationFrame 節流", () => {
    const mockFn = vi.fn();
    const throttledFn = throttleAnimationFrame(mockFn);

    throttledFn("first");
    throttledFn("second");
    throttledFn("third");

    expect(global.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(mockFn).not.toHaveBeenCalled();

    // 觸發 requestAnimationFrame 回調
    const callback = (global.requestAnimationFrame as any).mock.calls[0][0];
    callback();

    expect(mockFn).toHaveBeenCalledWith("third");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
