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
import {
  formatDate,
  convertROCToGregorian,
  adjustDateTime,
} from "@tima_technology/lib";

// 格式化日期
console.log(formatDate(new Date("2025-06-22"))); // "2025/06/22"

// 民國年轉西元年
console.log(convertROCToGregorian("114/06/22")); // "2025/06/22"

// 調整日期（增加 5 天）
console.log(adjustDateTime("2025-06-22", { days: 5 })); // "2025/06/27"
```

---

# 功能列表與 API 文件

### 基礎功能（baseFunction）

<details>
<summary><strong>📅 日期處理（date）</strong></summary>

#### `formatDate(date, options?)`

格式化日期時間為指定格式的字串，支援民國年、中文格式、自訂分隔符等。

**參數：**

- `date` (Date | string) - 要格式化的日期
- `options?` (object) - 格式化選項
  - `components?` (array) - 要包含的組件：`["year", "month", "day", "weekday", "time", "seconds"]`
  - `useChineseFormat?` (boolean | object) - 中文格式設定
  - `separator?` (string) - 日期分隔符，預設 `"/"`
  - `roc?` (boolean) - 是否使用民國紀年

**返回值：** (string) 格式化後的日期字串

**範例：**

```javascript
formatDate(new Date("2025-06-18")); // "2025/06/18"
formatDate(new Date("2025-06-18"), { roc: true }); // "114/06/18"
formatDate(new Date("2025-06-18"), { useChineseFormat: true }); // "2025年6月18日"
```

#### `convertROCToGregorian(rocDate, separator?)`

將民國曆日期字串轉換為西元日期字串。

**參數：**

- `rocDate` (string) - 民國年格式的日期字串，例如 `"112/10/05"`
- `separator?` (string) - 分隔符號，預設 `"/"`

**返回值：** (string) 西元日期字串

**範例：**

```javascript
convertROCToGregorian("112/10/05"); // "2023/10/05"
convertROCToGregorian("112.10.05", "."); // "2023.10.05"
```

#### `adjustDateTime(date, adjustments?, formatOptions?)`

調整日期時間並回傳格式化的字串，支援加減年、月、天、時、分、秒。

**參數：**

- `date` (Date | string) - 要調整的日期
- `adjustments?` (object) - 調整選項
  - `years?` (number) - 加減的年數
  - `months?` (number) - 加減的月數
  - `days?` (number) - 加減的天數
  - `hours?` (number) - 加減的小時數
  - `minutes?` (number) - 加減的分鐘數
  - `seconds?` (number) - 加減的秒數
- `formatOptions?` (object) - 同 `formatDate` 的選項

**返回值：** (string) 格式化後的日期字串

**範例：**

```javascript
adjustDateTime(new Date("2025-06-12"), { days: 5 }); // "2025/06/17"
adjustDateTime("2025-06-30", { days: 1 }); // "2025/07/01"
adjustDateTime("2025-06-12T10:00:00", { hours: 2 }, { components: ["year", "month", "day", "time"] }); // "2025/06/12 12:00"
```

#### `isDotNetMinDate(dateStr)`

判斷給定的字串是否為 .NET DateTime 的最小值 (0001-01-01T00:00:00)。

**參數：**

- `dateStr` (string) - 日期字串

**返回值：** (boolean) 如果是最小值則返回 true

**範例：**

```javascript
isDotNetMinDate("0001-01-01T00:00:00"); // true
isDotNetMinDate("2025-12-23T16:00:00"); // false
```

</details>

<details>
<summary><strong>🔢 數字處理（number）</strong></summary>

#### `formatNumber(num, decimalPlaces?, decimalSep?, thousandSep?)`

將數字格式化為千位分隔符與小數的格式。

**參數：**

- `num` (number) - 要格式化的數字
- `decimalPlaces?` (number) - 小數點後的位數，預設 `2`
- `decimalSep?` (string) - 小數點分隔符，預設 `"."`
- `thousandSep?` (string) - 千位分隔符，預設 `","`

**返回值：** (string) 格式化後的字串

**範例：**

```javascript
formatNumber(1234567.89); // "1,234,567.89"
formatNumber(1234567.89, 0); // "1,234,568"
```

#### `padDecimals(num, count)`

將數字格式化為固定小數位數，並補齊 0。

**參數：**

- `num` (number) - 要格式化的數字
- `count` (number) - 小數點後要保留的位數

**返回值：** (string) 格式化後的字串

**範例：**

```javascript
padDecimals(3.1, 4); // "3.1000"
```

#### `removeThousands(str, sep?)`

將千位分隔符移除。

**參數：**

- `str` (string) - 要處理的字串
- `sep?` (string) - 要移除的分隔符，預設 `","`

**返回值：** (string) 移除分隔符後的字串

**範例：**

```javascript
removeThousands("1,234,567.89"); // "1234567.89"
```

#### `addCommas(num)`

將數字或字串添加千位分隔符。

**參數：**

- `num` (string | number) - 要格式化的數字或字串

**返回值：** (string) 添加千位分隔符後的字串

**範例：**

```javascript
addCommas(1234567.89); // "1,234,567.89"
```

#### `getRandowmNumber(min, max)`

產生介於指定最小值與最大值（含）之間的隨機整數。

**參數：**

- `min` (number) - 最小整數值（包含）
- `max` (number) - 最大整數值（包含）

**返回值：** (number) 隨機整數

**範例：**

```javascript
getRandowmNumber(1, 10); // 可能回傳 1~10 之間的任一整數
```

</details>

<details>
<summary><strong>📝 字串處理（string）</strong></summary>

#### `padLeft(str, length, padChar)`

左側補齊指定長度的字串。

**參數：**

- `str` (string) - 原始字串
- `length` (number) - 補齊後的總長度
- `padChar` (string) - 用於補齊的字元

**返回值：** (string) 補齊後的新字串

**範例：**

```javascript
padLeft("7", 3, "0"); // "007"
```

#### `capitalizeWords(str)`

將字串的各首字母轉成大寫。

**參數：**

- `str` (string) - 原始字串

**返回值：** (string) 首字母轉為大寫後的新字串

**範例：**

```javascript
capitalizeWords("hello world"); // "Hello World"
```

#### `btoaEncode(str)`

Base64 編碼（支援 UTF-8 字元）。

**參數：**

- `str` (string) - 欲編碼的字串

**返回值：** (string) 編碼後的 Base64 字串

**範例：**

```javascript
btoaEncode("中文"); // "5Lit5paH"
btoaEncode("hello"); // "aGVsbG8="
```

#### `atobDecode(str)`

Base64 解碼（支援 UTF-8 字元，含錯誤處理）。

**參數：**

- `str` (string) - 欲解碼的 Base64 字串

**返回值：** (Promise\<string\>) 解碼後的原始字串

**範例：**

```javascript
await atobDecode("5Lit5paH"); // "中文"
await atobDecode("aGVsbG8="); // "hello"
```

</details>

<details>
<summary><strong>✅ 驗證工具（validations）</strong></summary>

#### `isValidMac(address)`

驗證 MAC 地址格式。

**參數：**

- `address` (string) - 要驗證的 MAC 地址

**返回值：** (boolean) 有效返回 true

**範例：**

```javascript
isValidMac("00:1A:2B:3C:4D:5E"); // true
isValidMac("001A:2B:3C:4D:5E"); // false
```

#### `isValidIPv4(address)`

驗證 IPv4 地址格式。

**參數：**

- `address` (string) - 要驗證的 IPv4 地址

**返回值：** (boolean) 有效返回 true

**範例：**

```javascript
isValidIPv4("192.168.0.1"); // true
isValidIPv4("256.256.256.256"); // false
```

#### `isNumberString(str)`

檢查字符串是否僅包含數字（不包括負數）。

**參數：**

- `str` (string) - 要檢查的字符串

**返回值：** (boolean) 僅包含數字返回 true

**範例：**

```javascript
isNumberString("12345"); // true
isNumberString("123a45"); // false
```

#### `isEmail(email)`

驗證電子郵件地址。

**參數：**

- `email` (string) - 要驗證的電子郵件地址

**返回值：** (boolean) 有效返回 true

**範例：**

```javascript
isEmail("test@example.com"); // true
isEmail("test@.com"); // false
```

#### `isValidDate(dateString)`

檢查日期字串是否合法（排除 C# DateTime.MinValue）。

**參數：**

- `dateString` (string) - 要驗證的日期字符串

**返回值：** (boolean) 有效返回 true

**範例：**

```javascript
isValidDate("2023-10-05"); // true
isValidDate("0001-01-01T00:00:00"); // false
```

#### `isEmptyGuid(id)`

檢查是否為空的 GUID。

**參數：**

- `id` (string) - 要檢查的 GUID

**返回值：** (boolean) 是空 GUID 返回 true

**範例：**

```javascript
isEmptyGuid("00000000-0000-0000-0000-000000000000"); // true
isEmptyGuid("123e4567-e89b-12d3-a456-426614174000"); // false
```

#### `isEmptyArray(arr)`

判斷陣列是否為空。

**參數：**

- `arr` (Array) - 要檢查的陣列

**返回值：** (boolean) 是空陣列返回 true

**範例：**

```javascript
isEmptyArray([]); // true
isEmptyArray([1]); // false
```

#### `isEmptyObject(obj)`

判斷物件是否為空。

**參數：**

- `obj` (object) - 要檢查的物件

**返回值：** (boolean) 是空物件返回 true

**範例：**

```javascript
isEmptyObject({}); // true
isEmptyObject({ a: 1 }); // false
```

#### `isEven(num)`

判斷數字是否為偶數。

**參數：**

- `num` (number) - 整數數字

**返回值：** (boolean) 是偶數返回 true

**範例：**

```javascript
isEven(2); // true
isEven(3); // false
```

</details>

<details>
<summary><strong>🔧 通用工具（utils）</strong></summary>

#### `newGuid()`

生成新的 GUID。

**返回值：** (string) 新的 GUID

**範例：**

```javascript
newGuid(); // "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
```

#### `emptyGuid()`

獲取空的 GUID。

**返回值：** (string) 空的 GUID

**範例：**

```javascript
emptyGuid(); // "00000000-0000-0000-0000-000000000000"
```

#### `sleep(ms)`

等待指定的毫秒數。

**參數：**

- `ms` (number) - 休眠毫秒數

**返回值：** (Promise\<void\>)

**範例：**

```javascript
await sleep(1000); // 等待 1 秒
```

#### `simpleHash(str)`

簡單的雜湊，適合做為緩存的鍵值。

**參數：**

- `str` (string) - 要被雜湊的字串

**返回值：** (string) 雜湊值

#### `handleApiError(error)`

錯誤處理，將 API 錯誤轉換為統一格式。

**參數：**

- `error` (unknown) - 錯誤物件

**返回值：** (object) 格式化的錯誤物件
- `type` - 錯誤類型：`"business" | "auth" | "server" | "network"`
- `message` - 錯誤訊息
- `showToUser` - 是否顯示給用戶
- `shouldRetry` - 是否應重試

**範例：**

```javascript
const error = handleApiError(err);
if (error.type === "auth") {
  // 導向登入頁
}
```

#### `deepClone(obj)`

深層複製物件或陣列。

**參數：**

- `obj` (T) - 要複製的物件

**返回值：** (T) 深拷貝的結果

**範例：**

```javascript
const original = { a: 1, b: { c: 2 } };
const copy = deepClone(original);
```

#### `removeDuplicate(arr)`

移除陣列中重複的元素。

**參數：**

- `arr` (Array) - 原始陣列

**返回值：** (Array) 不重複的新陣列

**範例：**

```javascript
removeDuplicate([1, 2, 2, 3]); // [1, 2, 3]
```

#### `camelToSnake(str)`

將 camelCase 字串轉換為 snake_case。

**參數：**

- `str` (string) - camelCase 字串

**返回值：** (string) snake_case 字串

**範例：**

```javascript
camelToSnake("myVariableName"); // "my_variable_name"
```

#### `snakeToCamel(str)`

將 snake_case 字串轉換為 camelCase。

**參數：**

- `str` (string) - snake_case 字串

**返回值：** (string) camelCase 字串

**範例：**

```javascript
snakeToCamel("my_variable_name"); // "myVariableName"
```

#### `getRandomColor()`

生成隨機的十六進位顏色碼。

**返回值：** (string) 顏色字串

**範例：**

```javascript
getRandomColor(); // "#f3d2b6"
```

#### `flattenArray(arr)`

扁平化多層巢狀陣列。

**參數：**

- `arr` (Array) - 多層陣列

**返回值：** (Array) 單層陣列

**範例：**

```javascript
flattenArray([1, [2, [3]]]); // [1, 2, 3]
```

#### `sortByKey(array, key)`

根據物件的指定鍵排序陣列（升序）。

**參數：**

- `array` (Array) - 要排序的陣列
- `key` (string) - 依據排序的鍵

**返回值：** (Array) 排序後的新陣列

**範例：**

```javascript
sortByKey([{ id: 2 }, { id: 1 }], "id"); // [{ id: 1 }, { id: 2 }]
```

#### `convertArrayToObject(arr, key)`

將陣列轉換為物件，以指定鍵為 key。

**參數：**

- `arr` (Array) - 陣列資料
- `key` (string) - 作為物件 key 的屬性名稱

**返回值：** (object) 轉換後的物件

**範例：**

```javascript
convertArrayToObject([{ id: "a" }, { id: "b" }], "id");
// { a: { id: 'a' }, b: { id: 'b' } }
```

#### `objToQueryString(obj)`

將物件轉換為 URL 查詢字串。

**參數：**

- `obj` (object) - 物件資料

**返回值：** (string) 查詢字串

**範例：**

```javascript
objToQueryString({ a: 1, b: "test" }); // "a=1&b=test"
```

#### `debounce(func, delay, immediate?)`

防抖 - 延遲執行函數，直到指定時間內沒有新的調用。

**參數：**

- `func` (Function) - 要被 debounce 的函數
- `delay` (number) - 延遲時間（毫秒）
- `immediate?` (boolean) - 是否立即執行第一次調用

**返回值：** (Function) debounced 函數（含 `cancel`, `flush`, `pending` 方法）

**範例：**

```javascript
const debouncedLog = debounce((msg) => console.log(msg), 300);
debouncedLog("Hello");
debouncedLog("World"); // 只會在 300ms 後輸出 "World"
```

#### `debounceAsync(func, delay)`

Promise 版本的 debounce。

**參數：**

- `func` (Function) - 要被 debounce 的 async 函數
- `delay` (number) - 延遲時間（毫秒）

**返回值：** (Function) debounced async 函數

#### `throttle(func, delay?, options?)`

節流器 - 限制函數在指定時間內只能執行一次。

**參數：**

- `func` (Function) - 要被 throttle 的函數
- `delay?` (number) - 節流時間間隔（毫秒），預設 500
- `options?` (object) - 選項配置
  - `leading?` (boolean) - 是否在開始時執行，預設 true
  - `trailing?` (boolean) - 是否在結束時執行，預設 true

**返回值：** (Function) throttled 函數（含 `cancel`, `flush`, `pending` 方法）

**範例：**

```javascript
const throttledLog = throttle((msg) => console.log(msg), 1000);
throttledLog("Hello");
throttledLog("World"); // 在 1 秒內只會執行一次
```

#### `throttleAnimationFrame(func)`

基於 requestAnimationFrame 的 throttle。

**參數：**

- `func` (Function) - 要被 throttle 的函數

**返回值：** (Function) throttled 函數

#### `isEqual(value, other)`

深層比較兩個值是否相等。

**參數：**

- `value` (unknown) - 要比較的第一個值
- `other` (unknown) - 要比較的第二個值

**返回值：** (boolean) 是否深層相等

**範例：**

```javascript
isEqual({ a: 1, b: [2, 3] }, { a: 1, b: [2, 3] }); // true
isEqual(NaN, NaN); // true
```

</details>

### 瀏覽器工具（browserUtils）

<details>
<summary><strong>🌐 導航工具（navigation）</strong></summary>

#### `redirect(path, options?)`

重新導向到指定的路徑或網址，支援延遲、新分頁等選項。

**參數：**

- `path` (string) - 目標路徑或完整網址
- `options?` (object)
  - `delay?` (number) - 延遲時間（毫秒），預設 0
  - `newTab?` (boolean) - 是否在新分頁開啟，預設 false
  - `replace?` (boolean) - 是否替換當前頁面歷史記錄，預設 false

**範例：**

```javascript
redirect("/users/profile");
redirect("https://external-site.com", { newTab: true });
redirect("/dashboard", { delay: 1000 });
```

#### `getBaseUrl()`

取得基礎 URL，自動處理 IIS 虛擬目錄情況。

**返回值：** (string) 基礎 URL 字串

**範例：**

```javascript
// 開發環境: http://localhost:3000/some/path
getBaseUrl(); // "http://localhost:3000"

