/**
 * 驗證 MAC 地址格式
 * @param {string} address - 要驗證的 MAC 地址
 * @returns {boolean} 如果是有效的 MAC 地址則返回 true
 * @example isValidMac("00:1A:2B:3C:4D:5E") => true
 * @example isValidMac("001A:2B:3C:4D:5E") => false
 */
declare function isValidMac(address: string): boolean;
/**
 * 驗證 IPv4 地址格式
 * @param {string} address - 要驗證的 IPv4 地址
 * @returns {boolean} 如果是有效的 IPv4 地址則返回 true
 * @example isValidIPv4("192.168.0.1") => true
 * @example isValidIPv4("256.256.256.256") => false
 */
declare function isValidIPv4(address: string): boolean;
/**
 * 檢查字符串是否僅包含數字（不包括負數）
 *
 * * 注意：這個函數不會檢查小數點，如果需要檢查小數點，請使用正則表達式
 *
 * @param {string} str - 要檢查的字符串
 * @returns {boolean} 如果字符串僅包含數字則返回 true
 * @example isNumberString("12345") => true
 * @example isNumberString("123a45") => false
 */
declare function isNumberString(str: string): boolean;
/**
 * 驗證電子郵件地址
 * @param {string} email - 要驗證的電子郵件地址
 * @returns {boolean} 如果是有效的電子郵件則返回 true
 * @example isEmail("test@example.com") => true
 * @example isEmail("test@.com") => false
 */
declare function isEmail(email: string): boolean;
/**
 * 檢查日期字串是不是合法
 *
 * * 檢查日期字串是不是空值( C# 的 DateTime.MinValue )
 * @param {string} dateString - 要驗證的日期字符串
 * @returns {boolean} 如果是有效的日期則返回 true
 * @example isValidDate("0001-01-01T00:00:00") => false
 * @example isValidDate("2023-10-05") => true
 * @example isValidDate("2023/10/05") => true
 * @example isValidDate("2023-13-05") => false
 */
declare function isValidDate(dateString: string): boolean;
/** 檢查是否為空的 GUID
 * @param {string} id - 要檢查的 GUID
 * @returns {boolean} 如果是空的 GUID 則返回 true
 * @example isEmptyGuid("00000000-0000-0000-0000-000000000000") => true
 * @example isEmptyGuid("123e4567-e89b-12d3-a456-426614174000") => false
 */
declare function isEmptyGuid(id: string): boolean;
/**
 * 判斷陣列是否為空（長度為 0）
 * @param arr 要檢查的陣列
 * @returns 如果是空陣列則回傳 true，否則為 false
 * @example
 * isEmptyArray([]) // true
 * isEmptyArray([1]) // false
 */
declare function isEmptyArray<T>(arr: T[]): boolean;
/**
 * 判斷物件是否為空（沒有任何鍵值）
 * @param obj 要檢查的物件
 * @returns 如果是空物件則回傳 true，否則為 false
 * @example
 * isEmptyObject({}) // true
 * isEmptyObject({ a: 1 }) // false
 */
declare function isEmptyObject<T extends object>(obj: T): boolean;
/**
 * 判斷數字是否為偶數
 * @param num 整數數字
 * @returns 如果是偶數則回傳 true
 * @example
 * isEven(2) // true
 * isEven(3) // false
 */
declare function isEven(num: number): boolean;

/**
 * Debounce 函數的類型定義
 */
interface DebounceFunction<T extends (...args: any[]) => any> {
    (...args: Parameters<T>): void;
    cancel(): void;
    flush(...args: Parameters<T>): ReturnType<T>;
    pending(): boolean;
}
/**
 * Throttle 選項配置
 */
interface ThrottleOptions {
    /**
     * 是否在節流開始時立即執行（預設：true）
     */
    leading?: boolean;
    /**
     * 是否在節流結束時執行最後一次調用（預設：true）
     */
    trailing?: boolean;
}
/**
 * Throttle 函數的類型定義
 */
interface ThrottleFunction<T extends (...args: any[]) => any> {
    (...args: Parameters<T>): ReturnType<T> | undefined;
    cancel(): void;
    flush(): ReturnType<T> | undefined;
    pending(): boolean;
}

