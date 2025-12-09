/**
 * 重新導向到指定的路徑或網址
 * 支援完整網址、相對路徑，並自動處理 IIS 虛擬目錄環境
 *
 * @param path - 目標路徑或完整網址
 * @param options - 導向選項
 * @param options.delay - 延遲時間（毫秒），預設為 0
 * @param options.newTab - 是否在新分頁開啟，預設為 false
 * @param options.replace - 是否替換當前頁面歷史記錄，預設為 false
 *
 * @example
 * 站內相對路徑
 * redirect("/users/profile");
 *
 * @example
 * 完整外部網址
 * redirect("https://external-site.com");
 *
 * @example
 * 新分頁開啟
 * redirect("/api/data", { newTab: true });
 *
 * @example
 * 延遲導向
 * redirect("/dashboard", { delay: 1000 });
 *
 * @example
 * 相對於當前目錄的路徑
 * redirect("profile.html");
 *
 * @example
 * 替換當前頁面歷史記錄
 * redirect("/login", { replace: true });
 *
 * @example
 * 組合使用選項
 * redirect("https://docs.example.com", { delay: 500, newTab: true });
 */
export function redirect(
  path: string,
  options: { delay?: number; newTab?: boolean; replace?: boolean } = {}
): void {
  if (typeof path !== "string" || path.trim() === "") {
    console.error("redirect: 請提供有效的路徑或網址");
    return;
  }

  // default options
  const { delay = 0, newTab = false, replace = false } = options;

  const doRedirect = (): void => {
    let targetUrl: string;

    // 判斷是否為完整網址（包含協議）
    if (path.startsWith("http://") || path.startsWith("https://")) {
      targetUrl = path;
    } else if (path.startsWith("/")) {
      // 相對路徑處理
      targetUrl = getBaseUrl() + path;
    } else {
      // 不是以 / 開頭的相對路徑，加上當前目錄
      const currentPath = getBaseUrl();
      targetUrl = `${currentPath}/${path}`;
    }

    if (newTab) {
      window.open(targetUrl, "_blank");
    } else if (replace) {
      window.location.replace(targetUrl);
    } else {
      window.location.href = targetUrl;
    }
  };

  if (delay > 0) {
    window.setTimeout(doRedirect, delay);
  } else {
    doRedirect();
  }
}

/**
 * 取得基礎 URL，自動處理 IIS 虛擬目錄情況
 *
 * @returns 基礎 URL 字串
 *
 * @example
 * 開發環境
 * 當前 URL: http://localhost:3000/some/path
 * 回傳: "http://localhost:3000"
 *
 * @example
 * 生產環境（IIS 虛擬目錄）
 * 當前 URL: https://example.com.tw/project1/users/profile
 * 回傳: "https://example.com.tw/project1"
 */
export function getBaseUrl(): string {
  const { protocol, host, pathname } = window.location;

  // 開發環境判斷（localhost 或 127.0.0.1）
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return `${protocol}//${host}`;
  }

  // 生產環境 - 處理 IIS 虛擬目錄
  // 假設虛擬目錄是第一個路徑段
  const pathSegments = pathname
    .split("/")
    .filter((segment) => segment.length > 0);

  if (pathSegments.length > 0) {
    // 取第一個路徑段作為虛擬目錄
    const virtualDir = pathSegments[0];
    return `${protocol}//${host}/${virtualDir}`;
  }

  return `${protocol}//${host}`;
}

/**
 * 取得當前 URL 中相對於虛擬目錄的路徑（不含虛擬目錄與查詢參數）
 *
 * @returns 相對路徑（不含 domain 與虛擬目錄）
 *
 * @example
 * // 開發環境
 * URL: http://localhost:3000/test/page?a=1
 * 回傳: "/test/page"
 *
 * @example
 * // 生產環境（IIS 虛擬目錄）
 * URL: https://example.com/project1/page/edit?id=10
 * 回傳: "/page/edit"
 */
export function getPath(): string {
  const { host, pathname } = window.location;

  // 移除前導斜線並拆分路徑
  const segments = pathname.replace(/^\//, "").split("/");

  // 若為開發環境（localhost）不移除虛擬目錄
  const isDev = host.includes("localhost") || host.includes("127.0.0.1");

  const relevant = isDev ? segments : segments.slice(1);

  return "/" + relevant.join("/");
}

/**
 * 取得當前頁面的名稱（即最後一段 path，不含參數與虛擬目錄）
 *
 * @returns 頁面名稱字串（例如 "edit", "list"）
 *
 * @example
 * // 開發環境
 * URL: http://localhost:3000/user/list?id=5
 * 回傳: "list"
 *
 * @example
 * // 生產環境
 * URL: https://abc.com/project1/page/edit
 * 回傳: "edit"
 */
export function getPageName(): string {
  const { host, pathname } = window.location;

  const segments = pathname.replace(/^\//, "").split("/");

  const isDev = host.includes("localhost") || host.includes("127.0.0.1");

  // 若非開發模式，跳過虛擬目錄第一段
  const relevant = isDev ? segments : segments.slice(1);

  return relevant[relevant.length - 1] || "";
}

/**
 * 返回上一頁。
 * @example
 * goBack();
 */
export function goBack(): void {
  window.history.back();
}

/**
 * 獲取 URL 參數 QueryString 的 key
 * @param {string=} key - 參數名稱
 * @returns {string|null|Record<string, string>} 參數值
 * @example
 * // https://www.google.com?key=value
 * getQueryParam("key") // value
 *
 * @example
 * // https://www.google.com?key=value&name=test
 * getQueryParam() // { key: "value", name: "test" }
 */
export function getQueryParam(
  key?: string
): string | Record<string, string> | null {
  const params = new URLSearchParams(window.location.search);

  if (key) {
    return params.get(key);
  }

  const all: Record<string, string> = {};
  params.forEach((value, k) => {
    all[k] = value;
  });

  return all;
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
export function removeUrlParam(url: string, name: string): string {
  const [base, queryString] = url.split("?");
  if (!queryString) return url;

  const params = new URLSearchParams(queryString);
  params.delete(name);

  const newQuery = params.toString();
  return newQuery ? `${base}?${newQuery}` : base;
}