// 生產環境: https://example.com.tw/project1/users/profile
getBaseUrl(); // "https://example.com.tw/project1"
```

#### `getPath()`

取得當前 URL 中相對於虛擬目錄的路徑（不含虛擬目錄與查詢參數）。

**返回值：** (string) 相對路徑

**範例：**

```javascript
// URL: http://localhost:3000/test/page?a=1
getPath(); // "/test/page"

// URL: https://example.com/project1/page/edit?id=10
getPath(); // "/page/edit"
```

#### `getPageName()`

取得當前頁面的名稱（即最後一段 path）。

**返回值：** (string) 頁面名稱

**範例：**

```javascript
// URL: http://localhost:3000/user/list?id=5
getPageName(); // "list"
```

#### `goBack()`

返回上一頁。

**範例：**

```javascript
goBack();
```

#### `getQueryParam(key?)`

獲取 URL 參數 QueryString。

**參數：**

- `key?` (string) - 參數名稱（選填）

**返回值：** (string | null | Record\<string, string\>) 參數值或全部參數

**範例：**

```javascript
// URL: https://www.google.com?key=value&name=test
getQueryParam("key"); // "value"
getQueryParam(); // { key: "value", name: "test" }
```

#### `removeUrlParam(url, name)`

移除 URL 中的指定參數。

**參數：**

- `url` (string) - 目標網址
- `name` (string) - 要移除的參數名稱

**返回值：** (string) 移除參數後的網址

**範例：**

```javascript
removeUrlParam("https://www.google.com?key=value&name=test", "name");
// "https://www.google.com?key=value"
```

</details>

<details>
<summary><strong>📡 API 請求（fetcher）</strong></summary>

#### `createApiStateManager(appAccount, appPassword)`

創建 API 狀態管理器實例。

**參數：**

- `appAccount` (string) - 授權帳號
- `appPassword` (string) - 授權密碼

**返回值：** (ApiStateManager) API 狀態管理器實例

**範例：**

```javascript
const manager = createApiStateManager(process.env.APP_ACCOUNT, process.env.APP_PASSWORD);
```

#### `customRequest(apiStateManager, options)`

時光機客製化請求，會先檢查授權並發送。

**參數：**

- `apiStateManager` (ApiStateManager) - API 狀態管理器
- `options` (object)
  - `baseUrl?` (string) - API 基礎 URL，預設 `"../api"`
  - `endpoint` (string) - API 端點路徑
  - `requestBody?` (any) - 請求主體
  - `method?` (string) - HTTP 方法，預設 `"GET"`
  - `config?` (object) - 額外配置選項
  - `fetchOptions?` (object) - Fetch API 選項

**返回值：** (Promise\<ApiResponse\>) API 回應

**範例：**

```javascript
// 單筆資料
interface LoginResponse {
  userId: number;
  userName: string;
  token: string;
}