/**
 * 生成新的 GUID
 * @returns {string} 新的 GUID
 * @example newGuid() => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
 */
declare function newGuid(): string;
/**
 * 獲取空的 GUID
 * @returns {string} 空的 GUID
 * @example emptyGuid() => "00000000-0000-0000-0000-000000000000"
 */
declare function emptyGuid(): string;
/**
 * 等待指定的毫秒數後回傳 Promise。適合用來進行延遲操作。
 *
 * @param {number} ms - 休眠毫秒數
 * @returns {Promise<void>}
 */
declare const sleep: (ms: number) => Promise<void>;
/**
 * 簡單的雜湊，適合做為緩存的鍵值
 * @param {string} str 要被雜湊的字串
 * @returns {string}
 */
declare const simpleHash: (str: string) => string;
/**
 * 錯誤處理，將 API 錯誤轉換為統一格式
 * @param error - 錯誤物件
 * @returns {object} 格式化的錯誤物件
 */
declare const handleApiError: (error: unknown) => {
    type: "business" | "auth" | "server" | "network";
    message: string;
    showToUser: boolean;
    shouldRetry: boolean;
    action?: string;
};
/**
 * 深層複製物件或陣列（需瀏覽器支援 `structuredClone`）
 * @param obj 要複製的物件
 * @returns 深拷貝的結果
 * @example
 * const original = { a: 1, b: { c: 2 } };
 * const copy = deepClone(original);
 */
declare function deepClone<T>(obj: T): T;
/**
 * 移除陣列中重複的元素
 * @param arr 原始陣列
 * @returns 不重複的新陣列
 * @example
 * removeDuplicate([1, 2, 2, 3]) // [1, 2, 3]
 */
declare function removeDuplicate<T>(arr: T[]): T[];
/**
 * 將 camelCase 字串轉換為 snake_case
 * @param str camelCase 字串
 * @returns snake_case 字串
 * @example
 * camelToSnake("myVariableName") // "my_variable_name"
 */
declare function camelToSnake(str: string): string;
/**
 * 將 snake_case 字串轉換為 camelCase
 * @param str snake_case 字串
 * @returns camelCase 字串
 * @example
 * snakeToCamel("my_variable_name") // "myVariableName"
 */
declare function snakeToCamel(str: string): string;
/**
 * 生成隨機的十六進位顏色碼
 * @returns 顏色字串（如 "#a3e12f"）
 * @example
 * getRandomColor() // "#f3d2b6"
 */
declare function getRandomColor(): string;
/**
 * 扁平化多層巢狀陣列
 * @param arr 多層陣列
 * @returns 單層陣列
 * @example
 * flattenArray([1, [2, [3]]]) // [1, 2, 3]
 */
declare function flattenArray<T>(arr: any[]): T[];
/**
 * 根據物件的指定鍵排序陣列（預設升序）
 * @param array 要排序的陣列
 * @param key 依據排序的鍵
 * @returns 排序後的新陣列
 * @example
 * soryByKey([{ id: 2 }, { id: 1 }], 'id') // [{ id: 1 }, { id: 2 }]
 */
declare function sortByKey<T extends Record<string, any>>(array: T[], key: string): T[];
/**
 * 將陣列轉換為物件，以指定鍵為 key
 * @param arr 陣列資料
 * @param key 作為物件 key 的屬性名稱
 * @returns 轉換後的物件
 * @example
 * convertArrayToObject([{ id: 'a' }, { id: 'b' }], 'id') // { a: { id: 'a' }, b: { id: 'b' } }
 */
declare function convertArrayToObject<T extends Record<string, any>>(arr: T[], key: string): Record<string, T>;
/**
 * 將物件轉換為 URL 查詢字串
 * @param obj 物件資料
 * @returns 查詢字串（如 "a=1&b=2"）
 * @example
 * objToQueryString({ a: 1, b: "test" }) // "a=1&b=test"
 */
declare function objToQueryString<T extends Record<string, any>>(obj: T): string;
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
declare function debounce<T extends (...args: any[]) => any>(func: T, delay: number, immediate?: boolean): DebounceFunction<T>;
/**
 * Promise 版本的 debounce
 */
