import type { ApiResponse, TokenResponse } from "types/api";
import { emptyGuid } from "../baseFunction";

export class AppAuthorization {
  private tokenPromise: Promise<ApiResponse<TokenResponse>> | null = null;

  constructor(
    private appAccount: string = "",
    private appPassword: string = ""
  ) {
    if (!appAccount || !appPassword) {
      throw new Error("請設定 APP_ACCOUNT 和 APP_PASSWORD 環境變數");
    }
  }

  async getToken(): Promise<ApiResponse<TokenResponse>> {
    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    this.tokenPromise = fetch(
      `${window.location.origin}/api/TM_ApiMgr_App_CheckSsword?account=${this.appAccount}&ssword=${this.appPassword}`
    )
      .then((res) => res.json())
      .finally(() => {
        this.tokenPromise = null;
      });

    const data = await this.tokenPromise;

    if (data?.errorMessage) {
      throw new Error(data?.errorMessage);
    }

    if (!data.token) {
      throw new Error("無效的憑證!");
    }

    sessionStorage.setItem("apitoken", data?.token || "");
    sessionStorage.setItem("apitokentimeout", data?.tokenExpire || "");
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
    if (token?.token && token?.tokenExpire) {
      headers["Authorization"] =
        "Basic " + btoa(`${this.appAccount}:${token.token}`);
      return true;
    }

    sessionStorage.removeItem("apitoken");
    sessionStorage.removeItem("apitokentimeout");
    return false;
  }
}
