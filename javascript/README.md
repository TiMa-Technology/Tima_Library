# Tima JavaScript 工具庫

本文件介紹公司 JavaScript 工具庫，本庫提供一系列模組化的前端和JS函數，涵蓋資料處理、格式化、驗證等功能。此文件詳細說明如何使用本庫、設置開發環境、貢獻程式碼以及***撰寫文件***的規範。

## 快速導覽

- [簡介](#簡介)
- [前置需求](#前置需求)
- [設置開發環境](#設置開發環境)
- [使用方式](#使用方式)
- [效能考量](#效能考量)
- [貢獻程式碼](#貢獻程式碼)
- [撰寫文件](#撰寫文件)
  - [通用原則](#通用原則)
  - [文件位置](#文件位置)
  - [如何撰寫文件](#如何撰寫文件)
- [測試 (Optional)](#測試-optional)
- [發布更新](#發布更新)
- [常見問題](#常見問題)
- [尋求幫助](#尋求幫助)

## 簡介

本工具庫是一組模組化的工具函數，適用於前端和後端開發，採用 ES6+ 語法，無外部框架依賴，可直接用於任何 JavaScript 環境。

### 專案結構
```
Tima_Library/
├──javascript
├──── README.md
├──── baseFunction/        # 通用方法
│     ├── index.js         # 主要輸出檔案，匯入所有模組
│     ├── date.js          # 日期相關工具
│     ├── validation.js    # 驗證相關工具
│     ├── utils.js         # 其他通用工具
│     └── numberUtils.js   # 數字格式化工具
└── ...
```
> **注意**：`index.js` 匯入並導出 `baseFunction/` 下的所有檔案。建議僅在需要多個功能時匯入，否則優先匯入單一模組以減少不必要載入。

## 前置需求

以下環境皆可使用本庫：

1. **原生 ESM（瀏覽器）**：
   - 支援 ES Modules 的現代瀏覽器（例如 Chrome 61+、Firefox 60+）。
   - 無需額外相依套件。
   - TypeScript 使用者需版本 4.7+ 並配置：
     ```json
     {
       "compilerOptions": {
         "module": "ESNext",
         "moduleResolution": "Node"
       }
     }
     ```

2. **Node.js 環境**：
   - Node.js 20.0.0+。 (18以下已經宣布不會在維護)
   - `package.json` 需設定 `"type": "module"`，或使用 `.mjs` 副檔名。
   - TypeScript 使用者需上述配置。

## 設置開發環境

1. **安裝 Node.js**：
   - 確保安裝 Node.js（建議版本 >= 16.x），從 [官方網站](https://nodejs.org/) 下載。
   - 檢查版本：`node -v` 和 `npm -v`。

2. **Fork Repo**：
   ```bash
   git clone https://github.com/your-org/Tima_Library.git
   cd Tima_Library/javascript
   ```

3. **Install dependencies**：
   ```bash
   npm install
   ```

4. **複製檔案（替代方式）**：
   - 從儲存庫下載或複製所需檔案（例如 `baseFunction/utils.js`）。
   - 放置到專案目錄（例如 `src/lib/` 或 `src/utils/`）。
   - **注意**：若函數有依賴關係，需一併複製相關檔案。

5. **開發工具**：
   - 不限

## 使用方式

本庫支援多種引入方式，適用於`瀏覽器`和 `Node.js` 環境。以下為詳細說明和範例：

### 引入方式
1. **引入全部功能**：
   ```javascript
   import * as TimaUtils from '@tima/baseFunction';

   // 格式化數字
   console.log(TimaUtils.formatNumber(1234.56)); // "1,234.56"

   // 格式化日期
   console.log(TimaUtils.formatDateTime(new Date())); // 例如 "2025-05-01 12:00:00"
   ```
   > **注意**：僅在需要多個功能時使用，避免載入不必要模組。

2. **引入特定模組**：
   ```javascript
   // 日期相關
   import { formatDateTime, formatROCDate } from '@tima/baseFunction/date';

   // 數字相關
   import { formatNumber, padDecimals } from '@tima/baseFunction/numberUtils';

   // 瀏覽器操作
   import { goBack, redirect } from '@tima/browser-utils';

   console.log(formatNumber(1234.56)); // "1,234.56"
   console.log(formatROCDate(new Date())); // 例如 "114/05/01"
   ```

3. **動態引入（延遲載入）**：
   ```javascript
   async function loadDateUtils() {
     const { formatDateTime } = await import('@tima/baseFunction/date');
     return formatDateTime(new Date());
   }

   loadDateUtils().then(console.log); // 例如 "2025-05-01 12:00:00"
   ```

### 瀏覽器範例（ESM）
```html
<!-- page.html -->
<script type="module">
  import { formatNumber, newGuid } from './baseFunction/utils.js';

  // 格式化數字（加上千分位符號）
  console.log(formatNumber(1234567.89)); // "1,234,567.89"

  // 產生 GUID
  console.log(newGuid()); // 例如 "123e4567-e89b-12d3-a456-426614174000"
</script>
```

### Node.js 範例
```javascript
// page.js
import { formatNumber, newGuid } from './baseFunction/utils.js';

// 格式化數字
console.log(formatNumber(1234567.89)); // "1,234,567.89"

// 產生 GUID
console.log(newGuid()); // 例如 "123e4567-e89b-12d3-a456-426614174000"
```

### 注意事項
- 每個函數的 JSDoc 註釋詳細說明參數、返回值和邊界情況，請在 IDE 中查看（例如將游標停在函數上）。
- 若在舊版瀏覽器中使用，需使用 Rollup 或 Vite 打包為 CommonJS 或 UMD 格式。

## 效能考量

為優化載入效能，請遵循以下最佳實踐：

1. **僅引入必要模組**：
   ```javascript
   // 推薦
   import { formatNumber } from '@tima/baseFunction/numberUtils';

   // 避免
   import * as TimaUtils from '@tima/baseFunction';
   ```

2. **使用動態引入**：
   - 延遲載入不常用的功能：
     ```javascript
     button.onclick = async () => {
       const { generateReport } = await import('@tima/baseFunction/reportUtils');
       await generateReport();
     };
     ```

3. **避免過度依賴 `index.js`**：
   - 僅在需要多個模組時匯入 `index.js`，否則優先匯入單一檔案（例如 `date.js`）。

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
   - 使用 ES6+ 語法，遵循 Airbnb JavaScript 風格指南。
   - 執行 `npm run lint` 檢查程式碼風格（若已配置 ESLint）。
   - 為每個公開函數撰寫 JSDoc 註釋（見 [撰寫文件](#撰寫文件)）。

4. **提交訊息**：
   - 遵循 [Commits 規範](https://github.com/TiMa-Technology/tiMa-Docs/blob/main/Git/commit_message.md)，例如：
     ```bash
     git commit -m "feat: 新增 formatROCDate 函數"
     ```

5. **測試 (Optional)**：
   - 若撰寫單元測試，使用 Jest 框架，測試檔案存放在 `tests/`。
   - 執行測試：`npm test`。
   - 範例：
     ```javascript
     import { formatNumber } from './numberUtils';

     test('formatNumber adds thousand separators', () => {
       expect(formatNumber(1234567.89)).toBe('1,234,567.89');
     });
     ```

6. **提交變更**：
   - 推送分支：
     ```bash
     git push origin feature/your-feature-name
     ```
   - 在 GitHub 上創建拉取請求（PR），詳細描述變更內容。
   - 至少請求一名團隊成員進行程式碼審查。

7. **PR 指南**：
   - 每個新函數需包含完整 `JSDoc` 註釋。
   - 描述函數用途、使用場景和範例。
   - 提交前本地測試變更，確保無錯誤。

## 撰寫文件

文件是確保本庫易用性和可維護性的核心，請嚴格遵循以下指南。

### 通用原則
- **清晰**：使用簡單、易懂的語言，避免過多技術術語。
- **一致性**：保持語氣、結構和格式統一。
- **完整性**：記錄所有公開函數，包括參數、返回值、邊界情況和範例。
- **易用性**：確保文件易於導航，範例可直接複製運行。

### 文件位置
- **本 README**：提供庫的設置、使用、貢獻和文件指南。
- **程式碼內 JSDoc**：每個公開函數必須包含 `JSDoc` 註釋，標註型別、參數和範例。
- **額外文件**：如有進階說明，存放在 `javascript/docs/`。

### 如何撰寫文件
1. **增加該資料夾專用 README**：(如必要，不然使用 JSDoc 即可)
   - **結構**：
     - 簡介：概述庫用途和功能。
     - 前置需求：環境和配置要求。
     - 設置：詳細環境設置步驟。
     - 使用：提供可運行範例。
     - 效能考量：優化建議。
     - 貢獻：程式碼和測試提交流程。
     - 測試：測試流程（optional）。
     - 發布：版本更新流程。
     - 常見問題：解答常見疑惑。
   - **格式**：
     - 使用 Markdown，標題層次清晰（`#`、`##` 等）。
     - 程式碼片段使用 ```javascript 包圍。
   - **範例**：
     - 每個功能提供至少一個可複製執行的程式碼片段。
     - 範例應簡短、聚焦，避免複雜邏輯。

2. **撰寫 JSDoc 註釋**：
   - 每個公開函數必須包含 JSDoc，格式如下：
     ```javascript
     /**
      * 格式化數字，加入千分位符號。
      * @param {number} value - 要格式化的數字。
      * @param {number} [decimals=2] - 小數點位數，預設為 2。
      * @returns {string} 格式化後的數字字串。
      * @example
      * formatNumber(1234567.89); // 返回 "1,234,567.89"
      * formatNumber(1234, 0); // 返回 "1,234"
      */
     export function formatNumber(value, decimals = 2) {
       return value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
     }
     ```
   - 必須包含 `@param`、`@returns` 和 `@example` 標籤。
   - 使用 TypeScript 型別標註（例如 `{number}`、`{string}`）。

3. **審查文件**：
   - 每份 PR 必須包含相關文件更新。
   - 確保所有公開函數有 JSDoc 註釋。
   - 請審查者檢查文件的清晰度、正確性和完整性。
   - 確認範例程式碼可運行無誤。


## 測試 (Optional)

雖然目前未強制要求單元測試，但鼓勵撰寫測試以提高程式碼可靠性：
- 使用 Jest 框架，測試檔案存放在 `javascript/tests/`。
- 執行測試：`npm test`。
- ~~測試範例參見[貢獻程式碼](#貢獻程式碼)。~~

## 發布更新

1. **版本更新**：
   - 更新 `package.json` 的版本號，遵循 [SemVer](https://semver.org/)：
     ```json
     "version": "1.0.1"
     ```

2. **標記版本**：
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

3. ~~**發布到內部 npm 倉庫**（未來優化方向）：~~
   ```bash
   npm publish --registry <internal-registry-url>
   ```

4. **更新文件**：
   - 在 README 中記錄新功能範例或重大變更。
   - 確保 JSDoc 註釋與程式碼一致。

## 常見問題

**Q：為什麼選擇 ESM？**  
A：ESM 是 JavaScript 官方標準模組系統，提供更好的程式碼組織和效能。

**Q：可以在舊版瀏覽器中使用嗎？**  
A：建議使用支援 ESM 的現代瀏覽器。若需支援舊版瀏覽器，可使用 Rollup 或 Vite 打包。

**Q：如何回報問題？**  
A：在 GitHub 開立 Issue，包含：  
- 問題描述  
- 重現步驟  
- 預期行為  
- 實際行為  
- 環境資訊（瀏覽器版本、Node.js 版本等）

## 尋求幫助

- 查閱本 README 或 `javascript/docs/`。
- 聯繫 JavaScript 團隊（透過內部通訊工具）。
- 在倉庫中開啟 Issue 描述問題或建議。

感謝你為 Tima JavaScript 工具庫的貢獻！你的努力將提升專案品質。