declare function debounceAsync<T extends (...args: any[]) => Promise<any>>(func: T, delay: number): (...args: Parameters<T>) => Promise<ReturnType<T>>;
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
declare function throttle<T extends (...args: any[]) => any>(func: T, delay?: number, options?: ThrottleOptions): ThrottleFunction<T>;
/**
 * 基於 requestAnimationFrame 的 throttle
 */
declare function throttleAnimationFrame<T extends (...args: any[]) => any>(func: T): (...args: Parameters<T>) => void;
/**
 * 深層比較兩個值是否相等。
 * 支援基本類型、Array、Object，並處理 NaN === NaN 的情況。
 *
 * @param value - 要比較的第一個值
 * @param other - 要比較的第二個值
 * @returns 是否深層相等
 * @example
 * isEqual({ a: 1, b: [2, 3] }, { a: 1, b: [2, 3] }) // true
 * isEqual([1, 2, 3], [1, 2, 3]) // true
 * isEqual(NaN, NaN) // true
 */
declare function isEqual(value: unknown, other: unknown): boolean;

/**
 * @description 格式化日期時間為指定格式的字串
 *
 * @param {Date | string} date - 要格式化的日期，可以是 Date 物件或日期字串
 * @param {Object} [options={}] - 格式化選項
 * @param {string[]} [options.components=["year", "month", "day"]] - 要包含的日期時間組件
 *   - "year": 年份
 *   - "month": 月份
 *   - "day": 日期
 *   - "weekday": 星期
 *   - "time": 時間（時:分）
 *   - "seconds": 秒數（需搭配 "time" 使用）
 * @param {boolean | Object} [options.useChineseFormat=false] - 中文格式設定
 *   - boolean: true 全部中文化，false 全部英文格式
 *   - Object: 彈性設定各部分是否中文化
 *     - date?: boolean - 日期部分是否中文化（年月日）
 *     - time?: boolean - 時間部分是否中文化（時分秒）
 *     - weekday?: boolean - 星期部分是否中文化（星期X vs (X)）
 * @param {string} [options.separator="/"] - 日期組件間的分隔符號（僅在非中文格式時使用）
 * @param {boolean} [options.roc=false] - 是否使用民國紀年
 * @returns {string} 格式化後的日期時間字串，各部分以空格分隔；若輸入無效則返回空字串
 *
 * @example
 * // 基本用法 - 預設格式
 * formatDate(new Date("2025-06-18"))
 * // => "2025/06/18"
 *
 * @example
 * // 包含時間
 * formatDate(new Date("2025-06-18T14:30:45"), {
 *   components: ["year", "month", "day", "time", "seconds"]
 * })
 * // => "2025/06/18 14:30:45"
 *
 * @example
 * // 包含星期
 * formatDate(new Date("2025-06-18"), {
 *   components: ["year", "month", "day", "weekday"]
 * })
 * // => "2025/06/18 (三)"
 *
 * @example
 * // 完整格式
 * formatDate(new Date("2025-06-18T14:30:45"), {
 *   components: ["year", "month", "day", "time", "seconds", "weekday"]
 * })
 * // => "2025/06/18 14:30:45 (三)"
 *
 * @example
 * // 自訂分隔符
 * formatDate(new Date("2025-06-18"), { separator: "-" })
 * // => "2025-06-18"
 *
 * @example
 * // 民國紀年
 * formatDate(new Date("2025-06-18"), { roc: true })
 * // => "114/06/18"
 *
 * @example
 * // 全部中文格式
 * formatDate(new Date("2025-06-18T14:30:45"), {
 *   components: ["year", "month", "day", "time", "seconds", "weekday"],
 *   useChineseFormat: true
 * })
 * // => "2025年6月18日 14時30分45秒 星期三"
 *
 * @example
 * // 只有日期中文化
 * formatDate(new Date("2025-06-18T14:30:45"), {
 *   components: ["year", "month", "day", "time", "weekday"],
 *   useChineseFormat: { date: true }
 * })
 * // => "2025年6月18日 14:30 (三)"
 *
 * @example
 * // 只有時間中文化
 * formatDate(new Date("2025-06-18T14:30:45"), {
 *   components: ["year", "month", "day", "time", "seconds"],
 *   useChineseFormat: { time: true }
 * })
 * // => "2025/06/18 14時30分45秒"
 *
 * @example
 * // 只有星期中文化
 * formatDate(new Date("2025-06-18"), {
 *   components: ["year", "month", "day", "weekday"],
 *   useChineseFormat: { weekday: true }
 * })
 * // => "2025/06/18 星期三"
 *
 * @example
 * // 混合中文格式
 * formatDate(new Date("2025-06-18T14:30:45"), {
 *   components: ["year", "month", "day", "time", "seconds", "weekday"],
 *   useChineseFormat: { date: true, weekday: true }
 * })
 * // => "2025年6月18日 14:30:45 星期三"
 *
 * @example
 * // 民國年 + 中文格式
 * formatDate(new Date("2025-06-18"), {
 *   roc: true,
 *   useChineseFormat: { date: true }
 * })
 * // => "114年6月18日"
 *
 * @example
 * // 處理字串輸入
 * formatDate("2025-06-18T14:30:45")
 * // => "2025/06/18"
 *
 * @example
 * // 無效輸入
 * formatDate("")
 * // => ""
 * formatDate("invalid-date")
 * // => ""
 * formatDate(new Date("invalid"))
 * // => ""
 */
