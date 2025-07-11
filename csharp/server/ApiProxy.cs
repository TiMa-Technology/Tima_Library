using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Newtonsoft.Json;

namespace TM.v2.TimaUtils
{
    /// <summary>
    /// 提供代理 HTTP API 請求到目標伺服器的工具方法，將請求的 headers, body 等完全複製編譯並轉送。
    /// - Web.Config 必須要設置 JumpApiURL 才能使用這個功能。
    /// - 這個類別包含了處理 API 跳轉的邏輯，包括壓縮請求和響應的支援。
    /// </summary>
    public static class UniversalApiProxy
    {
        /// <summary>
        /// HttpClient Instance，用於發送 HTTP 請求。
        /// </summary>
        private static readonly HttpClient httpClient = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(60) // 預設超時時間為 60 秒
        };

        /// <summary>
        /// 根據 config JumpApiURL 配置判斷是否應使用代理。
        /// </summary>
        /// <returns>如果 JumpApiURL 已配置且非空，則返回 true；否則返回 false。</returns>
        /// <example>
        /// <code>
        /// bool useProxy = ApiProxyUtils.ShouldUseProxy();
        /// Console.WriteLine(useProxy); // 如果 JumpApiURL 已設置，則輸出 true
        /// </code>
        /// </example>
        public static bool ShouldUseProxy()
        {
            // 檢查應用程式設定中是否配置了 JumpApiURL
            return !string.IsNullOrEmpty(System.Configuration.ConfigurationManager.AppSettings["JumpApiURL"]?.ToString().Trim());
        }

        /// <summary>
        /// 是否需要紀錄日誌。
        /// 這個屬性會檢查配置中的 "ShouldLog" 設定，並根據其值決定是否啟用日誌記錄。
        /// </summary>
        private static bool ShouldLog => System.Configuration.ConfigurationManager.AppSettings["ShouldLog"]?.ToString()?.Trim().Equals("Y", StringComparison.OrdinalIgnoreCase) ?? false;

        /// <summary>
        /// 從請求的路由資料或 URL 片段中提取控制器名稱。
        /// </summary>
        /// <param name="request">包含路由資料或 URL 資訊的 HTTP 請求訊息。</param>
        /// <returns>控制器名稱字符串，若無法確定則返回 null。</returns>
        /// <example>
        /// <code>
        /// var request = new HttpRequestMessage(HttpMethod.Get, "http://example.com/api/users/list");
        /// string controller = ApiProxyUtils.GetControllerName(request);
        /// Console.WriteLine(controller); // 輸出 "users"
        /// </code>
        /// </example>
        private static string GetControllerName(HttpRequestMessage request)
        {
            // 嘗試從路由資料中提取控制器名稱
            var routeData = request.GetRouteData();
            if (routeData != null && routeData.Values.ContainsKey("controller"))
            {
                return routeData.Values["controller"].ToString();
            }

            // 回退到解析 URL 片段
            var urlParts = request.RequestUri.Segments;
            if (urlParts.Length > 1)
            {
                // 檢查標準 API 路由模式：/api/[controller]/...
                for (int i = 0; i < urlParts.Length - 1; i++)
                {
                    if (urlParts[i].Trim('/').Equals("api", StringComparison.OrdinalIgnoreCase) && i + 1 < urlParts.Length)
                    {
                        return urlParts[i + 1].Trim('/');
                    }
                }

                // 使用第一個非空片段作為備用
                for (int i = 0; i < urlParts.Length; i++)
                {
                    var segment = urlParts[i].Trim('/');
                    if (!string.IsNullOrEmpty(segment))
                    {
                        return segment;
                    }
                }
            }

            // 若無法確定控制器名稱，則返回 null
            return null;
        }