const response = await customRequest<LoginResponse>(manager, {
  endpoint: "auth/login",
  method: "POST",
  requestBody: { username, password },
});

// 多筆資料
const products = await customRequest<ListApiResponse<Product>>(manager, {
  endpoint: "products",
  method: "GET",
});
```

#### `useAjaxApi(apiStateManager, options)`

使用 Ajax API，支援快取和自動重試。

**參數：** 同 `customRequest`

**返回值：** (QueryState) 查詢狀態物件

#### `refetchQuery(apiStateManager, options)`

重新獲取查詢資料。

**參數：** 同 `customRequest`

**返回值：** (Promise\<ApiResponse\>) API 回應

#### `invalidateQuery(apiStateManager, options)`

使查詢快取失效並重新獲取。

**參數：** 同 `customRequest`

**返回值：** (Promise\<void\>)

#### `clearAllCache(apiStateManager)`

清除所有快取。

**參數：**

- `apiStateManager` (ApiStateManager) - API 狀態管理器

#### `setDefaultConfig(apiStateManager, config)`

設置預設配置。

**參數：**

- `apiStateManager` (ApiStateManager) - API 狀態管理器
- `config` (object) - 配置選項

#### `cleanCacheInterval(apiStateManager)`

定期清理過期快取（每 60 秒）。

**參數：**

- `apiStateManager` (ApiStateManager) - API 狀態管理器

</details>

<details>
<summary><strong>🔌 WebSocket 客戶端（ws）</strong></summary>

#### `WebSocketClient`

WebSocket 連線管理類別。

**建構子參數：**

- `options` (WebSocketOptions)
  - `webSocketURL` (string) - WebSocket 伺服器的 URL
  - `keyNo` (string) - 用戶唯一識別碼 UUID
  - `clientIp` (string) - 客戶端的 IP 地址
  - `role` (string) - 角色名稱
  - `name` (string) - 使用者名稱
  - `memNo` (string) - 使用者 ID
  - `notifyClientCountRole` (string) - 通知客戶端計數的角色
  - `notifyClientAddCloseRole` (string) - 通知客戶端連線變化的角色
  - `mapNo?` (string) - 相關 ID（可選）
  - `callBack` (Function) - 訊息回調函數
  - `enableHeartCheck?` (boolean) - 是否啟用心跳檢查，預設 true
  - `heartbeatInterval?` (number) - 心跳間隔時間，預設 30000 毫秒
  - `maxReconnectAttempts?` (number) - 最大重連次數，預設 3

**方法：**

- `connect()` - 建立連線（必須等待連線成功）
- `send(message)` - 發送訊息
- `disconnect()` - 關閉連線
- `isConnected()` - 檢查是否已連線
- `getState()` - 獲取當前連線狀態
- `setEventHandlers(handlers)` - 設定事件處理器
- `destroy()` - 清理資源

**範例：**

```javascript
const wsClient = new WebSocketClient({
  webSocketURL: "wss://example.com",
  keyNo: "12345",
  clientIp: "192.168.1.1",
  role: "ChatRoom",
  name: "系統管理者",
  memNo: "user-id-123",
  notifyClientCountRole: "Admin",
  notifyClientAddCloseRole: "Moderator",
  callBack: (message) => console.log("收到訊息:", message),
});

