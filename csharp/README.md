# Tima C# 工具庫

本文件介紹 Tima 專案的 C# 工具庫，提供一系列後端工具函數，涵蓋資料處理、格式化、驗證等功能。本 README 詳細說明如何使用本庫、設置開發環境、貢獻程式碼以及撰寫文件的規範。

## 目錄快速導覽

- [簡介](#簡介)
- [前置需求](#前置需求)
- [設置開發環境](#設置開發環境)
- [使用方式](#使用方式)
- [貢獻程式碼](#貢獻程式碼)
- [撰寫文件](#撰寫文件)
  - [通用原則](#通用原則)
  - [文件位置](#文件位置)
  - [如何撰寫文件](#如何撰寫文件)
  - [文件工具](#文件工具)
- [測試 (Optional)](#測試-optional)
- [常見問題](#常見問題)
- [尋求幫助](#尋求幫助)

## 簡介

Tima C# 工具庫是一組模組化的工具函數，適用於 `.NET` 後端開發，支援 .NET 4.8+ 環境。函數以靜態類或擴展方法形式提供，無外部框架依賴，可直接用於任何 C# 專案。

### 專案結構
```
Tima_Library/
├── csharp/
│   ├── server/
│   │   ├── apiProxy.cs       # 伺服器端請求跳轉
│   ├── officeUtils/          # 處理 OFFICE 文件的工具函數
│   │   ├── excel.cs          # EXCEL 相關
│   ├── templates/          # 套用的模板，例如附件插入api
│   └── ...
```
> **注意**：所有工具函數集中在 `TM.v2` 命名空間下，按功能分為不同類檔案，方便維護和引用。

## 前置需求

- **.NET SDK**：建議使用最新 LTS 版本。
- **開發環境**：
  - Visual Studio 2022（建議 Community 或更高版本）。
  - 或 VS Code（搭配 C# 擴充功能）。
- **專案配置**：
  - 支援 .NET 4.8+ 的專案。
  - 可選：若使用 Nullable 參考型別，需在 `.csproj` 中啟用：
    ```xml
    <PropertyGroup>
      <Nullable>enable</Nullable>
    </PropertyGroup>
    ```

## 設置開發環境

1. **安裝 .NET SDK**：
   - 從 [.NET 官方網站](https://dotnet.microsoft.com/download) 下載並安裝 .NET SDK（建議 6.0 或 8.0）。
   - 檢查版本：`dotnet --version`。

2. **Fork Repo**：
   ```bash
   git clone https://github.com/your-org/Tima_Library.git
   cd Tima_Library/csharp
   ```

3. **建構專案**：
   ```bash
   dotnet build server/server.csproj
   ```

4. **複製檔案（替代方式）**：
   - 從儲存庫下載或複製所需檔案（例如 `apiProxy.cs`）。
   - 放置到專案目錄（例如 `Utils/`）。
   - **注意**：若函數有依賴關係，需一併複製相關檔案。

5. **開發工具**：
   - 建議使用 Visual Studio 2022，啟用程式碼格式化（`dotnet format`）和 XML 註釋檢查。
   - 或使用 VS Code，安裝 C# 擴充功能和 `markdownlint`（`npm install -g markdownlint-cli`）。
   - 安裝 DocFX（若需生成文件）：`dotnet tool install -g docfx`。

## 使用方式

本庫以 NuGet 套件或原始碼形式提供，支援靜態方法和擴展方法。以下為詳細說明和範例：

### 安裝方式
1. ~~**透過 NuGet 安裝**（若已發布）：~~
   ```bash
   dotnet add package server --version 1.0.0
   ```

2. **複製原始碼**：
   - 將 `server/` 資料夾複製到專案中。
   - 在 `.csproj` 中添加引用：
     ```xml
     <ItemGroup>
       <Compile Include="server/*.cs" />
     </ItemGroup>
     ```

### 引用方式
所有工具函數位於 `TM.v2` 命名空間，按功能分為不同靜態類。

1. **引用命名空間**：
   ```csharp
   using TM.v2;
   ```

2. **範例**：
   - 判斷是否要把請求跳轉：
     ```csharp
     using TM.v2;

      bool isProxyMode = UniversalApiProxy.ShouldUseProxy();

      if (isProxyMode)
      {
         var proxyResponse = await UniversalApiProxy.ProxyRequestAsync(Request);
         return ResponseMessage(proxyResponse);
      }
     ```

3. **擴展方法範例**：
   - 驗證電子郵件格式：
     ```csharp
     using TM.v2;

     string email = "test@example.com";
     bool isValid = email.IsValidEmail(); // 返回 true
     Console.WriteLine(isValid);
     ```

### 注意事項
- 每個公開方法的 XML 註釋詳細說明參數、返回值和邊界情況，請在 IDE 中查看（例如將游標停在方法上）。
- 本庫支援 Nullable 參考型別，建議在專案中啟用 `<Nullable>enable</Nullable>` 以提高型別安全性。


## 貢獻程式碼

1. **Fork 儲存庫**：
   ```bash
   git fork https://github.com/your-org/Tima_Library.git
   ```

2. **創建分支**：
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **程式碼規範**：
   - 使用現代 C# 語法（例如記錄型別、Nullable 參考型別）。
   - 遵循 Microsoft C# 編碼規範，執行 `dotnet format` 檢查程式碼風格。
   - 為每個公開方法撰寫 XML 註釋（見 [撰寫文件](#撰寫文件)）。

4. **提交訊息**：
   - 遵循 [Commits 規範](https://github.com/TiMa-Technology/tiMa-Docs/blob/main/Git/commit_message.md)，例如：
     ```bash
     git commit -m "feat: 新增 FormatROCDate 方法"
     ```

5. **測試 (Optional)**：
   - 若撰寫單元測試，使用 xUnit 或 NUnit，測試檔案存放在 `TimaUtils.Tests/`。
   - 執行測試：`dotnet test`。
   - 範例：
     ```csharp
     using TimaUtils;
     using Xunit;

     public class NumberUtilsTests
     {
         [Fact]
         public void FormatNumber_AddsThousandSeparators()
         {
             var result = NumberUtils.FormatNumber(1234567.89);
             Assert.Equal("1,234,567.89", result);
         }
     }
     ```

6. **提交變更**：
   - 推送分支：
     ```bash
     git push origin feature/your-feature-name
     ```
   - 在 GitHub 上創建拉取請求（PR），詳細描述變更內容。
   - 至少請求一名團隊成員進行程式碼審查。

7. **PR 指南**：
   - 每個新方法需包含完整 XML 註釋。
   - 描述方法用途、使用場景和範例。
   - 提交前本地測試變更，確保無錯誤。

## 撰寫文件

文件是確保本庫易用性和可維護性的核心，請嚴格遵循以下指南。

### 通用原則
- **清晰**：使用簡單、易懂的語言，避免過多技術術語。
- **一致性**：保持語氣、結構和格式統一。
- **完整性**：記錄所有公開方法，包括參數、返回值、邊界情況和範例。
- **易用性**：確保文件易於導航，範例可直接複製運行。

### 文件位置
- **本 README**：提供庫的設置、使用、貢獻和文件指南。
- **程式碼內 XML 註釋**：每個公開方法必須包含 XML 註釋，標註參數、返回值和範例。
- **額外文件**：如有進階說明，存放在 `csharp/docs/`。

### 如何撰寫文件
1. **更新本 README**：
   - **結構**：
     - 簡介：概述庫用途和功能。
     - 前置需求：環境和配置要求。
     - 設置：詳細環境設置步驟。
     - 使用：提供可運行範例。
     - 效能考量：優化建議。
     - 貢獻：程式碼和測試提交流程。
     - 測試：測試流程（若適用）。
     - 發布：版本更新流程。
     - 常見問題：解答常見疑惑。
   - **格式**：
     - 使用 Markdown，標題層次清晰（`#`、`##` 等）。
     - 程式碼片段使用 ```csharp 包圍。
   - **範例**：
     - 每個功能提供至少一個可複製執行的程式碼片段。
     - 範例應簡短、聚焦，避免複雜邏輯。

2. **撰寫 XML 註釋**：
   - 每個公開方法必須包含 XML 註釋，格式如下：
     ```csharp
      /// <summary>
      /// 全通用API跳轉
      /// </summary>
      /// <param name="incomingRequest">目前的Request</param>
      /// <param name="requestUrl">指定跳轉的 URL，不設定就是預設 JumpApiURL</param>
      /// <returns>轉送後的HttpResponseMessage</returns>
      /// <example>
      /// 以下範例展示如何使用 ProxyRequestAsync 方法：
      /// <code>
      /// using TM.v2.apiProxy;
      /// 
      /// if (UniversalApiProxy.ShouldUseProxy())
      /// {
      ///   var proxyResponse = await UniversalApiProxy.ProxyRequestAsync(Request);
      ///   return ResponseMessage(proxyResponse);
      /// }
      /// </code>
      /// </example>
      public static async Task<HttpResponseMessage> ProxyRequestAsync(HttpRequestMessage incomingRequest, string requestUrl = "")
      {
         string targetBaseUrl = requestUrl == string.Empty ? System.Configuration.ConfigurationManager.AppSettings["JumpApiURL"]?.ToString().Trim() : requestUrl;
         bool shouldLog = System.Configuration.ConfigurationManager.AppSettings["ShouldLog"].ToString() == "Y";
         if (string.IsNullOrEmpty(targetBaseUrl))
         {
            throw new Exception("跳轉的AP伺服器網址(JumpApiURL)未設定");
         }

         try
         {
            // 正確取得ApplicationPath
            string appPath = HttpContext.Current.Request.ApplicationPath; // 例如 "/eLearning_v2_entrust"

            if (!appPath.EndsWith("/"))
         }
         ....
      }
     ```
   - 必須包含 `<summary>`、`<param>`、`<returns>` 和 `<example>` 標籤。
   - 使用 `<code>` 標籤包裝範例程式碼。

3. **審查文件**：
   - 每份 PR 必須包含相關文件更新。
   - 確保所有公開方法有 XML 註釋。
   - 請審查者檢查文件的清晰度、正確性和完整性。
   - 確認範例程式碼可運行無誤。

### 文件工具
- **Markdown 編輯器**：VS Code/ VS 2022（安裝 Markdown Preview 擴充功能）或 Typora。
- **DocFX**：生成文件，安裝：`dotnet tool install -g docfx`。
- **檢查工具**：
  - `markdownlint`：檢查 Markdown 格式，安裝：`npm install -g markdownlint-cli`。
  - `dotnet format`：檢查程式碼風格，執行：`dotnet format`。

## 測試 (Optional)

雖然目前未強制要求單元測試，但鼓勵撰寫測試以提高程式碼可靠性：
- 使用 xUnit 或 NUnit，測試檔案存放在 `server.Tests/`。
- 執行測試：`dotnet test`。
- 測試範例參見[貢獻程式碼](#貢獻程式碼)。


## 常見問題

**Q：如何處理 Nullable 參考型別？**  
A：建議啟用 `<Nullable>enable</Nullable>`，本庫已全面支援 Nullable 型別。

**Q：如何回報問題？**  
A：在 GitHub 開立 Issue，包含：  
- 問題描述  
- 重現步驟  
- 預期行為  
- 實際行為  
- 環境資訊（.NET 版本、OS 等）

## 尋求幫助

- 查閱本 README 或 `csharp/docs/`。
- 聯繫相關人員（透過內部通訊工具）。
- 在倉庫中開啟 Issue 描述問題或建議。

感謝你為 Tima C# 工具庫的貢獻！你的努力將提升專案品質。