declare function formatDate(date: Date | string, options?: {
    components?: ("year" | "month" | "day" | "weekday" | "time" | "seconds")[];
    useChineseFormat?: boolean | {
        date?: boolean;
        time?: boolean;
        weekday?: boolean;
    };
    separator?: string;
    roc?: boolean;
}): string;
/**
 * @description 將民國曆日期字串 (YYY/MM/DD) 轉換為西元日期字串 (YYYY/MM/DD)
 *
 * @param {string} rocDate - 民國年格式的日期字串，例如 "112/10/05"
 * @param {string} [separator="/"] - 西元日期輸出時的分隔符號，預設為 "/"
 * @returns {string} 格式化後的西元日期字串；若輸入無效或年份非數字則回傳空字串
 *
 * @example
 * convertROCToGregorian("112/10/05")
 * // => "2023/10/05"
 *
 * @example
 * convertROCToGregorian("112.10.05", ".")
 * // => "2023.10.05"
 *
 * @example
 * convertROCToGregorian("")
 * // => ""
 *
 * @example
 * convertROCToGregorian("0001-01-01T00:00:00")
 * // => ""
 */
declare function convertROCToGregorian(rocDate: string, separator?: string): string;
/**
 * @description 調整日期時間並回傳格式化的字串，支援加減年、月、天、時、分、秒
 *
 * @param {Date | string} date - 要調整的日期，可以是 `Date` 物件或日期字串（格式為 YYYY-MM-DD 或 YYYY/MM/DD）
 * @param {Object} [adjustments] - 調整選項
 * @param {number} [adjustments.years=0] - 要加減的年數（正數為加，負數為減）
 * @param {number} [adjustments.months=0] - 要加減的月數（正數為加，負數為減）
 * @param {number} [adjustments.days=0] - 要加減的天數（正數為加，負數為減）
 * @param {number} [adjustments.hours=0] - 要加減的小時數（正數為加，負數為減）
 * @param {number} [adjustments.minutes=0] - 要加減的分鐘數（正數為加，負數為減）
 * @param {number} [adjustments.seconds=0] - 要加減的秒數（正數為加，負數為減）
 * @param {Object} [formatOptions] - 格式化選項，參見 formatDate 的選項
 * @param {string[]} [formatOptions.components=["year", "month", "day"]] - 要包含的日期或時間組件
 * @param {boolean | Object} [formatOptions.useChineseFormat=false] - 中文格式設定，可以是布林值或物件 { date?: boolean, time?: boolean, weekday?: boolean }
 * @param {string} [formatOptions.separator="/"] - 年月日之間的分隔符號
 * @param {boolean} [formatOptions.roc=false] - 是否使用民國年格式
 * @returns {string} 格式化後的日期時間字串；若輸入日期無效則回傳空字串
 *
 * @example
 * adjustDateTime(new Date("2025-06-12"), { days: 5 })
 * // => "2025/06/17"
 *
 * @example
 * adjustDateTime("2025-06-30", { days: 1 })
 * // => "2025/07/01" (month boundary)
 *
 * @example
 * adjustDateTime("2025-07-01", { days: -1 })
 * // => "2025/06/30" (month boundary, subtraction)
 *
 * @example
 * adjustDateTime("2025-12-15", { years: 1, months: 1 })
 * // => "2027/01/15" (year boundary)
 *
 * @example
 * adjustDateTime("2024-02-29", { years: 1 })
 * // => "2025/02/28" (leap year boundary)
 *
 * @example
 * adjustDateTime("2025-06-12T10:00:00", { hours: 14, minutes: 30 }, { components: ["year", "month", "day", "time"] })
 * // => "2025/06/13 00:30" (day boundary via hours)
 *
 * @example
 * adjustDateTime("2025-06-12T00:00:00", { hours: -1, seconds: -30 }, { components: ["year", "month", "day", "time", "seconds"] })
 * // => "2025/06/11 23:59:30" (day boundary, subtraction)
 *
 * @example
 * adjustDateTime("2025-06-12", { years: -2 }, { roc: true })
 * // => "112/06/12" (ROC year)
 *
 * @example
 * adjustDateTime("2025-06-12", { days: 1 }, { useChineseFormat: { date: true } })
 * // => "2025年6月13日" (Chinese date format)
 *
 * @example
 * adjustDateTime("2025-06-12T10:30:45", { hours: 2 }, {
 *   components: ["year", "month", "day", "time", "seconds", "weekday"],
 *   useChineseFormat: { time: true, weekday: true }
 * })
 * // => "2025/06/12 12時30分45秒 星期四" (Chinese time and weekday)
 *
 * @example
 * adjustDateTime("invalid-date", { days: 5 })
 * // => ""
 */
