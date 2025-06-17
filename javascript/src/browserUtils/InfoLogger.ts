import { handleApiError } from "../baseFunction";
import { ajaxApi, type ApiStateManager } from "./ajax";

interface LogOptions {
  bMemNo: string | null;
  type: string;
  message: string;
  message2?: string;
  message3?: string;
  url?: string;
}

/**
 * 記錄平台操作資訊的工具
 */
export class InfoLogger {
  private apiStateManager: ApiStateManager; // 儲存 ApiStateManager 實例

  /**
   * 構造函數，接受 ApiStateManager 實例
   * @param apiStateManager - 已初始化的 ApiStateManager 實例
   */
  constructor(apiStateManager: ApiStateManager) {
    this.apiStateManager = apiStateManager;
  }
  /**
   * 取得使用者平台名稱（手機、電腦、iOS 等）
   * @returns {string} 平台名稱
   */
  static getPlatform(): string {
    const ua = navigator.userAgent;
    const navAny = navigator as Navigator & {
      userAgentData?: { platform?: string };
    };
    if (navAny.userAgentData?.platform) return navAny.userAgentData.platform;
    if (/iPhone/i.test(ua)) return "iPhone";
    if (/iPad/i.test(ua)) return "iPad";
    if (/Android/i.test(ua)) return "Android";
    if (/Windows/i.test(ua)) return "Windows";
    if (/Macintosh/i.test(ua)) return "Mac";
    return "PC";
  }

  /**
   * 記錄一筆 Info Log 到伺服器
   * @param options - Log 參數
   * @returns {Promise<void>}
   */
  async log({
    bMemNo,
    type,
    message,
    message2 = "",
    message3 = "",
    url = window.location.href,
  }: LogOptions): Promise<void> {
    try {
      await ajaxApi(this.apiStateManager, {
        method: "GET",
        endpoint: "My_Log_Info",
        requestBody: {
          bmemno: bMemNo,
          type,
          message,
          message2,
          message3,
          url,
          platform: InfoLogger.getPlatform(),
        },
      });
    } catch (err) {
      const { message } = handleApiError(err);
      console.error("紀錄 Info log 錯誤: ", message);
    }
  }
}
