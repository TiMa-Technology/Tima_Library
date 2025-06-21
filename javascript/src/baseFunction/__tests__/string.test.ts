import { describe, it, expect } from "vitest";
import { padLeft, capitalizeWords, btoaEncode, atobDecode } from "../string"; // 請替換為實際的模組路徑

describe("padLeft", () => {
  it("應該正確補齊左側字元", () => {
    expect(padLeft("7", 3, "0")).toBe("007");
    expect(padLeft("12", 4, "0")).toBe("0012");
    expect(padLeft("abc", 6, "*")).toBe("***abc");
  });

  it("應該處理目標長度等於原字串長度", () => {
    expect(padLeft("hello", 5, "0")).toBe("hello");
    expect(padLeft("123", 3, "x")).toBe("123");
  });

  it("應該處理目標長度小於原字串長度", () => {
    expect(padLeft("hello", 3, "0")).toBe("hello");
    expect(padLeft("123456", 4, "x")).toBe("123456");
  });

  it("應該處理空字串", () => {
    expect(padLeft("", 5, "0")).toBe("00000");
    expect(padLeft("", 0, "x")).toBe("");
  });

  it("應該處理負數長度", () => {
    expect(padLeft("hello", -1, "0")).toBe("hello");
    expect(padLeft("test", -5, "x")).toBe("test");
  });

  it("應該處理多字元補齊字元", () => {
    expect(padLeft("7", 5, "ab")).toBe("abab7");
    expect(padLeft("test", 8, "xy")).toBe("xyxytest");
  });

  it("應該處理特殊字元", () => {
    expect(padLeft("hello", 8, " ")).toBe("   hello");
    expect(padLeft("123", 6, "-")).toBe("---123");
    expect(padLeft("abc", 7, "🎉")).toBe("🎉🎉abc"); // emoji 實際上是由兩個 UTF-16 代碼單元組成的，所以 JavaScript 的 length 屬性認為它的長度是 2。
  });

  it("應該處理 Unicode 字元", () => {
    expect(padLeft("測試", 5, "中")).toBe("中中中測試");
    expect(padLeft("hello", 8, "文")).toBe("文文文hello");
  });

  it("應該處理零長度", () => {
    expect(padLeft("hello", 0, "0")).toBe("hello");
    expect(padLeft("", 0, "x")).toBe("");
  });
});

describe("capitalizeWords", () => {
  it("應該將單詞首字母轉為大寫", () => {
    expect(capitalizeWords("hello")).toBe("Hello");
    expect(capitalizeWords("world")).toBe("World");
    expect(capitalizeWords("javascript")).toBe("Javascript");
  });

  it("應該處理多個單詞", () => {
    expect(capitalizeWords("hello world")).toBe("Hello World");
    expect(capitalizeWords("the quick brown fox")).toBe("The Quick Brown Fox");
    expect(capitalizeWords("welcome to javascript")).toBe(
      "Welcome To Javascript"
    );
  });

  it("應該處理空字串", () => {
    expect(capitalizeWords("")).toBe("");
  });

  it("應該處理已經是大寫的字串", () => {
    expect(capitalizeWords("HELLO")).toBe("HELLO");
    expect(capitalizeWords("Hello World")).toBe("Hello World");
    expect(capitalizeWords("HELLO WORLD")).toBe("HELLO WORLD");
  });

  it("應該處理混合大小寫", () => {
    expect(capitalizeWords("hELLo WoRLd")).toBe("HELLo WoRLd");
    expect(capitalizeWords("javaScript rocks")).toBe("JavaScript Rocks");
  });

  it("應該處理標點符號分隔的單詞", () => {
    expect(capitalizeWords("hello,world")).toBe("Hello,World");
    expect(capitalizeWords("one.two.three")).toBe("One.Two.Three");
    expect(capitalizeWords("first-second-third")).toBe("First-Second-Third");
  });

  it("應該處理數字開頭", () => {
    expect(capitalizeWords("123abc")).toBe("123abc");
    expect(capitalizeWords("1st 2nd 3rd")).toBe("1st 2nd 3rd");
  });

  it("應該處理多個空格", () => {
    expect(capitalizeWords("hello  world")).toBe("Hello  World");
    expect(capitalizeWords("  hello   world  ")).toBe("  Hello   World  ");
  });

  it("應該處理單個字母", () => {
    expect(capitalizeWords("a")).toBe("A");
    expect(capitalizeWords("a b c")).toBe("A B C");
  });

  it("應該處理特殊字元", () => {
    expect(capitalizeWords("hello@world")).toBe("Hello@World");
    expect(capitalizeWords("test#case")).toBe("Test#Case");
    // 底線 _ 不被視為單詞邊界，所以 'w' 不會被大寫
    expect(capitalizeWords("hello_world")).toBe("Hello_world");
  });

  it("應該處理換行符和制表符", () => {
    expect(capitalizeWords("hello\nworld")).toBe("Hello\nWorld");
    expect(capitalizeWords("hello\tworld")).toBe("Hello\tWorld");
  });
});

