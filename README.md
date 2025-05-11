# Tima Library 🧰

本倉庫是公司庫專案的核心工具庫，目前包含 `JavaScript` 和 `C#` 兩種語言的工具庫。專案結構設計旨在支持模組化開發、清晰的文件撰寫以及簡化的維護流程。

## 快速導覽 🛠️

- [如何維護專案](#如何維護專案)
  - [設置開發環境](#設置開發環境)
  - [貢獻程式碼](#貢獻程式碼)
  - [提交變更](#提交變更)
  - [發布更新](#發布更新)
- [**撰寫文件**](#撰寫文件)
  - [通用原則](#通用原則)
  - [文件位置](#文件位置)
  - [如何撰寫文件](#如何撰寫文件)
  - [文件工具](#文件工具)
- [尋求幫助](#尋求幫助)

> 每個目錄都有自己的 `README`，用於說明特定的詳細資訊：


## 如何維護專案

維護本專案包括更新程式碼、撰寫測試和確保文件完整。以下是建議步驟：

### 設置開發環境
- JavaScript：參考 `javascript/README.md` 中的 Node.js 設置、依賴安裝和建構說明。
- C#：參考 `csharp/README.md` 中的 .NET SDK 設置、依賴安裝和建構說明。
- 確保已安裝必要工具。

### 貢獻程式碼
- 為新功能或錯誤修復創建新分支：`git checkout -b feature/your-feature-name`。
- 遵循各語言 `README` 中指定的程式碼規範。
- 為新功能或錯誤修復撰寫單元測試 (optional)。
- 在本地運行測試以確保無回歸：(optional)
  - JavaScript：使用 `npm test`（詳見 `javascript/README.md`）。
  - C#：使用 `dotnet test`（詳見 `csharp/README.md`）。
- 使用清晰、簡潔的提交訊息，遵循 [Commits 規範](https://github.com/TiMa-Technology/tiMa-Docs/blob/main/Git/commit_message.md) 格式，例如 `feat: 新增工具函數`。

### 提交變更
- 將分支推送到倉庫：`git push origin feature/your-feature-name`。
- **創建拉取請求（PR），並詳細描述你的變更。**
- ~~確保 PR 通過所有 CI 檢查（例如程式碼檢查、測試）。~~
- **至少請求一名團隊成員進行審查(code review)。**

### 發布更新
- 審查通過後，將 PR 合併到 `main` 分支。
- 更新各庫的版本號（例如 JavaScript 的 `package.json`、C# 的 `.csproj`）。
- 標記版本並按需發布（詳見各語言的 `README`）。

## 撰寫文件

文件對於確保庫的可用性和可維護性至關重要。***所有貢獻者必須遵循以下指南撰寫文件。***

### 通用原則
- **清晰**：使用簡單、簡潔的語言解釋概念。
- **一致性**：在所有文件中保持相同的語氣、結構和格式。
- **完整性**：記錄所有公開 API，包括輸入、輸出和邊界情況。
- **易用性**：確保文件易於查找和導航。

### 文件位置
- **root README (`README.md`)**：專案的總概述、維護說明和文件指南（本文件）。
- **語言特定 README**：
  - 使用、設置和貢獻詳情。
  - **必須確保遵照文件流程可以使用。**
- **程式碼內註釋**：
  - JavaScript：使用 `JSDoc` 記錄函數和標註好型別。
  - C#：使用 XML 文件註釋記錄方法和 Class。

### 如何撰寫文件
1. **更新根 README**：
   - 僅在專案發生重大變更（例如新增語言、重大重構）時更新本文件。
   - 保持簡潔，連結到各 README 以獲取詳細資訊。
   - 使用 Markdown 格式，包含清晰的標題和列表。

2. **撰寫語言特定 README**：
   - **結構**：
     - 簡介：簡要概述庫的用途。
     - 設置：安裝依賴和建構庫的逐步說明。
     - 使用：展示主要功能的程式碼範例。
     - 貢獻：貢獻程式碼和測試的指南。
     - 測試：運行測試的說明。(optional)
     - 發布：版本控制和發布的步驟。
   - **範例**：
     - 包含簡短、可運行的程式碼片段，展示常見用例。
     - JavaScript：除非另有指定，否則使用 `ES6+` 語法。
     - C#：使用現代 C# 語法（例如可空性註解）。
   - **格式**：
     - 使用 Markdown，保持標題一致（`#`、`##` 等）。
     - 程式碼片段使用三個反引號並指定語言（例如 ```javascript、```csharp）。

3. **撰寫程式碼內註釋**：
   - **JavaScript (JSDoc)**：
     - 記錄所有公開函數、類和方法。
     - 包含 `@param`、`@returns` 和 `@example` 標籤。
     - 範例：
       ```javascript
       /**
        * 計算兩個數字的和。
        * @param {number} a - 第一個數字。
        * @param {number} b - 第二個數字。
        * @returns {number} a 和 b 的和。
        * @example
        * sum(2, 3); // 返回 5
        */
       function sum(a, b) {
         return a + b;
       }
       ```
   - **C# (XML 註釋)**：
     - 記錄所有公開方法、類和屬性。
     - 包含 `<summary>`、`<param>`、`<returns>` 和 `<example>` 標籤。
     - 範例：
       ```csharp
       /// <summary>
       /// 計算兩個數字的和。
       /// </summary>
       /// <param name="a">第一個數字。</param>
       /// <param name="b">第二個數字。</param>
       /// <returns>a 和 b 的和。</returns>
       /// <example>
       /// <code>
       /// var result = Sum(2, 3); // 返回 5
       /// </code>
       /// </example>
       public int Sum(int a, int b)
       {
           return a + b;
       }
       ```

4. **審查文件**：
   - 在 PR 中包含文件更新。
   - 確保所有公開 API 都有文件記錄。
   - 請審查者檢查文件的清晰度、正確性和完整性。

### 文件工具
- **Markdown 編輯器**：使用 VS Code 或 Typora 撰寫 Markdown。
- **JSDoc (JavaScript)**：通過 `npm install jsdoc` 安裝。
- **DocFX (C#)**：通過 `dotnet tool install -g docfx` 安裝。
- **檢查工具**：使用 `markdownlint` 檢查 Markdown，使用 `dotnet format` 檢查 C# 程式碼風格。

## 尋求幫助
- JavaScript 相關問題：參考 `javascript/README.md` 或聯繫相關人員 。
- C# 相關問題：參考 `csharp/README.md` 或聯繫相關人員。
- 專案通用問題：在本倉庫中開啟 [issue](https://github.com/TiMa-Technology/Tima_Library/issues/new/choose)。

> 感謝各位為公司庫專案的貢獻！
