/**
 * 進行頁面跳轉。
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

  const { delay = 0, newTab = false, replace = false } = options;

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
  window.history.back();
}