declare function adjustDateTime(date: Date | string, adjustments?: {
    years?: number;
    months?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
}, formatOptions?: {
    components?: ("year" | "month" | "day" | "weekday" | "time" | "seconds")[];
    useChineseFormat?: boolean | {
        date?: boolean;
        time?: boolean;
        weekday?: boolean;
    };
    separator?: string;
    roc?: boolean;
}): string;

/**
 * 將數字格式化為千位分隔符與小數的格式。
 *
 * @param num 要格式化的數字。
 * @param decimalPlaces 小數點後的位數，預設為 2。
 * @param decimalSep 小數點的分隔符，預設為 "."。
 * @param thousandSep 千位分隔符，預設為 ","。
 * @returns 格式化後的字串。如果輸入不是有限數字，則回傳空字串。
 *
 * @example
 * formatNumber(1234567.89) // "1,234,567.89"
 */
declare function formatNumber(num: number, decimalPlaces?: number, decimalSep?: string, thousandSep?: string): string;
/**
 * 將數字格式化為固定小數位數，並補齊 0。
 *
 * @param num 要格式化的數字。
 * @param count 小數點後要保留的位數。
 * @returns 格式化後的字串。如果輸入不是有限數字或 count 小於 0，則回傳空字串。
 *
 * @example
 * padDecimals(3.1, 4) // "3.1000"
 */
declare function padDecimals(num: number, count: number): string;
/**
 * 將千位分隔符移除（預設為 ,）。
 *
 * @param str 要處理的字串。
 * @param sep 要移除的分隔符，預設為 ","。
 * @returns 移除分隔符後的字串。
 *
 * @example
 * removeThousands("1,234,567.89") // "1234567.89"
 */
declare function removeThousands(str: string, sep?: string): string;
/**
 * 將數字或字串添加千位分隔符。
 *
 * @param num 要格式化的數字或字串。
 * @returns 添加千位分隔符後的字串。如果輸入不是數字，則回傳原始字串。
 *
 * @example
 * addCommas(1234567.89) // "1,234,567.89"
 */
declare function addCommas(num: string | number): string;
/**
 * 產生介於指定最小值與最大值（含）之間的隨機整數。
 *
 * @param min 最小整數值（包含）。
 * @param max 最大整數值（包含）。
 * @returns 一個介於 min 和 max 之間的隨機整數。
 * @example
 * getRandowmNumber(1, 10) // 可能回傳 1~10 之間的任一整數
 */
declare function getRandowmNumber(min: number, max: number): number;

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
declare function padLeft(str: string, length: number, padChar: string): string;
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
declare function capitalizeWords(str: string): string;
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
declare function btoaEncode(str: string): string;
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
declare function atobDecode(str: string): Promise<string>;

