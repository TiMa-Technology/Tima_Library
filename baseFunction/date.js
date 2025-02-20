/**
 * 將日期格式化為西元日期字符串 (YYYY/MM/DD)
 * @param {Date|string} date - 要格式化的日期
 * @param {string} [separator="/"] - 分隔符號
 * @returns {string} 格式化後的日期字符串
 * @example formatDate(new Date()) => "2023/10/05"
 * @example formatDate(new Date(), ".") => "2023.10.05"
 */
export function formatDate(date, separator = "/") {
  const d = new Date(date)
  const yyyy = d.getFullYear()
  const mm = (d.getMonth() + 1).toString().padStart(2, "0")
  const dd = d.getDate().toString().padStart(2, "0")
  return `${yyyy}${separator}${mm}${separator}${dd}`
}

/**
 * 將日期格式化為西元日期時間字符串 (YYYY/MM/DD HH:mm)
 * @param {Date|string} date - 要格式化的日期
 * @param {string} [separator="/"] - 分隔符號
 * @returns {string} 格式化後的日期時間字符串
 * @example formatDateTime(new Date()) => "2023/10/05 14:30"
 * @example formatDateTime(new Date(), ".") => "2023.10.05 14:30"
 */
export function formatDateTime(date, separator = "/") {
  const d = new Date(date)
  const yyyy = d.getFullYear()
  const mm = (d.getMonth() + 1).toString().padStart(2, "0")
  const dd = d.getDate().toString().padStart(2, "0")
  const hh = d.getHours().toString().padStart(2, "0")
  const min = d.getMinutes().toString().padStart(2, "0")
  return yyyy === 1
    ? ""
    : `${yyyy}${separator}${mm}${separator}${dd} ${hh}:${min}`
}

/**
 * 將日期格式化為帶秒的西元日期時間字符串 (YYYY/MM/DD HH:mm:ss)
 * @param {Date|string} date - 要格式化的日期
 * @param {string} [separator="/"] - 分隔符號
 * @returns {string} 格式化後的帶秒的日期時間字符串
 * @example formatDateTimeWithSeconds(new Date()) => "2023/10/05 14:30:45"
 * @example formatDateTimeWithSeconds(new Date(), ".") => "2023.10.05 14:30:45"
 */
export function formatDateTimeWithSeconds(date, separator = "/") {
  const d = new Date(date)
  const yyyy = d.getFullYear()
  const mm = (d.getMonth() + 1).toString().padStart(2, "0")
  const dd = d.getDate().toString().padStart(2, "0")
  const hh = d.getHours().toString().padStart(2, "0")
  const min = d.getMinutes().toString().padStart(2, "0")
  const ss = d.getSeconds().toString().padStart(2, "0")
  return yyyy === 1
    ? ""
    : `${yyyy}${separator}${mm}${separator}${dd} ${hh}:${min}:${ss}`
}

/**
 * 將日期格式化為民國曆日期 (YYY/MM/DD)
 * @param {Date|string} date - 要格式化的日期
 * @param {string} [separator="/"] - 分隔符號
 * @returns {string} 格式化後的民國曆日期
 * @example formatROCDate(new Date()) => "112/10/05"
 * @example formatROCDate(new Date(), ".") => "112.10.05"
 */
export function formatROCDate(date, separator = "/") {
  const d = new Date(date)
  const yyyy = d.getFullYear() - 1911
  const mm = (d.getMonth() + 1).toString().padStart(2, "0")
  const dd = d.getDate().toString().padStart(2, "0")
  return yyyy <= 1 ? "" : `${yyyy}${separator}${mm}${separator}${dd}`
}

/**
 * 將民國曆日期轉換為西元日期
 * @param {string} rocDate - 民國曆日期 (YYY/MM/DD)
 * @param {string} [separator="/"] - 分隔符號
 * @returns {string} 西元日期 (YYYY/MM/DD)
 * @example convertROCToGregorian("112/10/05") => "2023/10/05"
 */
