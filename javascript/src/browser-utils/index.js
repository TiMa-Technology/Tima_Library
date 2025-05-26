import { newGuid } from "../../baseFunction/utils"

/**
 * 進行頁面跳轉。
 * 
 * @param {string} url - 目標網址。
 * @param {Object} [options] - 跳轉選項。
 * @param {number} [options.delay=0] - 延遲跳轉的毫秒數。
 * @param {boolean} [options.newTab=false] - 是否在新視窗開啟。
 * @param {boolean} [options.replace=false] - 是否使用 location.replace()，不保留瀏覽紀錄。
 * @example
 * redirect("https://www.google.com");
 * redirect("https://www.google.com", { delay: 1000 });
 * redirect("https://www.google.com", { newTab: true });
 * redirect("/login", { replace: true });
 */
export function redirect(url, options = {}) {
  if (typeof url !== "string" || url.trim() === "") {
    console.error("redirect: 無效的 URL。");
    return;
  }

  const {
    delay = 0,
    newTab = false,
    replace = false,
  } = options;

  const doRedirect = () => {
    if (newTab) {
      window.open(url, "_blank");
    } else if (replace) {
      window.location.replace(url);
    } else {
      window.location.href = url;
    }
  };

  if (delay > 0) {
    setTimeout(doRedirect, delay);
  } else {
    doRedirect();
  }
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
 * @param {string} key - 參數名稱
 * @returns {string} 參數值
 * @example
 * // https://www.google.com?key=value
 * getQueryParam("key") // value
 */
export function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key)
}

/**
 * 移除 URL 中的指定參數。
 * @param {string} url - 目標網址。
 * @param {string} name - 要移除的參數名稱。
 * @returns {string} 移除參數後的網址。
 * @example
 * // https://www.google.com?key=value&name=test
 * removeUrlParam("https://www.google.com?key=value&name=test", "name") // "https://www.google.com?key=value"
 */
export function removeUrlParam(url, name) {
  const [base, queryString] = url.split("?")
  if (!queryString) return url

  const params = new URLSearchParams(queryString)
  params.delete(name)

  const newQuery = params.toString()
  return newQuery ? `${base}?${newQuery}` : base
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

