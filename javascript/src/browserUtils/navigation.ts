/**
 * 重新導向到站內路徑（path-only）
 * @param path - 站內路徑，例如 "/dashboard"
 * @param options - 額外選項
 * @param options.delay - 延遲毫秒數
 * @param options.newTab - 是否開啟新分頁（相對路徑會以完整 URL 開啟）
 * @param options.replace - 是否使用 replace 模式導向
 * @example
 * redirect("/default");
 * redirect("/dashboard", { delay: 1000, newTab: true, replace: false });
 */
export function redirect(
  path: string,
  options: { delay?: number; newTab?: boolean; replace?: boolean } = {}
): void {
  if (typeof path !== "string" || !path.startsWith("/")) {
    console.error("redirect: 請提供有效的站內路徑（需以 / 開頭）");
    return;
  }
  // default options
  const { delay = 0, newTab = false, replace = false } = options;

  const doRedirect = (): void => {
    const fullUrl: string = window.location.origin + path;
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
export function goBack(): void {
  window.history.back();
}
