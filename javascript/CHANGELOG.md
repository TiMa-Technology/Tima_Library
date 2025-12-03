# @tima_technology/lib

## 1.4.8

### Patch Changes

- fix: 修正UUID方法的回傳型別

## 1.4.7

### Patch Changes

- fix: 修正客製化請求讓他可以以泛型判斷請求本體

## 1.4.6

### Patch Changes

- fix: 修正函式錯誤使用導致編碼錯誤

## 1.4.5

### Patch Changes

- fix: 修正授權請求的編碼問題
- fix: 修正引入路徑錯誤

## 1.4.4

### Patch Changes

- fix: 修正API回應型別，將彈性機回前端不寫死

## 1.4.3

### Patch Changes

- fix: 修正請求參數為可選

## 1.4.2

### Patch Changes

- fix: 修改`fetcher`讓主體請求能夠有回應型別能傳入，並更名成適當名稱
- refactor: 補上 JSDOC 說明

## 1.4.1

### Patch Changes

- refactor: 修正主入口型別匯出，確保所有型別都能從主入口 import
- feat: 優化 package.json exports 配置
- refactor: 調整 tsup 打包設定，保證 `dist/main.d.ts` 包含所有型別

## 1.3.4

### Patch Changes

- feat: Switch from tsup to tsdown for compilation

## 1.3.3

### Patch Changes

- 668106c: Fix(auth): 增加高併發狀況時的 Refresh 機制，讓 `AppAuthorization` 避免有 race conditions 導致錯誤.

## 1.3.1

### Patch Changes

- 6399669: Update ci, tsconfig and published script
