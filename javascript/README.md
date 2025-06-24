# @tima_technology/lib

[![npm version](https://badge.fury.io/js/@tima_technology%2Flib.svg)](https://badge.fury.io/js/@tima_technology%2Flib) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Tima JavaScript 工具庫是一組模組化的工具函數，適用於 Javascript 開發，採用 ES6+ 語法，無外部框架依賴，可輕鬆整合至任何 JavaScript 環境。提供日期格式化、數字處理、資料驗證等功能。

## 功能特色

- **模組化設計**：按需引入，減少不必要載入。
- **無外部依賴**：純 JavaScript，輕量高效。
- **TypeScript 支援**：內建型別定義。
- **跨環境相容**：支援 Node.js（20.0.0+）與現代瀏覽器（Chrome 61+、Firefox 60+ 等）。

---

## 安裝

```bash
npm install @tima_technology/lib
```

### 環境需求

- **Node.js**：20.0.0+（18.x 以下已不再維護）。
- **瀏覽器**：支援 ES Modules 的現代瀏覽器（例如 Chrome 61+、Firefox 60+）。
- **TypeScript**（可選）：4.7+，需在 `tsconfig.json` 中配置：
  ```json
  {
    "compilerOptions": {
      "module": "ESNext",
      "moduleResolution": "Node"
    }
  }
  ```
- **package.json**：確保設定 `"type": "module"` 或使用 `.mjs` 檔案。

---

## 快速入門

以下為簡單範例，展示如何使用核心功能：

```javascript
import { formatDate, convertROCToGregorian, adjustDateTime } from '@tima_technology/lib';

// 格式化日期
console.log(formatDate(new Date('2025-06-22'))); // "2025/06/22"

// 民國年轉西元年
console.log(convertROCToGregorian('114/06/22')); // "2025/06/22"

// 調整日期（增加 5 天）
console.log(adjustDateTime('2025-06-22', { days: 5 })); // "2025/06/27"
```

---

## 功能列表

<details>
<summary>日期處理（date）</summary>

- formatDate
- convertROCToGregorian
- adjustDateTime

</details>

<details>
<summary>數字處理（number））</summary>

- formatNumber
- padDecimals
- removeThousands
- addCommas
- getRandowmNumber

</details>
<details>
<summary>字串處理（string）</summary>

- padLeft
- capitalizeWords
- btoaEncode
- atobDecode

</details>
<details>
<summary>驗證工具（validations）</summary>

- isValidMac
- isValidIPv4
- isNumberString
- isEmail
- isValidDate
- isEmptyGuid
- isEmptyArray
- isEmptyObject
- isEven

</details>

<details>
<summary>通用工具（utils）</summary>

- newGuid
- emptyGuid
- sleep
- simpleHash
- handleApiError
- deepClone
- removeDuplicate
- camelToSnake
- snakeToCamel
- getRandomColor
- flattenArray
- sortByKey
- convertArrayToObject
- objToQueryString

</details>

<details>
<summary>AJAX 請求（ajax）</summary>

- createApiStateManager
- ajaxApi
- useAjaxApi
- refetchQuery
- invalidateQuery
- clearAllCache
- setDefaultConfig
- cleanCacheInterval
</details>

<details>
  <summary>WebSocket Client</summary>

- WebSocketClient 

</details>

<details>

<summary>日誌記錄（infoLogger）</summary>

- InfoLogger
- getPlatform 

</details>     

<details>
      <summary>導航工具（navigation）</summary>
      
- redirect
- getBaseUrl
- getPath
- getPageName
- goBack
- getQueryParam
- removeUrlParam
      
</details>

詳細 API 請參閱程式碼中的 **JSDoc 註釋**（在 IDE 中懸停函數即可查看）。

---

## 使用方式

### Node.js

```javascript
import { formatDate, convertROCToGregorian, adjustDateTime } from '@tima_technology/lib';

// 格式化日期
console.log(formatDate(new Date('2025-06-22'))); // "2025/06/22"

// 民國年轉西元年
console.log(convertROCToGregorian('114/06/22')); // "2025/06/22"

// 調整日期（增加 5 天）
console.log(adjustDateTime('2025-06-22', { days: 5 })); // "2025/06/27"
```

### TypeScript

```typescript
import { formatDate, convertROCToGregorian, adjustDateTime } from '@tima_technology/lib';

// 格式化日期（民國年 + 中文格式）
console.log(
  formatDate('2025-06-22', {
    roc: true,
    useChineseFormat: { date: true },
  })
); // "114年6月22日"

// 民國年轉西元年
console.log(convertROCToGregorian('114/06/22')); // "2025/06/22"

// 調整日期（增加 2 小時，包含時間）
console.log(
  adjustDateTime('2025-06-22T10:00:00', { hours: 2 }, {
    components: ['year', 'month', 'day', 'time'],
  })
); // "2025/06/22 12:00"
```

### 注意事項

- 建議僅引入所需模組以優化效能。
- 每個函數均包含 JSDoc 註釋，詳述參數、返回值與邊界情況，請在 IDE 中查看。
- 若需支援舊版瀏覽器，請使用 Rollup 或 Vite 打包為 CommonJS 或 UMD 格式。

---

## 效能最佳化

- **按需引入**：
  ```javascript
  // 推薦
  import { formatNumber } from '@tima_technology/lib';
  // 避免
  import * as TimaUtils from '@tima_technology/lib';
  ```
- **動態引入**：對不常用功能使用 `import()` 延遲載入。
- **Tree Shaking**：本套件支援 tree shaking，確保打包時僅包含使用到的程式碼。

---

## 貢獻

歡迎為本套件貢獻程式碼！請遵循以下流程：

1. **Fork 儲存庫**：
   ```bash
   git clone https://github.com/TiMa-Technology/Tima_Library.git
   cd Tima_Library
   ```

2. **創建分支**：
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **程式碼規範**：
   - 遵循 [Airbnb JavaScript 風格指南](https://github.com/airbnb/javascript)。
   - 執行 `npm run lint` 檢查程式碼。
   - 每個公開函數需包含 JSDoc 註釋，例如：
     ```javascript
     /**
      * 格式化數字，加入千分位符號。
      * @param {number} value - 要格式化的數字。
      * @param {number} [decimals=2] - 小數點位數，預設為 2。
      * @returns {string} 格式化後的數字字串。
      * @example
      * formatNumber(1234567.89); // "1,234,567.89"
      */
     export function formatNumber(value: number, decimals = 2): string {
       return value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
     }
     ```

4. **測試**（可選）：
   - 使用 Vitest 撰寫單元測試，存放於 `tests/`。
   - 執行測試：`npm test`。

5. **提交變更**：
   - 使用規範的提交訊息，例如：
     ```bash
     git commit -m "feat: add formatROCDate function"
     ```
   - 推送分支並創建拉取請求（PR）：
     ```bash
     git push origin feature/your-feature-name
     ```

6. **PR 要求**：
   - 包含 JSDoc 註釋與文件更新。
   - 描述功能用途與使用範例。
   - 至少一名審查者批准。

---

## 問題回報

若遇到問題，請在 [GitHub Issues](https://github.com/TiMa-Technology/Tima_Library/issues) 提交，包含以下資訊：

- 問題描述
- 重現步驟
- 預期行為
- 實際行為
- 環境資訊（Node.js 版本、瀏覽器版本等）

---

## 許可證

本套件採用 [MIT 許可證](LICENSE)。

---

## 聯繫方式

- **GitHub**：https://github.com/TiMa-Technology/Tima_Library
- **問題回報**：提交 [GitHub Issue](https://github.com/TiMa-Technology/Tima_Library/issues)
- **聯繫維護者**：透過 GitHub 或內部通訊工具

感謝使用 Tima JavaScript 工具庫！