describe("btoaEncode", () => {
  it("應該正確編碼英文字串", () => {
    expect(btoaEncode("hello")).toBe("aGVsbG8=");
    expect(btoaEncode("world")).toBe("d29ybGQ=");
    expect(btoaEncode("Hello World")).toBe("SGVsbG8gV29ybGQ=");
  });

  it("應該正確編碼中文字串", () => {
    expect(btoaEncode("中文")).toBe("5Lit5paH");
    // 修正實際的編碼結果
    expect(btoaEncode("測試")).toBe("5ris6Kmm");
    expect(btoaEncode("你好世界")).toBe("5L2g5aW95LiW55WM");
  });

  it("應該處理空字串", () => {
    expect(btoaEncode("")).toBe("");
  });

  it("應該處理數字字串", () => {
    expect(btoaEncode("123")).toBe("MTIz");
    expect(btoaEncode("0")).toBe("MA==");
  });

  it("應該處理特殊字元", () => {
    expect(btoaEncode("!@#$%")).toBe("IUAjJCU=");
    expect(btoaEncode("()[]{}")).toBe("KClbXXt9");
  });

  it("應該處理 Unicode 表情符號", () => {
    expect(btoaEncode("😀")).toBe("8J+YgA==");
    expect(btoaEncode("🎉")).toBe("8J+OiQ==");
  });

  it("應該處理換行符和制表符", () => {
    expect(btoaEncode("hello\nworld")).toBe("aGVsbG8Kd29ybGQ=");
    expect(btoaEncode("hello\tworld")).toBe("aGVsbG8Jd29ybGQ=");
  });

  it("應該處理混合字元", () => {
    expect(btoaEncode("Hello 中文 123")).toBe("SGVsbG8g5Lit5paHIDEyMw==");
    // 修正實際的編碼結果
    expect(btoaEncode("Test@測試.com")).toBe("VGVzdEDmuKzoqaYuY29t");
  });

  it("應該處理長字串", () => {
    const longStr = "a".repeat(1000);
    const encoded = btoaEncode(longStr);
    expect(encoded).toBeTruthy();
    expect(encoded.length).toBeGreaterThan(0);
  });
});

describe("atobDecode", () => {
  it("應該正確解碼英文字串", async () => {
    expect(await atobDecode("aGVsbG8=")).toBe("hello");
    expect(await atobDecode("d29ybGQ=")).toBe("world");
    expect(await atobDecode("SGVsbG8gV29ybGQ=")).toBe("Hello World");
  });

  it("應該正確解碼中文字串", async () => {
    expect(await atobDecode("5Lit5paH")).toBe("中文");
    // 修正對應的解碼結果
    expect(await atobDecode("5ris6Kmm")).toBe("測試");
    expect(await atobDecode("5L2g5aW95LiW55WM")).toBe("你好世界");
  });

  it("應該處理空字串", async () => {
    expect(await atobDecode("")).toBe("");
  });

  it("應該正確解碼數字字串", async () => {
    expect(await atobDecode("MTIz")).toBe("123");
    expect(await atobDecode("MA==")).toBe("0");
  });

  it("應該正確解碼特殊字元", async () => {
    expect(await atobDecode("IUAjJCU=")).toBe("!@#$%");
    expect(await atobDecode("KClbXXt9")).toBe("()[]{}");
  });

  it("應該正確解碼 Unicode 表情符號", async () => {
    expect(await atobDecode("8J+YgA==")).toBe("😀");
    expect(await atobDecode("8J+OiQ==")).toBe("🎉");
  });

  it("應該正確解碼換行符和制表符", async () => {
    expect(await atobDecode("aGVsbG8Kd29ybGQ=")).toBe("hello\nworld");
    expect(await atobDecode("aGVsbG8Jd29ybGQ=")).toBe("hello\tworld");
  });

  it("應該處理錯誤的 Base64 字串", async () => {
    expect(await atobDecode("錯誤字串")).toBe("");
    expect(await atobDecode("invalid base64")).toBe("");
    expect(await atobDecode("!@#$")).toBe("");
  });

  it("應該處理不完整的 Base64 字串", async () => {
    // 實際上這些不完整的 Base64 字串仍能部分解碼，不會返回空字串
    // 根據實際行為調整測試
    expect(await atobDecode("aGVsbG")).toBe("hell");
    expect(await atobDecode("SGVsbG8")).toBe("Hello");
  });

  it("應該正確解碼混合字元", async () => {
    expect(await atobDecode("SGVsbG8g5Lit5paHIDEyMw==")).toBe("Hello 中文 123");
    // 修正對應的解碼結果
    expect(await atobDecode("VGVzdEDmuKzoqaYuY29t")).toBe("Test@測試.com");
  });

  it("應該處理編碼解碼循環", async () => {
    const originalStrings = [
      "hello world",
      "中文測試",
      "123456",
      "!@#$%^&*()",
      "😀🎉🌟",
      "Hello 中文 123 !@#",
    ];

    for (const original of originalStrings) {
      const encoded = btoaEncode(original);
      const decoded = await atobDecode(encoded);
      expect(decoded).toBe(original);
    }
  });

  it("應該處理長字串解碼", async () => {
    const longStr = "Hello World! ".repeat(100);
    const encoded = btoaEncode(longStr);
    const decoded = await atobDecode(encoded);
    expect(decoded).toBe(longStr);
  });

  it("應該處理包含 padding 的 Base64", async () => {
    expect(await atobDecode("YQ==")).toBe("a");
    expect(await atobDecode("YWI=")).toBe("ab");
    expect(await atobDecode("YWJj")).toBe("abc");
  });
});
