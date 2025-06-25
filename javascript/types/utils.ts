/**
 * Debounce 函數的類型定義
 */
export interface DebounceFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel(): void;
  flush(...args: Parameters<T>): ReturnType<T>;
  pending(): boolean;
}

/**
 * Throttle 選項配置
 */
export interface ThrottleOptions {
  /**
   * 是否在節流開始時立即執行（預設：true）
   */
  leading?: boolean;
  /**
   * 是否在節流結束時執行最後一次調用（預設：true）
   */
  trailing?: boolean;
}

/**
 * Throttle 函數的類型定義
 */
export interface ThrottleFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel(): void;
  flush(): ReturnType<T> | undefined;
  pending(): boolean;
}
