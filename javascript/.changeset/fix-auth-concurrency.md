---
"@tima_technology/lib": patch
---

Fix(auth): 增加高併發狀況時的 Refresh 機制，讓 `AppAuthorization` 避免有 race conditions 導致錯誤.
