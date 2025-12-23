import { isValidDate } from "./validations";

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
export function formatDate(
  date: Date | string,
  options: {
    components?: ("year" | "month" | "day" | "weekday" | "time" | "seconds")[];
    useChineseFormat?:
      | boolean
      | {
          date?: boolean;
          time?: boolean;
          weekday?: boolean;
        };
    separator?: string;
    roc?: boolean;
  } = {}
): string {
  const {
    components = ["year", "month", "day"],
    useChineseFormat = false,
    separator = "/",
    roc = false,
  } = options;

  // 處理中文格式設定
  const chineseConfig =
    typeof useChineseFormat === "boolean"
      ? {
          date: useChineseFormat,
          time: useChineseFormat,
          weekday: useChineseFormat,
        }
      : { date: false, time: false, weekday: false, ...useChineseFormat };

  if (!date) return "";

  let d: Date;
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

  const result: string[] = [];
  const dayList: string[] = ["日", "一", "二", "三", "四", "五", "六"];

  let timePart = "";
  let weekdayPart = "";

  // 各元件部位根據條件做調整
  for (const component of components) {
    switch (component) {
      case "year":
        if (chineseConfig.date) {
          result.push(`${roc ? year : year}年`);
        } else {
          result.push(roc ? String(year) : String(year).padStart(4, "0"));
        }
        break;
      case "month":
        if (chineseConfig.date) {
          result.push(`${d.getMonth() + 1}月`);
        } else {
          result.push(String(d.getMonth() + 1).padStart(2, "0"));
        }
        break;
      case "day":
        if (chineseConfig.date) {
          result.push(`${d.getDate()}日`);
        } else {
          result.push(String(d.getDate()).padStart(2, "0"));
        }
        break;
      case "weekday":
        weekdayPart = chineseConfig.weekday
          ? `星期${dayList[d.getDay()]}`
          : `(${dayList[d.getDay()]})`;
        break;
      case "time":
        if (chineseConfig.time) {
          timePart = `${d.getHours()}時${d.getMinutes()}分`;
        } else {
          timePart = `${String(d.getHours()).padStart(2, "0")}:${String(
            d.getMinutes()
          ).padStart(2, "0")}`;
        }
        break;
      case "seconds":
        if (chineseConfig.time) {
          timePart += `${d.getSeconds()}秒`;
        } else {
          timePart += `:${String(d.getSeconds()).padStart(2, "0")}`;
        }
        break;
    }
  }

  // 拼接日期部分
  const datePart = chineseConfig.date
    ? result.join("")
    : result.join(separator);

  // 建立最終結果陣列，確保所有部分之間都有空格
  const finalParts: string[] = [];

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
export function convertROCToGregorian(
  rocDate: string,
  separator: string = "/"
): string {
  if (!rocDate) return "";

  // Handle different separators (/, ., -)
  const normalized = rocDate.replace(/[.-]/g, "/");
  const parts = normalized.split("/");
  if (parts.length !== 3) return "";

  const [y, m, d] = parts;
  const year = parseInt(y);

  // 統一標準：民國 0 年以前無效，民國 1 年（1912）開始有效
  if (isNaN(year) || year <= 0) return "";

  const gregorianYear = year + 1911;
  const dateString = `${gregorianYear}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;

  if (!isValidDate(dateString)) return "";

  return formatDate(dateString, {
    components: ["year", "month", "day"],
    separator,
  });
}

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
export function adjustDateTime(
  date: Date | string,
  adjustments: {
    years?: number;
    months?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
  } = {},
  formatOptions: {
    components?: ("year" | "month" | "day" | "weekday" | "time" | "seconds")[];
    useChineseFormat?:
      | boolean
      | {
          date?: boolean;
          time?: boolean;
          weekday?: boolean;
        };
    separator?: string;
    roc?: boolean;
  } = {}
): string {
  const {
    years = 0,
    months = 0,
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
  } = adjustments;

  let newDate: Date;
  if (typeof date === "string") {
    if (!isValidDate(date)) return "";
    newDate = new Date(date);
  } else {
    newDate = new Date(date);
    if (isNaN(newDate.getTime())) return "";
  }

  // 先調整年分 (affects year boundaries, e.g., leap years)
  if (years !== 0) {
    newDate.setFullYear(newDate.getFullYear() + years);
  }

  // 再來調整月 (affects year/month boundaries)
  if (months !== 0) {
    newDate.setMonth(newDate.getMonth() + months);
  }

  // 日期 (affects month/year boundaries)
  if (days !== 0) {
    newDate.setDate(newDate.getDate() + days);
  }

  // 時間區間 (affects day/month/year boundaries)
  if (hours !== 0) {
    newDate.setHours(newDate.getHours() + hours);
  }
  if (minutes !== 0) {
    newDate.setMinutes(newDate.getMinutes() + minutes);
  }
  if (seconds !== 0) {
    newDate.setSeconds(newDate.getSeconds() + seconds);
  }

  // 回傳字串
  return formatDate(newDate, {
    components: ["year", "month", "day"], // Default components
    ...formatOptions,
  });
}

/**
 * @description 判斷給定的字串是否為 .NET DateTime 的最小值 (MinValue)
 * 用於表示「永不過期」或「無效日期」的情況
 *
 * @param dateStr - 從後端回傳的日期字串
 * @returns 如果日期等於 0001-01-01T00:00:00，則回傳 true
 *
 * @example
 * isDotNetMinDate("0001-01-01T00:00:00"); // true
 * isDotNetMinDate("2025-12-23T16:00:00"); // false
 */
export function isDotNetMinDate(dateStr: string): boolean {
  return dateStr === "0001-01-01T00:00:00";
}