// 設定事件處理器
wsClient.setEventHandlers({
  onOpen: () => console.log("連線已建立"),
  onClose: (event) => console.log("連線已關閉", event),
  onStateChange: (state) => console.log("狀態變化:", state),
});

// 連線
await wsClient.connect();

// 發送訊息
wsClient.send({ type: "Message", content: "Hello World" });

// 關閉連線
wsClient.disconnect();
```

</details>

<details>
<summary><strong>📊 日誌記錄（infoLogger）</strong></summary>

#### `InfoLogger`

記錄平台操作資訊的工具類別。

**建構子參數：**

- `apiStateManager` (ApiStateManager) - 已初始化的 API 狀態管理器實例

**靜態方法：**

- `InfoLogger.getPlatform()` - 取得使用者平台名稱（手機、電腦、iOS 等）

**實例方法：**

- `log(options)` - 記錄一筆 Info Log 到伺服器
  - `bMemNo` (string | null) - 使用者編號
  - `type` (string) - 日誌類型
  - `message` (string) - 訊息內容
  - `message2?` (string) - 訊息內容 2
  - `message3?` (string) - 訊息內容 3
  - `url?` (string) - URL，預設為當前頁面 URL

**範例：**

```javascript
const logger = new InfoLogger(apiStateManager);

