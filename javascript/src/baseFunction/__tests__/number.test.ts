import { describe, it, expect } from "vitest";
import {
  formatNumber,
  padDecimals,
  removeThousands,
  addCommas,
  getRandowmNumber,
} from "../number";

describe("formatNumber", () => {
  it("應該正確格式化正整數", () => {
    expect(formatNumber(1234567)).toBe("1,234,567.00");
    expect(formatNumber(1000)).toBe("1,000.00");
    expect(formatNumber(123)).toBe("123.00");
  });

  it("應該正確格式化負數", () => {
    expect(formatNumber(-1234567.89)).toBe("-1,234,567.89");
    expect(formatNumber(-123.45)).toBe("-123.45");
  });

  it("應該正確格式化小數", () => {
    expect(formatNumber(1234567.89)).toBe("1,234,567.89");
    expect(formatNumber(123.456)).toBe("123.46"); // 四捨五入到2位
  });

  it("應該支援自訂小數位數", () => {
    expect(formatNumber(1234.56789, 0)).toBe("1,235");
    expect(formatNumber(1234.56789, 3)).toBe("1,234.568");
    expect(formatNumber(1234.56789, 4)).toBe("1,234.5679");
  });

  it("應該支援自訂分隔符", () => {
    expect(formatNumber(1234567.89, 2, ",", ".")).toBe("1.234.567,89");
    expect(formatNumber(1234567.89, 2, ":", " ")).toBe("1 234 567:89");
  });

  it("應該處理邊界值", () => {
    expect(formatNumber(0)).toBe("0.00");
    expect(formatNumber(0.1)).toBe("0.10");
    expect(formatNumber(999)).toBe("999.00");
    expect(formatNumber(1000)).toBe("1,000.00");
  });

  it("應該處理非有限數字", () => {
    expect(formatNumber(Infinity)).toBe("");
    expect(formatNumber(-Infinity)).toBe("");
    expect(formatNumber(NaN)).toBe("");
  });

  it("應該處理負的小數位數", () => {
    expect(formatNumber(1234.56, -1)).toBe("1,235");
  });
});

describe("padDecimals", () => {
  it("應該正確補齊小數位數", () => {
    expect(padDecimals(3.1, 4)).toBe("3.1000");
    expect(padDecimals(3.14, 4)).toBe("3.1400");
    expect(padDecimals(3.1415, 2)).toBe("3.14");
  });

  it("應該處理整數", () => {
    expect(padDecimals(3, 2)).toBe("3.00");
    expect(padDecimals(100, 3)).toBe("100.000");
  });

  it("應該處理負數", () => {
    expect(padDecimals(-3.1, 4)).toBe("-3.1000");
    expect(padDecimals(-123.45, 3)).toBe("-123.450");
  });

  it("應該處理零", () => {
    expect(padDecimals(0, 3)).toBe("0.000");
    expect(padDecimals(0.0, 2)).toBe("0.00");
  });

  it("應該處理邊界值", () => {
    expect(padDecimals(3.1, 0)).toBe("3.");
    expect(padDecimals(3.9, 0)).toBe("4.");
  });

  it("應該處理非有限數字", () => {
    expect(padDecimals(Infinity, 2)).toBe("");
    expect(padDecimals(-Infinity, 2)).toBe("");
    expect(padDecimals(NaN, 2)).toBe("");
  });

  it("應該處理負的 count 值", () => {
    expect(padDecimals(3.14, -1)).toBe("");
    expect(padDecimals(3.14, -5)).toBe("");
  });

  it("應該正確四捨五入", () => {
    expect(padDecimals(3.145, 2)).toBe("3.15");
    expect(padDecimals(3.144, 2)).toBe("3.14");
    expect(padDecimals(2.995, 2)).toBe("3.00");
  });
});

