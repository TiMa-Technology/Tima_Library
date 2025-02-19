# Tima Library - JavaScript 工具函式庫  🧰

這是一個 JavaScript 工具函式集合，包含請求處理、加解密、日期處理、字串操作等常用功能。

## Prerequisite

- 以下兩者皆可

### 原生 ESM（瀏覽器）
- 支援 ES Modules 的現代瀏覽器
- 不需要額外的相依套件
- 如果使用 TypeScript，需要 4.7 版本以上才支援 ESM

### Node.js 環境
- Node.js 14.0.0 版本以上
- `package.json` 需要設定 `"type": "module"` 或使用 `.mjs` 副檔名
- TypeScript 使用者需要以下設定：
  ```json
  {
    "compilerOptions": {
      "module": "ESNext",
      "moduleResolution": "Node"
    }
  }
  ```

## Installation 👀

### 方式一：複製專案
```bash
git clone https://github.com/your-org/Tima_Library.git
cd Tima_Library
```

### 方式二：複製檔案
1. 從儲存庫下載或複製 `utils.js` 檔案
2. 放置到你的專案的源碼目錄中（例如：`src/lib/` 或 `src/utils/`）

> 請注意如果你引入的函式有互相依賴則都需要引入

## 專案結構

```
Tima_Library/

├── baseFunction/
│   ├── index.js     # 主要輸出檔案
│   ├── date.js      # 日期相關工具
│   ├── validation.js # 驗證相關工具
│   └── utils.js     # 其餘方便的方法
└── ...
└── ...

```

## 引入方式 🧵

### 方式一：引入全部功能

```javascript
// 引入所有功能
import * as TimaUtils from '@tima/baseFunction';

// 使用方式
TimaUtils.formatNumber(1234.56);
TimaUtils.formatDateTime(new Date());
```

### 方式二：只引入需要的模組

```javascript
// 只引入日期相關功能
import { formatDateTime, formatROCDate } from '@tima/baseFunction/dateUtils';

// 只引入數字相關功能
import { formatNumber, padDecimals } from '@tima/baseFunction/numberUtils';

// 只引入瀏覽器操作功能
import { goBack, redirect } from "@tima/browser-utils"
```

### 方式三：依需求動態引入
注意: 動態引入是個Promise

```javascript
// 動態引入特定模組
async function loadDateUtils() {
    const { formatDateTime } = await import('@tima/baseFunction/dateUtils');
    return formatDateTime(new Date());
}
```

## Getting Started 🏃

> 以下擇一使用，但如果有 `nodejs` 請盡量用第二種來達到載入優化

#### 瀏覽器（ESM）
```html
<script type="module">
  import { formatNumber, padDecimals, BaseUtils } from './path/to/utils.js';

  // 格式化數字（加上千分位符號）
  console.log(formatNumber(1234567.89)); // "1,234,567.89"

  // 產生 GUID
  console.log(BaseUtils.newGuid());
</script>
```

#### Node.js
```javascript
import { formatNumber, padDecimals, BaseUtils } from './path/to/utils.js';

// 格式化數字（加上千分位符號）
console.log(formatNumber(1234567.89)); // "1,234,567.89"

// 產生 GUID
console.log(BaseUtils.newGuid());
```


## 效能考量

### 最佳實踐
1. 只引入需要的模組，避免引入整個函式庫：
```javascript
// 好的做法
import { formatNumber } from '@tima/baseFunction/numberUtils';

// 避免這樣做（除非你需要大部分功能）
import * as TimaUtils from '@tima/baseFunction';
```

2. 使用動態引入來延遲載入不常用的功能：
```javascript
// 需要時才載入
button.onclick = async () => {
    const { generateReport } = await import('@tima/baseFunction/reportUtils');
    await generateReport();
};
```

## JSDoc 文件說明

### 在 IDE 中查看
大多數現代 IDE（如 VS、WebStorm 等）會在游標停留在引入的函式上時顯示 JSDoc 文件：

```javascript
import { formatNumber } from './path/to/utils.js';

// 將游標停在 formatNumber 上會顯示說明文件
formatNumber(1234.56);
```

## Contribution 🚚

以下是維護修改此工具庫的方式：

1. Fork 儲存庫
```bash
git fork https://github.com/your-org/Tima_Library.git
```

2. 建立功能分支
```bash
git checkout -b feature/amazing-feature
```

3. 進行修改
- 在 `utils.js` 中新增或修改函式
- 確保所有函式都有適當的 JSDoc 文件
- 遵循現有的程式碼風格
- 適當時新增測試

4. 提交變更
```bash
git commit -m "新增厲害的功能"
```

5. 推送到你的 Fork
```bash
git push origin feature/amazing-feature
```

6. 建立 Pull Request
- 前往 GitHub 上的原始儲存庫
- 點擊「New Pull Request」
- 選擇你的功能分支
- 描述你的變更
- 提交 PR

### Pull Request 指南
- 每個新函式都需要完整的 JSDoc 文件
- 遵循現有的程式碼風格
- 描述新函式的用途和使用場景
- 在 PR 描述中包含使用範例
- 提交前測試你的變更


## 常見問題 ❓

### Q: 為什麼選擇使用 ESM？
A: ESM 是 JavaScript 的官方標準模組系統，提供更好的程式碼組織方式和執行效能。

### Q: 可以在舊版瀏覽器中使用嗎？
A: 建議使用支援 ESM 的現代瀏覽器。如果需要支援舊版瀏覽器，可以使用建構工具（如 Webpack、Rollup）進行打包。

### Q: 如何回報問題？
A: 請在 GitHub 儲存庫中開立 Issue，並提供以下資訊：
- 問題描述
- 重現步驟
- 預期行為
- 實際行為
- 環境資訊（瀏覽器版本、Node.js 版本等）
