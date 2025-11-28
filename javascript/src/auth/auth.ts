import type { ApiResponse, TokenResponse } from "../types/api";
import { getBaseUrl } from "../browserUtils";
import { emptyGuid } from "../baseFunction";

export class AppAuthorization {
  private appAccount: string;
  private appPassword: string;
  private baseUrl: string;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string | null) => void)[] = [];

  constructor(appAccount: string = "", appPassword: string = "") {
    if (!appAccount || !appPassword) {
      throw new Error("請設定 APP_ACCOUNT 和 APP_PASSWORD 環境變數");
    }
    this.appAccount = appAccount;
    this.appPassword = appPassword;
    this.baseUrl = getBaseUrl();
  }

  private async fetchToken(): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/TM_ApiMgr_App_CheckSsword?account=${encodeURIComponent(this.appAccount)}&ssword=${encodeURIComponent(this.appPassword)}`
      );
      const data: ApiResponse<TokenResponse> = await response.json();

      if (data?.errorMessage) {
        throw new Error(data.errorMessage);
      }
      if (!data.token) {
        throw new Error("無效的憑證!");
      }

      sessionStorage.setItem("apitoken", data.token || "");
      sessionStorage.setItem("apitokentimeout", data.tokenExpire || "");
      return data.token;
    } catch (error) {
      console.error("Failed to fetch token:", error);
      sessionStorage.removeItem("apitoken");
      sessionStorage.removeItem("apitokentimeout");
      return null;
    }
  }

  private subscribeToRefresh(subscriber: (token: string | null) => void) {
    this.refreshSubscribers.push(subscriber);
  }

  private onRefreshComplete(token: string | null) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
    this.isRefreshing = false;
  }

  private refreshToken(): Promise<string | null> {
    return new Promise((resolve) => {
      this.subscribeToRefresh(resolve);

      if (!this.isRefreshing) {
        this.isRefreshing = true;
        this.fetchToken().then((token) => {
          this.onRefreshComplete(token);
        });
      }
    });
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
      headers["Authorization"] = `Basic ${btoa(
        `${this.appAccount}:${apiToken}`
      )}`;
      return true;
    }

    const newApiToken = await this.refreshToken();

    if (newApiToken) {
      headers["Authorization"] = `Basic ${btoa(
        `${this.appAccount}:${newApiToken}`
      )}`;
      return true;
    }

    return false;
  }
}
