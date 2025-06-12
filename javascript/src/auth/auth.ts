import { emptyGuid } from "../baseFunction";
import { ajaxApi } from "../browserUtils";

export interface ApiResponse<T = any> {
  ErrorMessage?: string;
  ItemList?: T[];
  [key: string]: any;
}
export interface TokenResponse extends ApiResponse {
  ErrorMessage?: string;
  Token?: string;
  TokenExpire?: string;
  ItemList?: Array<{ IsInside: string }>;
}

export class AppAuthorization {
  private tokenPromise: Promise<TokenResponse | null> | null = null;

  constructor(
    private appAccount: string = "",
    private appPassword: string = ""
  ) {
    if (!appAccount || !appPassword) {
      throw new Error("請設定 APP_ACCOUNT 和 APP_PASSWORD 環境變數");
    }
  }

  async getToken(): Promise<TokenResponse | null> {
    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    this.tokenPromise = ajaxApi({
      method: "GET",
      endpoint: "TM_ApiMgr_App_CheckSsword",
      requestBody: { account: this.appAccount, ssword: this.appPassword },
    }).finally(() => {
      this.tokenPromise = null;
    });

    const data = await this.tokenPromise;

    if (data?.ErrorMessage) {
      throw new Error(data?.ErrorMessage);
    }

    sessionStorage.setItem("apitoken", data?.Token || "");
    sessionStorage.setItem("apitokentimeout", data?.TokenExpire || "");
    return data;
  }

  async prepareAuthHeader(
    headers: Record<string, string>,
    url: string
  ): Promise<boolean> {
    const excludedEndpoints = [
      "api/TM_ApiMgr_App_CheckSsword",
      "api/TM_ApiMgr_App_GetOne",
      "api/TM_ApiMgr_App_Insert",
    ];

    if (excludedEndpoints.some((endpoint) => url.includes(endpoint))) {
      return false;
    }

    const apiToken = sessionStorage.getItem("apitoken");
    const apiTokenTimeout = sessionStorage.getItem("apitokentimeout");

    if (
      apiToken &&
      apiToken !== emptyGuid() &&
      apiTokenTimeout &&
      new Date() < new Date(apiTokenTimeout)
    ) {
      headers["Authorization"] =
        "Basic " + btoa(`${this.appAccount}:${apiToken}`);
      return true;
    }

    const token = await this.getToken().catch(() => {
      sessionStorage.removeItem("apitoken");
      sessionStorage.removeItem("apitokentimeout");
    });
    if (token?.Token && token?.TokenExpire) {
      headers["Authorization"] =
        "Basic " + btoa(`${this.appAccount}:${token.Token}`);
      return true;
    }

    sessionStorage.removeItem("apitoken");
    sessionStorage.removeItem("apitokentimeout");
    return false;
  }
}