export function formatROCToGregorian(rocDate, separator = "/") {
  if (!rocDate) return ""
  const [y, m, d] = rocDate.split("/")
  const gregorianYear = parseInt(y) + 1911
  const date = new Date(`${gregorianYear}/${m}/${d}`)
  return formatDate(date, separator)
}

/**
 * 為日期添加天數
 * @param {Date} date - 要修改的日期
 * @param {number} days - 要添加的天數
 * @returns {Date} 修改後的日期
 * @example addDays(new Date(), 5) => Date object representing 5 days later
 */
export function addDays(date, days) {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + days)
  return newDate
}

/**
 * 格式化日期、星期及時間 yyyy/mm/dd(一) HH:mm
 * @param {string} dateString - 可解析為日期的字串
 * @param {string} [separator="/"] - 分隔符號
 * @returns {string} 格式化後的日期字串
 * @example
 * formatDateWeekTime('2024-02-20T10:30:00') // '2024/02/20(二) 10:30'
 * @example
 * formatDateWeekTime('2024-02-20T10:30:00', ".") // '2024.02.20(二) 10:30'
 */
export function formatDateWeekTime(dateString, separator = "/") {
  const d = new Date(dateString)
  if (d.getFullYear() === 1) return ""
  const dayList = ["日", "一", "二", "三", "四", "五", "六"]
  return `${d.getFullYear()}${separator}${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}${separator}${String(d.getDate()).padStart(2, "0")}(${
    dayList[d.getDay()]
  }) ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
    2,
    "0"
  )}`
}

/**
 * 格式化星期幾
 * @param {string} dateString - 可解析為日期的字串
 * @returns {string} 星期幾
 * @example
 * formatChWeek('2024-02-20') // '星期二'
 */
export function formatChWeek(dateString) {
  const d = new Date(dateString)
  const dayList = ["日", "一", "二", "三", "四", "五", "六"]
  return `星期${dayList[d.getDay()]}`
}

/**
 * 格式化時間 HH:mm
 * @param {string} dateString - 可解析為日期的字串
 * @returns {string} 格式化後的時間字串
 * @example
 * formatTime('2024-02-20T10:30:00') // '10:30'
 */
export function formatTime(dateString) {
  const d = new Date(dateString)
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`
}

/**
 * 格式化時間 HH:mm:ss
 * @param {string} dateString - 可解析為日期的字串
 * @returns {string} 格式化後的時間字串
 * @example
 * formatTimeSec('2024-02-20T10:30:45') // '10:30:45'
 */
export function formatTimeWithSec(dateString) {
  const d = new Date(dateString)
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`
}

/**
 * 格式化西元年 yyyy
 * @param {string} dateString - 可解析為日期的字串
 * @returns {string|number} 西元年
 * @example
 * formatYear('2024-02-20') // 2024
 */
export function formatYear(dateString) {
  const d = new Date(dateString)
  return d.getFullYear() === 1 ? "" : d.getFullYear()
}

/**
 * 格式化民國年 yyy
 * @param {string} dateString - 可解析為日期的字串
 * @returns {string|number} 民國年
 * @example
 * formatChYear('2024-02-20') // 113
 */
export function formatChYear(dateString) {
  const d = new Date(dateString)
  return d.getFullYear() - 1911 <= 1 ? "" : d.getFullYear() - 1911
}

/**
 * 格式化中文月份 x月
 * @param {string} dateString - 可解析為日期的字串
 * @returns {string} 月份
 * @example
 * formatMonth('2024-02-20') // '2月'
 */
export function formatMonth(dateString) {
  const d = new Date(dateString)
  return d.getFullYear() === 1 ? "" : `${d.getMonth() + 1}月`
}

/**
 * 格式化日期 dd
 * @param {string} dateString - 可解析為日期的字串
 * @returns {string} 日期
 * @example
 * formatDay('2024-02-20') // '20'
 */
export function formatDay(dateString) {
  const d = new Date(dateString)
  return d.getFullYear() === 1 ? "" : String(d.getDate()).padStart(2, "0")
}