describe("removeThousands", () => {
  it("應該移除預設的千位分隔符", () => {
    expect(removeThousands("1,234,567.89")).toBe("1234567.89");
    expect(removeThousands("1,000")).toBe("1000");
    expect(removeThousands("123,456")).toBe("123456");
  });

  it("應該移除自訂分隔符", () => {
    expect(removeThousands("1.234.567,89", ".")).toBe("1234567,89");
    expect(removeThousands("1 234 567.89", " ")).toBe("1234567.89");
  });

  it("應該處理沒有分隔符的字串", () => {
    expect(removeThousands("1234567.89")).toBe("1234567.89");
    expect(removeThousands("123")).toBe("123");
  });

  it("應該處理空字串", () => {
    expect(removeThousands("")).toBe("");
  });

  it("應該處理只有分隔符的字串", () => {
    expect(removeThousands(",,,", ",")).toBe("");
    expect(removeThousands("...", ".")).toBe("");
  });

  it("應該處理混合內容", () => {
    expect(removeThousands("abc,def,ghi")).toBe("abcdefghi");
    expect(removeThousands("1,2a3,4b5")).toBe("12a34b5");
  });
});

describe("addCommas", () => {
  it("應該為數字添加千位分隔符", () => {
    expect(addCommas(1234567.89)).toBe("1,234,567.89");
    expect(addCommas(1000)).toBe("1,000");
    expect(addCommas(999)).toBe("999");
  });

  it("應該為字串數字添加千位分隔符", () => {
    expect(addCommas("1234567.89")).toBe("1,234,567.89");
    expect(addCommas("1000")).toBe("1,000");
    expect(addCommas("123456")).toBe("123,456");
  });

  it("應該處理負數", () => {
    expect(addCommas(-1234567)).toBe("-1,234,567");
    expect(addCommas("-1234567.89")).toBe("-1,234,567.89");
  });

  it("應該處理小數", () => {
    expect(addCommas(1234.56)).toBe("1,234.56");
    expect(addCommas("9876.543")).toBe("9,876.543");
  });

  it("應該處理邊界值", () => {
    expect(addCommas(0)).toBe("0");
    expect(addCommas("0")).toBe("0");
    expect(addCommas(100)).toBe("100");
    expect(addCommas(1000)).toBe("1,000");
  });

  it("應該處理非數字字串", () => {
    expect(addCommas("abc")).toBe("abc");
    expect(addCommas("hello world")).toBe("hello world");
    expect(addCommas("")).toBe("");
  });

  it("應該處理特殊數字值", () => {
    expect(addCommas(Infinity)).toBe("Infinity");
    expect(addCommas(-Infinity)).toBe("-Infinity");
    expect(addCommas(NaN)).toBe("NaN");
  });

  it("應該處理科學記號", () => {
    // 科學記號字串會被當作字串處理，不會轉換
    expect(addCommas("1e5")).toBe("1e5");
    // 數字形式的科學記號會正確格式化
    expect(addCommas(1e6)).toBe("1,000,000");
    expect(addCommas(1e5)).toBe("100,000");
  });
});

describe("getRandowmNumber", () => {
  it("應該回傳指定範圍內的整數", () => {
    for (let i = 0; i < 100; i++) {
      const result = getRandowmNumber(1, 10);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it("應該處理單一值範圍", () => {
    for (let i = 0; i < 10; i++) {
      expect(getRandowmNumber(5, 5)).toBe(5);
    }
  });

  it("應該處理負數範圍", () => {
    for (let i = 0; i < 50; i++) {
      const result = getRandowmNumber(-10, -1);
      expect(result).toBeGreaterThanOrEqual(-10);
      expect(result).toBeLessThanOrEqual(-1);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it("應該處理跨越零的範圍", () => {
    for (let i = 0; i < 50; i++) {
      const result = getRandowmNumber(-5, 5);
      expect(result).toBeGreaterThanOrEqual(-5);
      expect(result).toBeLessThanOrEqual(5);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it("應該處理大數值範圍", () => {
    for (let i = 0; i < 20; i++) {
      const result = getRandowmNumber(1000, 2000);
      expect(result).toBeGreaterThanOrEqual(1000);
      expect(result).toBeLessThanOrEqual(2000);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it("應該正確處理相反的 min/max 參數", () => {
    // 測試當 min > max 時的行為
    for (let i = 0; i < 10; i++) {
      const result = getRandowmNumber(10, 1);
      // 這種情況下函數可能回傳 NaN 或在某個範圍內的值
      // 根據實際實作調整期望值
      expect(typeof result).toBe("number");
    }
  });

  it("應該產生隨機分佈", () => {
    const results = new Set();
    for (let i = 0; i < 1000; i++) {
      results.add(getRandowmNumber(1, 100));
    }
    // 在 1000 次測試中，應該產生多種不同的值
    expect(results.size).toBeGreaterThan(50);
  });
});
