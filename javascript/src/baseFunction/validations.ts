import { emptyGuid } from "./utils";
/**
 * 驗證 MAC 地址格式
 * @param {string} address - 要驗證的 MAC 地址
 * @returns {boolean} 如果是有效的 MAC 地址則返回 true
 * @example isValidMac("00:1A:2B:3C:4D:5E") => true
 * @example isValidMac("001A:2B:3C:4D:5E") => false
 */
export function isValidMac(address: string): boolean {
  const reg =
    /^[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}$/;
  return reg.test(address);
}

/**
 * 驗證 IPv4 地址格式
 * @param {string} address - 要驗證的 IPv4 地址
 * @returns {boolean} 如果是有效的 IPv4 地址則返回 true
 * @example isValidIPv4("192.168.0.1") => true
 * @example isValidIPv4("256.256.256.256") => false
 */
export function isValidIPv4(address: string): boolean {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
    address
  );
}

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
export function isNumberString(str: string): boolean {
  return /^[0-9]+$/.test(str);
}

/**
 * 驗證電子郵件地址
 * @param {string} email - 要驗證的電子郵件地址
 * @returns {boolean} 如果是有效的電子郵件則返回 true
 * @example isEmail("test@example.com") => true
 * @example isEmail("test@.com") => false
 */
export function isEmail(email: string): boolean {
  return /^([a-zA-Z0-9_.\-+])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(
    email
  );
}

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
export function isValidDate(dateString: string): boolean {
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
  return (
    !isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/** 檢查是否為空的 GUID
 * @param {string} id - 要檢查的 GUID
 * @returns {boolean} 如果是空的 GUID 則返回 true
 * @example isEmptyGuid("00000000-0000-0000-0000-000000000000") => true
 * @example isEmptyGuid("123e4567-e89b-12d3-a456-426614174000") => false
 */
export function isEmptyGuid(id: string): boolean {
  const emptyId = emptyGuid();
  return id === emptyId || !id.length;
}