        /// <summary>
        /// 將傳入的 HTTP 請求代理到目標 API 伺服器，轉發標頭和內容，並對指定標頭進行編碼/解碼以支持非 ASCII 字符（如中文）。
        /// </summary>
        /// <param name="incomingRequest">要代理的傳入 HTTP 請求。</param>
        /// <param name="requestUrl">可選的目標 URL，若未提供則使用配置中的 JumpApiURL。</param>
        /// <param name="headersToEncode">需要進行編碼/解碼的標頭清單，若為 null 則使用預設清單（EX. http 無法傳輸中文需進行編譯）。</param>
        /// <returns>包含代理回應的Task，結果為 HTTP response訊息。</returns>
        /// <exception cref="Exception">如果 JumpApiURL 未配置或代理過程中發生錯誤，則拋出異常。</exception>
        /// <example>
        /// <code>
        /// var request = new HttpRequestMessage(HttpMethod.Get, "http://localhost/api/users");
        /// var headersToEncode = new List&lt;string&gt; { "Upload-Name", "Custom-Header" };
        /// var response = await ApiProxyUtils.ProxyRequestAsync(request, headersToEncode: headersToEncode);
        /// Console.WriteLine(response.StatusCode); // 輸出回應狀態碼
        /// </code>
        /// </example>
        public static async Task<HttpResponseMessage> ProxyRequestAsync(HttpRequestMessage incomingRequest, string requestUrl = "", IEnumerable<string> headersToEncode = null)
        {
            #region 跳轉步驟
            // 1. 獲取應用程式路徑（例如 "/eLearning_v2_entrust"）
            // 2. 從傳入請求中提取相對路徑
            // 3. 構建目標 URL
            // 4. 使用相同 HTTP 方法一樣的請求
            // 5. 複製 Headers，排除 Host 和 Content-Length, 對指定標頭進行編碼
            // 6. 複製內容和內容標頭
            // 7. 處理特殊 HTTP 方法（如 HEAD 和 PATCH）
            // 8. 轉送請求到目標伺服器
            // 9. 獲取回應後並創建新的 HttpResponseMessage 來回給客戶端
            // 10. 複製回應的 Headers，必要時解碼
            // 11. 複製回應內容
            // 12. 返回最終的 HttpResponseMessage
            // 13. 處理異常情況，返回錯誤響應
            #endregion


            // 使用傳入的標頭清單或預設清單
            var headersToProcess = headersToEncode?.ToHashSet(StringComparer.OrdinalIgnoreCase) ?? HeadersToEncode;

            // 從配置或提供的 URL 確定目標基礎 URL
            string targetBaseUrl = string.IsNullOrEmpty(requestUrl)
                ? System.Configuration.ConfigurationManager.AppSettings["JumpApiURL"]?.ToString().Trim()
                : requestUrl;

            // 驗證目標 URL
            if (string.IsNullOrEmpty(targetBaseUrl))
            {
                if(ShouldLog)
                {
                    WriteLog("跳轉的API伺服器網址(JumpApiURL)未設定");
                }
                throw new Exception("跳轉的API伺服器網址(JumpApiURL)未設定");
            }

            try
            {
                // 獲取應用程式路徑（例如 "/eLearning_v2_entrust"）
                string appPath = HttpContext.Current?.Request.ApplicationPath ?? "/";
                if (!appPath.EndsWith("/"))
                {
                    appPath += "/";
                }

                // 從傳入請求中提取相對路徑
                string relativePath = incomingRequest.RequestUri.PathAndQuery;
                if (relativePath.StartsWith(appPath, StringComparison.OrdinalIgnoreCase))
                {
                    relativePath = relativePath.Substring(appPath.Length);
                }
                relativePath = relativePath.TrimStart('/');

                // 如果存在 "api/" 前綴，則移除
                if (relativePath.StartsWith("api/", StringComparison.OrdinalIgnoreCase))
                {
                    relativePath = relativePath.Substring(4);
                }

                // 構建目標 URL
                string targetUrl = targetBaseUrl + relativePath;

                if (ShouldLog)
                {
                    WriteLog($"跳轉的API伺服器目標網址: {targetUrl}");
                }

                // 使用相同方法創建代理請求
                var proxyRequest = new HttpRequestMessage(incomingRequest.Method, targetUrl);

                // 複製標頭，排除 Host 和 Content-Length
                string copyHeader = "";
                foreach (var header in incomingRequest.Headers)
                {
                    if (header.Key.Equals("Host", StringComparison.OrdinalIgnoreCase) ||
                        header.Key.Equals("Content-Length", StringComparison.OrdinalIgnoreCase))
                    {
                        continue;
                    }

                    // 對指定標頭進行編碼
                    if (headersToProcess.Contains(header.Key))
                    {
                        var encodedValues = EncodeHeaderValues(header.Value);
                        proxyRequest.Headers.TryAddWithoutValidation(header.Key, encodedValues);
                        copyHeader += $"{header.Key} = {string.Join(",", encodedValues)} (encoded)\n";
                    }
                    else
                    {
                        proxyRequest.Headers.TryAddWithoutValidation(header.Key, header.Value);
                        copyHeader += $"{header.Key} = {string.Join(",", header.Value)}\n";
                    }
                }

                // 複製內容和內容標頭
                if (incomingRequest.Content != null)
                {
                    var contentBytes = await incomingRequest.Content.ReadAsByteArrayAsync();
                    var content = new ByteArrayContent(contentBytes);

                    foreach (var header in incomingRequest.Content.Headers)
                    {
                        if (header.Key.Equals("Content-Length", StringComparison.OrdinalIgnoreCase))
                        {
                            continue;
                        }

                        // 對指定內容標頭進行編碼
                        if (headersToProcess.Contains(header.Key))
                        {
                            var encodedValues = EncodeHeaderValues(header.Value);
                            content.Headers.TryAddWithoutValidation(header.Key, encodedValues);
                        }
                        else
                        {
                            content.Headers.TryAddWithoutValidation(header.Key, header.Value);
                        }
                    }

                    proxyRequest.Content = content;
                }

                // 處理特殊 HTTP 方法
                if (incomingRequest.Method == HttpMethod.Head)
                {
                    proxyRequest.Headers.Add("X-Original-Method", "HEAD");
                }
                else if (incomingRequest.Method.Method == "PATCH")
                {
                    proxyRequest.Headers.Add("X-Original-Method", "PATCH");
                    if (!incomingRequest.Headers.Contains("X-HTTP-Method-Override"))
                    {
                        proxyRequest.Headers.Add("X-HTTP-Method-Override", "PATCH");
                    }
                }

                // 轉送代理請求到跳轉的API伺服器
                var response = await httpClient.SendAsync(proxyRequest, HttpCompletionOption.ResponseHeadersRead);

                if (ShouldLog)
                {
                    WriteLog($"跳轉的API伺服器回應: {response.StatusCode}");
                }

                // 創建回應訊息
                var responseMessage = new HttpResponseMessage(response.StatusCode);

                // 複製response headers，必要時解碼
                foreach (var header in response.Headers)
                {
                    if (headersToProcess.Contains(header.Key))
                    {
                        var decodedValues = DecodeHeaderValues(header.Value);
                        responseMessage.Headers.TryAddWithoutValidation(header.Key, decodedValues);
                    }
                    else
                    {
                        responseMessage.Headers.TryAddWithoutValidation(header.Key, header.Value);
                    }
                }

                // 複製回應內容
                if (response.Content != null)
                {
                    var originalContent = await response.Content.ReadAsByteArrayAsync();
                    var content = new ByteArrayContent(originalContent);

                    foreach (var header in response.Content.Headers)
                    {
                        if (headersToProcess.Contains(header.Key))
                        {
                            var decodedValues = DecodeHeaderValues(header.Value);
                            content.Headers.TryAddWithoutValidation(header.Key, decodedValues);
                        }
                        else
                        {
                            content.Headers.TryAddWithoutValidation(header.Key, header.Value);
                        }
                    }

                    responseMessage.Content = content;
                }

                return responseMessage;
            }
            catch (ObjectDisposedException ex)
            {
                // 處理物件已處置異常
                if (ShouldLog)
                {
                    WriteLog($"API跳轉失敗 - 物件已處置: {ex.Message}, {ex.StackTrace}");
                }
                return CreateErrorResponse(HttpStatusCode.InternalServerError, $"API跳轉失敗 - 物件已處置: {ex.Message}, {ex.StackTrace}");
            }
            catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException)
            {
                // 處理超時異常
                if (ShouldLog)
                {
                    WriteLog($"API跳轉失敗 - 超時: {ex.Message}, {ex.StackTrace}");
                }
                return CreateErrorResponse(HttpStatusCode.RequestTimeout, $"跳轉API超時: {ex.Message}");
            }
            catch (HttpRequestException ex)
            {
                // 處理 HTTP 相關錯誤
                if (ShouldLog)
                {
                    WriteLog($"API跳轉失敗 - HTTP請求錯誤: {ex.Message}, {ex.StackTrace}");
                }
                return CreateErrorResponse(HttpStatusCode.BadGateway, $"跳轉API錯誤: {ex.Message}, {ex.StackTrace}");
            }
            catch (Exception ex)
            {
                // 處理其他錯誤
                if (ShouldLog)
                {
                    WriteLog($"API跳轉失敗: {ex.Message}, {ex.StackTrace}");
                }
                return CreateErrorResponse(HttpStatusCode.InternalServerError, $"API跳轉失敗: {ex.Message}, {ex.StackTrace}");
            }
        }

        /// <summary>
        /// 創建錯誤響應訊息。
        /// </summary>
        /// <param name="statusCode">HTTP 狀態碼。</param>
        /// <param name="message">錯誤訊息內容。</param>
        /// <returns>包含錯誤訊息的 HTTP 響應訊息。</returns>
        private static HttpResponseMessage CreateErrorResponse(HttpStatusCode statusCode, string message)
        {
            return new HttpResponseMessage(statusCode)
            {
                Content = new StringContent(message)
            };
        }

        /// <summary>
        /// 因為還沒跳轉無法紀錄 DB，寫成 txt 檔案
        /// config 需要設置 LogPath 才能使用這個功能。
        /// </summary>
        /// <param name="values">要編碼的標頭值集合。</param>
        /// <returns>編碼後的標頭值集合。</returns>
        private void WriteLog(string message)
        {
            string fullMessage = $"{DateTime.Now:yyyy-MM-dd HH:mm:ss} {message}\r\n";
            string logPath = System.Configuration.ConfigurationManager.AppSettings["LogPath"]?.ToString().Trim();
            if (string.IsNullOrEmpty(logPath))
            {
                throw new Exception("LogPath 未設定，無法寫入日誌");
            }
            try
            {
                System.IO.File.AppendAllText(logPath, fullMessage);
            }
            catch (Exception ex)
            {
                // 如果寫檔失敗，存到資料庫
                _errorMessage = "log 寫檔案失敗: " + ex.Message;
            }
        }
    }
}