/**
 * 重新導向到指定的路徑或網址
 * 支援完整網址、相對路徑，並自動處理 IIS 虛擬目錄環境
 *
 * @param path - 目標路徑或完整網址
 * @param options - 導向選項
 * @param options.delay - 延遲時間（毫秒），預設為 0
 * @param options.newTab - 是否在新分頁開啟，預設為 false
 * @param options.replace - 是否替換當前頁面歷史記錄，預設為 false
 *
 * @example
 * 站內相對路徑
 * redirect("/users/profile");
 *
 * @example
 * 完整外部網址
 * redirect("https://external-site.com");
 *
 * @example
 * 新分頁開啟
 * redirect("/api/data", { newTab: true });
 *
 * @example
 * 延遲導向
 * redirect("/dashboard", { delay: 1000 });
 *
 * @example
 * 相對於當前目錄的路徑
 * redirect("profile.html");
 *
 * @example
 * 替換當前頁面歷史記錄
 * redirect("/login", { replace: true });
 *
 * @example
 * 組合使用選項
 * redirect("https://docs.example.com", { delay: 500, newTab: true });
 */
declare function redirect(path: string, options?: {
    delay?: number;
    newTab?: boolean;
    replace?: boolean;
}): void;
/**
 * 取得基礎 URL，自動處理 IIS 虛擬目錄情況
 *
 * @returns 基礎 URL 字串
 *
 * @example
 * 開發環境
 * 當前 URL: http://localhost:3000/some/path
 * 回傳: "http://localhost:3000"
 *
 * @example
 * 生產環境（IIS 虛擬目錄）
 * 當前 URL: https://example.com.tw/project1/users/profile
 * 回傳: "https://example.com.tw/project1"
 */
declare function getBaseUrl(): string;
/**
 * 取得當前 URL 中相對於虛擬目錄的路徑（不含虛擬目錄與查詢參數）
 *
 * @returns 相對路徑（不含 domain 與虛擬目錄）
 *
 * @example
 * // 開發環境
 * URL: http://localhost:3000/test/page?a=1
 * 回傳: "/test/page"
 *
 * @example
 * // 生產環境（IIS 虛擬目錄）
 * URL: https://example.com/project1/page/edit?id=10
 * 回傳: "/page/edit"
 */
declare function getPath(): string;
/**
 * 取得當前頁面的名稱（即最後一段 path，不含參數與虛擬目錄）
 *
 * @returns 頁面名稱字串（例如 "edit", "list"）
 *
 * @example
 * // 開發環境
 * URL: http://localhost:3000/user/list?id=5
 * 回傳: "list"
 *
 * @example
 * // 生產環境
 * URL: https://abc.com/project1/page/edit
 * 回傳: "edit"
 */
declare function getPageName(): string;
/**
 * 返回上一頁。
 * @example
 * goBack();
 */
declare function goBack(): void;
/**
 * 獲取 URL 參數 QueryString 的 key
 * @param {string} key - 參數名稱
 * @returns {string|null} 參數值
 * @example
 * // https://www.google.com?key=value
 * getQueryParam("key") // value
 */
declare function getQueryParam(key: string): string | null;
/**
 * 移除 URL 中的指定參數。
 * @param {string} url - 目標網址。
 * @param {string} name - 要移除的參數名稱。
 * @returns {string} 移除參數後的網址。
 * @example
 * // https://www.google.com?key=value&name=test
 * removeUrlParam("https://www.google.com?key=value&name=test", "name") // "https://www.google.com?key=value"
 */
declare function removeUrlParam(url: string, name: string): string;

/**
 * @module WebSocketClient
 * @description WebSocket client module，負責管理 WebSocket 連線。
 * - 請注意裡面的方法都是 Promise，請使用 async/await 或 .then() 處理。
 * - 使用前請先引入 `WebSocketClient` 類別。
 */
/**
 * WebSocket 連線狀態枚舉
 */
declare enum WebSocketState {
    CONNECTING = "connecting",
    CONNECTED = "connected",
    DISCONNECTING = "disconnecting",
    DISCONNECTED = "disconnected",
    ERROR = "error"
}
/**
 * WebSocket 訊息類型
 */
