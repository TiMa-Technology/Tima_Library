  /**
   * 將日期格式化為西元日期字符串 (YYYY/MM/DD)
   * @param {Date|string} date - 要格式化的日期
   * @returns {string} 格式化後的日期字符串
   * @example formatDate(new Date()) => "2023/10/05"
   */
  export function formatDate(date) {
    const d = new Date(date)
    const yyyy = d.getFullYear()
    const mm = (d.getMonth() + 1).toString().padStart(2, "0")
    const dd = d.getDate().toString().padStart(2, "0")
    return `${yyyy}/${mm}/${dd}`
  }

  /**
   * 將日期格式化為西元日期時間字符串 (YYYY/MM/DD HH:mm)
   * @param {Date|string} date - 要格式化的日期
   * @returns {string} 格式化後的日期時間字符串
   * @example formatDateTime(new Date()) => "2023/10/05 14:30"
   */
  export function formatDateTime(date) {
    const d = new Date(date)
    const yyyy = d.getFullYear()
    const mm = (d.getMonth() + 1).toString().padStart(2, "0")
    const dd = d.getDate().toString().padStart(2, "0")
    const hh = d.getHours().toString().padStart(2, "0")
    const min = d.getMinutes().toString().padStart(2, "0")
    return yyyy === 1 ? "" : `${yyyy}/${mm}/${dd} ${hh}:${min}`
  }

  /**
   * 將日期格式化為帶秒的西元日期時間字符串 (YYYY/MM/DD HH:mm:ss)
   * @param {Date|string} date - 要格式化的日期
   * @returns {string} 格式化後的帶秒的日期時間字符串
   * @example formatDateTimeWithSeconds(new Date()) => "2023/10/05 14:30:45"
   */
  export function formatDateTimeWithSeconds(date) {
    const d = new Date(date)
    const yyyy = d.getFullYear()
    const mm = (d.getMonth() + 1).toString().padStart(2, "0")
    const dd = d.getDate().toString().padStart(2, "0")
    const hh = d.getHours().toString().padStart(2, "0")
    const min = d.getMinutes().toString().padStart(2, "0")
    const ss = d.getSeconds().toString().padStart(2, "0")
    return yyyy === 1 ? "" : `${yyyy}/${mm}/${dd} ${hh}:${min}:${ss}`
  }

  /**
   * 將日期格式化為民國曆日期 (YYY/MM/DD)
   * @param {Date|string} date - 要格式化的日期
   * @returns {string} 格式化後的民國曆日期
   * @example formatROCDate(new Date()) => "112/10/05"
   */
  export function formatROCDate(date) {
    const d = new Date(date)
    const yyyy = d.getFullYear() - 1911
    const mm = (d.getMonth() + 1).toString().padStart(2, "0")
    const dd = d.getDate().toString().padStart(2, "0")
    return yyyy <= 1 ? "" : `${yyyy}/${mm}/${dd}`
  }

  /**
   * 將民國曆日期轉換為西元日期
   * @param {string} rocDate - 民國曆日期 (YYY/MM/DD)
   * @returns {string} 西元日期 (YYYY/MM/DD)
   * @example convertROCToGregorian("112/10/05") => "2023/10/05"
   */
  export function convertROCToGregorian(rocDate) {
    if (!rocDate) return ""
    const [y, m, d] = rocDate.split("/")
    const gregorianYear = parseInt(y) + 1911
    const date = new Date(`${gregorianYear}/${m}/${d}`)
    return this.formatDate(date)
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

