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
export function formatNumber(
  num: number,
  decimalPlaces = 2,
  decimalSep = ".",
  thousandSep = ","
): string {
  if (!Number.isFinite(num)) return "";

  const n = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  const rounded = n.toFixed(Math.max(decimalPlaces, 0));
  const [whole, decimals] = rounded.split(".");

  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep);
  return (
    sign + formattedWhole + (decimalPlaces > 0 ? decimalSep + decimals : "")
  );
}

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
export function padDecimals(num: number, count: number): string {
  if (!Number.isFinite(num) || count < 0) return "";
  const factor = Math.pow(10, count);
  const rounded = Math.round(num * factor) / factor;
  const [intPart, decPart = ""] = rounded.toString().split(".");
  const paddedDecimals = decPart.padEnd(count, "0");
  return `${intPart}.${paddedDecimals}`;
}

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
export function removeThousands(str: string, sep = ","): string {
  return str.split(sep).join("");
}

/**
 * 將數字或字串添加千位分隔符。
 *
 * @param num 要格式化的數字或字串。
 * @returns 添加千位分隔符後的字串。如果輸入不是數字，則回傳原始字串。
 *
 * @example
 * addCommas(1234567.89) // "1,234,567.89"
 */
export function addCommas(num: string | number): string {
  if (isNaN(Number(num))) return String(num);
  const [intPart, decPart = ""] = String(num).split(".");
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart ? `${formatted}.${decPart}` : formatted;
}

/**
 * 產生介於指定最小值與最大值（含）之間的隨機整數。
 *
 * @param min 最小整數值（包含）。
 * @param max 最大整數值（包含）。
 * @returns 一個介於 min 和 max 之間的隨機整數。
 * @example
 * getRandowmNumber(1, 10) // 可能回傳 1~10 之間的任一整數
 */
export function getRandowmNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
