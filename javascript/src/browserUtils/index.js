/**
 * 重新導向到站內路徑（path-only）
 * @param {string} path - 站內路徑，例如 "/dashboard"
 * @param {Object} options - 額外選項
 * @param {number} [options.delay=0] - 延遲毫秒數
 * @param {boolean} [options.newTab=false] - 是否開啟新分頁（相對路徑會以完整 URL 開啟）
 * @param {boolean} [options.replace=false] - 是否使用 replace 模式導向
 * @example
 * redirect("/default");
 * redirect("/dashboard", { delay: 1000, newTab: true, replace: false });
 */
export function redirect(path, options = {}) {
  if (typeof path !== "string" || !path.startsWith("/")) {
    console.error("redirect: 請提供有效的站內路徑（需以 / 開頭）");
    return;
  }
  // default options
  const { delay = 0, newTab = false, replace = false } = options;

  const doRedirect = () => {
    const fullUrl = window.location.origin + path;
    if (newTab) {
      window.open(fullUrl, "_blank");
    } else if (replace) {
      window.location.replace(path);
    } else {
      window.location.href = path;
    }
  };

  if (delay > 0) {
    window.setTimeout(doRedirect, delay);
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
