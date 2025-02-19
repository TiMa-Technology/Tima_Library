import { newGuid } from "../BaseFunction/utils"

/**
 * 進行頁面跳轉。
 * @param {string} url - 目標網址。
 * @example
 * redirect("https://www.google.com");
 */
export function redirect(url) {
  window.location = url
}

/**
 * 返回上一頁。
 * @example
 * goBack();
 */
export function goBack() {
  window.history.back()
}

/**
 * 獲取 URL 參數 QueryString 的 key
 * @param {string} param - 參數名稱
 * @returns {string} 參數值
 * @example 
 * // https://www.google.com?key=value
 * getQueryString("key") // value 
 */
export function getQueryString(param) {
  const results = new RegExp("[?&]" + param + "=([^&#]*)").exec(
    window.location.href
  )
  return results ? decodeURI(results[1]) : ""
}


/**
 * 如果 queryString 的 `type=add`，則返回新的 `GUID`，否則返回空的 `GUID`。
 * * 需要 baseFunction/utils.js 中的 `newGuid`。
 * @param {string} param - 參數名稱。
 * @returns {string} 取得的 `GUID`。
 * @example
 * // https://www.google.com?type=add
 * getEditPageGuid("id") // "00000000-0000-0000-0000-000000000000"
 * @example
 * // https://www.google.com?type=edit&id=123
 * getEditPageGuid("id") // "123"
 */
export function getEditPageGuid(param) {
  const queryType = getQueryString("type")
  let paramValue = ""
  if (queryType === "add") {
    paramValue = newGuid()
  } else if (queryType === "edit") {
    paramValue = getQueryString(param)
  }
  return paramValue
}

/**
 * API 取得 `typeMgdTitle` 的名稱。
 * - 需要底層 `TM_MessageCode`。
 * @param {string} apiUrl - API 網址，可以填入相對路徑 ".."。
 * @param {string} mgdNo - 代碼編號。
 * @returns {Promise<string>} 取得的標題。
 */
export async function getTypeMgdTitle(apiUrl, mgdNo) {
  try {
    const response = await fetch(
      `${apiUrl}/api/TM_MessageCode_MessageCode_GetOne?${new URLSearchParams({
        mgdNo,
      })}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      }
    )
    const { Title, ErrorMessage } = await response.json()

    if (ErrorMessage) throw new Error(ErrorMessage)
    return Title
  } catch (error) {
    console.error("Error fetching typeMgdTitle:", error)
  }
}

/**
 * API 取得系統參數值。
 * - 需要底層 `TM_Sys_Param`。
 * @param {string} apiUrl - API 網址，可以填入相對路徑 ".."。
 * @param {string} paramNumber - 參數編號。
 * @returns {Promise<string>} 取得的參數值。
 */
export async function getSysParamValue(apiUrl, paramNumber) {
  try {
    const response = await fetch(
      `${apiUrl}/api/TM_Sys_Param_GetOne?${new URLSearchParams({
        paramNumber,
      })}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      }
    )
    const { Value, ErrorMessage } = await response.json()

    if (ErrorMessage) throw new Error(ErrorMessage)
    return Value
  } catch (error) {
    console.error("Error fetching TM_Sys_Param:", error)
  }
}