interface WebSocketMessage {
    type: string;
    [key: string]: string;
}
/**
 * WebSocket 設定選項
 */
interface WebSocketOptions {
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
interface WebSocketEventHandlers {
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
declare class WebSocketClient {
    private readonly options;
    private socket;
    private currentState;
    private lockReconnect;
    private reconnectAttempts;
    private currentReconnectDelay;
    private heartbeatTimer;
    private heartbeatTimeoutTimer;
    private eventHandlers;
    constructor(options: WebSocketOptions);
    /**
     * 驗證配置選項
     */
    private validateOptions;
    /**
     * 設定事件處理器
     */
    setEventHandlers(handlers: WebSocketEventHandlers): this;
    /**
     * 獲取當前連線狀態
     */
    getState(): WebSocketState;
    /**
     * 檢查是否已連線
     */
    isConnected(): boolean;
    /**
     * 更新連線狀態
     */
    private setState;
    /**
     * 建構 WebSocket URL
     */
    private buildWebSocketURL;
    /**
     * 處理 WebSocket 連線，必須在使用前調用，且等待連線成功後才能發送訊息。
     * @returns Promise<void>
     */
    connect(): Promise<void>;
    /**
     * 設置 WebSocket 持久性事件處理（不包含 open 事件，因為已經在 connect 中處理）
     */
    private setupEventHandlers;
    /**
     * 處理重連, 將重連次數 log
     */
    private handleReconnect;
    /**
     * 開始心跳檢查
     */
    private startHeartbeat;
    /**
     * 重置心跳計時器
     */
    private resetHeartbeat;
    /**
     * 發送心跳
     */
    private sendHeartbeat;
    /**
     * 清除心跳超時計時器
     */
    private clearHeartbeatTimeout;
    /**
     * 停止心跳檢查
     */
    private stopHeartbeat;
    /**
     * 發送訊息
     * @param message - 要發送的訊息物件
     */
    send(message: WebSocketMessage | string): boolean;
    /**
     * 主動關閉連線
     */
    disconnect(): void;
    /**
     * 清理資源
     */
    destroy(): void;
}

type ApiResponse<T = unknown> = {
    errorMessage?: string;
} & (T extends any[] ? {
    itemList: Partial<T>;
} & Record<string, unknown> : Partial<T> & Record<string, unknown>);
interface ApiConfig {
    staleTime: number;
    cacheTime: number;
    retry: number;
    retryDelay: (attemptIndex: number) => number;
    enabled: boolean;
    treatErrorMessageAsError?: boolean;
    cache?: boolean;
}
type AvailableHttpMethod = "GET" | "POST" | "DELETE" | "PATCH" | "PUT" | "OPTION";
interface QueryOptions {
    baseUrl?: string;
    endpoint: string;
    requestBody: string | Record<string, any> | FormData;
    method?: AvailableHttpMethod;
    config?: Partial<ApiConfig>;
    fetchOptions?: Partial<RequestInit>;
}
interface TokenResponse {
    token: string;
    tokenExpire: string;
    account: string;
    name: string;
    appNo: string;
    webURL: string;
    bMemNo: string;
    bMemName: string;
    bDate: string;
    uMemNo: string;
    uMemName: string;
    uDate: string;
    checkCode: string;
}

declare class ApiStateManager {
    private cache;
    private queries;
    private defaultConfig;
    private auth;
    constructor(appAccount: string, appPassword: string);
    generateQueryKey(endpoint: string, requestBody: any, method: string): string;
    getQuery(queryKey: string): QueryState | undefined;
    setCache(queryKey: string, data: ApiResponse): void;
    isCacheValid(cacheEntry: {
        data: ApiResponse;
        timestamp: number;
    } | undefined, staleTime: number): boolean;
    cleanExpiredCache(maxSize?: number): void;
    executeRequest(baseUrl: string, endpoint: string, requestBody: string | Record<string, any> | FormData, method: AvailableHttpMethod, options?: Partial<ApiConfig>, fetchOptions?: Partial<RequestInit>): Promise<ApiResponse>;
    getDefaultConfig(): ApiConfig;
    setDefaultConfig(config: Partial<ApiConfig>): void;
    cleanup(): void;
}
declare class QueryState {
    queryKey: string;
    status: "idle" | "loading" | "success" | "error";
    data: ApiResponse | null;
    error: any;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    isFetching: boolean;
    failureCount: number;
    subscribers: Set<(state: any) => void>;
    lastUpdated: number | null;
    constructor(queryKey: string);
    updateStatus(status: "idle" | "loading" | "success" | "error", data?: ApiResponse | null, error?: any): void;
    notifySubscribers(): void;
    getState(): {
        status: "idle" | "loading" | "success" | "error";
        data: ApiResponse | null;
        error: any;
        isLoading: boolean;
        isError: boolean;
        isSuccess: boolean;
        isFetching: boolean;
        failureCount: number;
        lastUpdated: number | null;
    };
    subscribe(callback: (state: any) => void): () => void;
}
declare function createApiStateManager(appAccount: string, appPassword: string): ApiStateManager;
declare function ajaxApi(apiStateManager: ApiStateManager, { baseUrl, endpoint, requestBody, method, config, fetchOptions, }: QueryOptions): Promise<ApiResponse>;
declare function useAjaxApi(apiStateManager: ApiStateManager, { baseUrl, endpoint, requestBody, method, config, fetchOptions, }: QueryOptions): QueryState;
declare function refetchQuery(apiStateManager: ApiStateManager, { baseUrl, endpoint, requestBody, method, config, fetchOptions, }: QueryOptions): Promise<ApiResponse>;
declare function invalidateQuery(apiStateManager: ApiStateManager, { baseUrl, endpoint, requestBody, method, config, fetchOptions, }: QueryOptions): Promise<void>;
declare function clearAllCache(apiStateManager: ApiStateManager): void;
declare function setDefaultConfig(apiStateManager: ApiStateManager, config: Partial<ApiConfig>): void;
declare function cleanCacheInterval(apiStateManager: ApiStateManager): void;

interface LogOptions {
    bMemNo: string | null;
    type: string;
    message: string;
    message2?: string;
    message3?: string;
    url?: string;
}
/**
 * 記錄平台操作資訊的工具
 */
declare class InfoLogger {
    private apiStateManager;
    /**
     * 構造函數，接受 ApiStateManager 實例
     * @param apiStateManager - 已初始化的 ApiStateManager 實例
     */
    constructor(apiStateManager: ApiStateManager);
    /**
     * 取得使用者平台名稱（手機、電腦、iOS 等）
     * @returns {string} 平台名稱
     */
    static getPlatform(): string;
    /**
     * 記錄一筆 Info Log 到伺服器
     * @param options - Log 參數
     * @returns {Promise<void>}
     */
    log({ bMemNo, type, message, message2, message3, url, }: LogOptions): Promise<void>;
}

declare class AppAuthorization {
    private appAccount;
    private appPassword;
    private tokenPromise;
    constructor(appAccount?: string, appPassword?: string);
    getToken(): Promise<ApiResponse<TokenResponse>>;
    prepareAuthHeader(headers: Record<string, string>, url: string): Promise<boolean>;
}

export { ApiStateManager, AppAuthorization, InfoLogger, QueryState, WebSocketClient, type WebSocketEventHandlers, type WebSocketMessage, type WebSocketOptions, WebSocketState, addCommas, adjustDateTime, ajaxApi, atobDecode, btoaEncode, camelToSnake, capitalizeWords, cleanCacheInterval, clearAllCache, convertArrayToObject, convertROCToGregorian, createApiStateManager, debounce, debounceAsync, deepClone, emptyGuid, flattenArray, formatDate, formatNumber, getBaseUrl, getPageName, getPath, getQueryParam, getRandomColor, getRandowmNumber, goBack, handleApiError, invalidateQuery, isEmail, isEmptyArray, isEmptyGuid, isEmptyObject, isEqual, isEven, isNumberString, isValidDate, isValidIPv4, isValidMac, newGuid, objToQueryString, padDecimals, padLeft, redirect, refetchQuery, removeDuplicate, removeThousands, removeUrlParam, setDefaultConfig, simpleHash, sleep, snakeToCamel, sortByKey, throttle, throttleAnimationFrame, useAjaxApi };