await logger.log({
  bMemNo: "user-123",
  type: "LOGIN",
  message: "使用者登入",
  message2: "成功",
});

// 取得平台資訊
const platform = InfoLogger.getPlatform(); // "Windows" | "Mac" | "iPhone" | "Android" | "iPad" | "PC"
```

</details>

### 授權（auth）

<details>
<summary><strong>🔐 應用程式授權（AppAuthorization）</strong></summary>

#### `AppAuthorization`

應用程式授權管理類別，處理 token 的獲取、更新和授權標頭的準備。

**建構子參數：**

- `appAccount` (string) - 應用程式帳號
- `appPassword` (string) - 應用程式密碼

**方法：**

- `prepareAuthHeader(headers, url)` - 準備授權標頭
  - `headers` (object) - HTTP 標頭物件
  - `url` (string) - 請求 URL
  - 返回 `Promise<boolean>` - 是否成功添加授權標頭

**範例：**

```javascript
const auth = new AppAuthorization("account", "password");

const headers = {};
const success = await auth.prepareAuthHeader(headers, "/api/users");
// headers 現在包含 Authorization: "Basic ..."
```

</details>

詳細 API 請參閱程式碼中的 **JSDoc 註釋**（在 IDE 中懸停函數即可查看）。

---

## 使用方式

### Node.js

```javascript
import {
  formatDate,
  convertROCToGregorian,
  adjustDateTime,
} from "@tima_technology/lib";

// 格式化日期
console.log(formatDate(new Date("2025-06-22"))); // "2025/06/22"

// 民國年轉西元年
console.log(convertROCToGregorian("114/06/22")); // "2025/06/22"

// 調整日期（增加 5 天）
console.log(adjustDateTime("2025-06-22", { days: 5 })); // "2025/06/27"
```

### TypeScript

```typescript
import {
  formatDate,
  convertROCToGregorian,
  adjustDateTime,
} from "@tima_technology/lib";

// 格式化日期（民國年 + 中文格式）
console.log(
  formatDate("2025-06-22", {
    roc: true,
    useChineseFormat: { date: true },
  })
); // "114年6月22日"

// 民國年轉西元年
console.log(convertROCToGregorian("114/06/22")); // "2025/06/22"

// 調整日期（增加 2 小時，包含時間）
console.log(
  adjustDateTime(
    "2025-06-22T10:00:00",
    { hours: 2 },
    {
      components: ["year", "month", "day", "time"],
    }
  )
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
  import { formatNumber } from "@tima_technology/lib";
  // 避免
  import * as TimaUtils from "@tima_technology/lib";
  ```
- **動態引入**：對非立即使用功能可用 `import()` 延遲載入。
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
