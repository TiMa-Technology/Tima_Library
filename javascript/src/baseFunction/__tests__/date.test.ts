import { describe, it, expect, vi } from "vitest";
import { formatDate, convertROCToGregorian, adjustDateTime } from "../date";

vi.mock("./validations", () => ({
  isValidDate: vi.fn((date: string) => {
    if (!date) return false;
    if (date === "0001-01-01T00:00:00") return false;
    // Basic validation - check if it's a valid date format
    const d = new Date(date);
    return !isNaN(d.getTime()) && d.getFullYear() > 1;
  }),
}));

describe("formatDate", () => {
  const testDate = new Date("2025-06-18T14:30:45"); // 星期三

  describe("基本功能測試", () => {
    it("應該返回預設格式 (年/月/日)", () => {
      const result = formatDate(testDate);
      expect(result).toBe("2025/06/18");
    });

    it("應該處理空值", () => {
      expect(formatDate("")).toBe("");
      expect(formatDate(null as any)).toBe("");
      expect(formatDate(undefined as any)).toBe("");
    });

    it("應該處理無效日期字串", () => {
      const result = formatDate("invalid-date");
      expect(result).toBe("");
    });

    it("應該處理無效 Date 物件", () => {
      const result = formatDate(new Date("invalid"));
      expect(result).toBe("");
    });
  });

  describe("不同 components 組合測試", () => {
    it("應該只顯示年份", () => {
      const result = formatDate(testDate, { components: ["year"] });
      expect(result).toBe("2025");
    });

    it("應該顯示年月", () => {
      const result = formatDate(testDate, { components: ["year", "month"] });
      expect(result).toBe("2025/06");
    });

    it("應該顯示完整日期和時間", () => {
      const result = formatDate(testDate, {
        components: ["year", "month", "day", "time"],
      });
      expect(result).toBe("2025/06/18 14:30");
    });

    it("應該顯示日期、時間和秒數", () => {
      const result = formatDate(testDate, {
        components: ["year", "month", "day", "time", "seconds"],
      });
      expect(result).toBe("2025/06/18 14:30:45");
    });

    it("應該顯示日期和星期", () => {
      const result = formatDate(testDate, {
        components: ["year", "month", "day", "weekday"],
      });
      expect(result).toBe("2025/06/18 (三)");
    });

    it("應該顯示完整格式", () => {
      const result = formatDate(testDate, {
        components: ["year", "month", "day", "time", "seconds", "weekday"],
      });
      expect(result).toBe("2025/06/18 14:30:45 (三)");
    });
  });

  describe("自訂分隔符測試", () => {
    it("應該使用 - 作為分隔符", () => {
      const result = formatDate(testDate, { separator: "-" });
      expect(result).toBe("2025-06-18");
    });

    it("應該使用 . 作為分隔符", () => {
      const result = formatDate(testDate, { separator: "." });
      expect(result).toBe("2025.06.18");
    });
  });

  describe("民國紀年測試", () => {
    it("應該轉換為民國年", () => {
      const result = formatDate(testDate, { roc: true });
      expect(result).toBe("114/06/18"); // 2025 - 1911 = 114
    });

    it("民國年小於等於 1 時應該返回空字串", () => {
      const earlyDate = new Date("1911-01-01");
      const result = formatDate(earlyDate, { roc: true });
      expect(result).toBe("");
    });

    it("民國年邊界測試", () => {
      const date1912 = new Date("1912-01-01");
      const result = formatDate(date1912, { roc: true });
      expect(result).toBe("1/01/01");
    });
  });

  describe("中文格式測試 - 布林值", () => {
    it("全部中文化 (useChineseFormat: true)", () => {
      const result = formatDate(testDate, {
        components: ["year", "month", "day", "time", "seconds", "weekday"],
        useChineseFormat: true,
      });
      expect(result).toBe("2025年6月18日 14時30分45秒 星期三");
    });

    it("全部英文格式 (useChineseFormat: false)", () => {
      const result = formatDate(testDate, {
        components: ["year", "month", "day", "time", "seconds", "weekday"],
        useChineseFormat: false,
      });
      expect(result).toBe("2025/06/18 14:30:45 (三)");
    });
  });

  describe("中文格式測試 - 物件設定", () => {
    it("只有日期中文化", () => {
      const result = formatDate(testDate, {
        components: ["year", "month", "day", "time", "weekday"],
        useChineseFormat: { date: true },
      });
      expect(result).toBe("2025年6月18日 14:30 (三)");
    });

    it("只有時間中文化", () => {
      const result = formatDate(testDate, {
        components: ["year", "month", "day", "time", "seconds"],
        useChineseFormat: { time: true },
      });
      expect(result).toBe("2025/06/18 14時30分45秒");
    });

    it("只有星期中文化", () => {
      const result = formatDate(testDate, {
        components: ["year", "month", "day", "weekday"],
        useChineseFormat: { weekday: true },
      });
      expect(result).toBe("2025/06/18 星期三");
    });

    it("日期和星期中文化", () => {
      const result = formatDate(testDate, {
        components: ["year", "month", "day", "time", "weekday"],
        useChineseFormat: { date: true, weekday: true },
      });
      expect(result).toBe("2025年6月18日 14:30 星期三");
    });

    it("時間和星期中文化", () => {
      const result = formatDate(testDate, {
        components: ["year", "month", "day", "time", "seconds", "weekday"],
        useChineseFormat: { time: true, weekday: true },
      });
      expect(result).toBe("2025/06/18 14時30分45秒 星期三");
    });
  });

  describe("民國年 + 中文格式測試", () => {
    it("民國年 + 中文日期格式", () => {
      const result = formatDate(testDate, {
        components: ["year", "month", "day"],
        roc: true,
        useChineseFormat: { date: true },
      });
      expect(result).toBe("114年6月18日");
    });
  });

  describe("字串日期輸入測試", () => {
    it("應該處理 ISO 字串", () => {
      const result = formatDate("2025-06-18T14:30:45");
      expect(result).toBe("2025/06/18");
    });

    it("應該處理短格式字串", () => {
      const result = formatDate("2025-06-18");
      expect(result).toBe("2025/06/18");
    });
  });

  describe("不同星期測試", () => {
    const weekdays = [
      { date: "2025-06-15", day: "星期日", shortDay: "(日)" }, // 星期日
      { date: "2025-06-16", day: "星期一", shortDay: "(一)" }, // 星期一
      { date: "2025-06-17", day: "星期二", shortDay: "(二)" }, // 星期二
      { date: "2025-06-18", day: "星期三", shortDay: "(三)" }, // 星期三
      { date: "2025-06-19", day: "星期四", shortDay: "(四)" }, // 星期四
      { date: "2025-06-20", day: "星期五", shortDay: "(五)" }, // 星期五
      { date: "2025-06-21", day: "星期六", shortDay: "(六)" }, // 星期六
    ];

    weekdays.forEach(({ date, day, shortDay }) => {
      it(`應該正確顯示 ${day}`, () => {
        const chineseResult = formatDate(date, {
          components: ["weekday"],
          useChineseFormat: { weekday: true },
        });
        const englishResult = formatDate(date, {
          components: ["weekday"],
          useChineseFormat: { weekday: false },
        });
        expect(chineseResult).toBe(day);
        expect(englishResult).toBe(shortDay);
      });
    });
  });

  describe("邊界情況測試", () => {
    it("只有時間部分", () => {
      const result = formatDate(testDate, {
        components: ["time", "seconds"],
      });
      expect(result).toBe("14:30:45");
    });

    it("只有星期部分", () => {
      const result = formatDate(testDate, {
        components: ["weekday"],
      });
      expect(result).toBe("(三)");
    });

    it("空的 components 陣列", () => {
      const result = formatDate(testDate, { components: [] });
      expect(result).toBe("");
    });

    it("重複的 components", () => {
      const result = formatDate(testDate, {
        components: ["year", "year", "month"] as any,
      });
      expect(result).toBe("2025/2025/06");
    });
  });

  describe("時間格式測試", () => {
    it("凌晨時間", () => {
      const midnightDate = new Date("2025-06-18T00:05:30");
      const result = formatDate(midnightDate, {
        components: ["time", "seconds"],
      });
      expect(result).toBe("00:05:30");
    });

    it("中午時間", () => {
      const noonDate = new Date("2025-06-18T12:00:00");
      const result = formatDate(noonDate, {
        components: ["time", "seconds"],
        useChineseFormat: { time: true },
      });
      expect(result).toBe("12時0分0秒");
    });
  });
});

describe("convertROCToGregorian", () => {
  describe("基本轉換測試", () => {
    it("應該轉換民國年為西元年", () => {
      expect(convertROCToGregorian("112/10/05")).toBe("2023/10/05");
    });

    it("應該處理不同分隔符號輸入", () => {
      expect(convertROCToGregorian("112.10.05")).toBe("2023/10/05");
      expect(convertROCToGregorian("112-10-05")).toBe("2023/10/05");
    });

    it("應該支援自訂輸出分隔符號", () => {
      expect(convertROCToGregorian("112/10/05", ".")).toBe("2023.10.05");
      expect(convertROCToGregorian("112/10/05", "-")).toBe("2023-10-05");
    });
  });

  describe("邊界情況測試", () => {
    it("應該處理民國元年後", () => {
      expect(convertROCToGregorian("2/01/01")).toBe("1913/01/01");
    });

    it("應該處理大的民國年份", () => {
      expect(convertROCToGregorian("150/12/31")).toBe("2061/12/31");
    });
  });

  describe("錯誤處理測試", () => {
    it("應該處理空字串", () => {
      expect(convertROCToGregorian("")).toBe("");
    });

    it("應該處理格式錯誤的字串", () => {
      expect(convertROCToGregorian("112/10")).toBe("");
      expect(convertROCToGregorian("112/10/05/extra")).toBe("");
    });

    it("應該處理無效年份", () => {
      expect(convertROCToGregorian("0/10/05")).toBe("");
      expect(convertROCToGregorian("-1/10/05")).toBe("");
      expect(convertROCToGregorian("abc/10/05")).toBe("");
    });

    it("應該處理無效日期", () => {
      expect(convertROCToGregorian("112/13/01")).toBe(""); // 無效月份
      expect(convertROCToGregorian("112/02/30")).toBe(""); // 無效日期
    });

    it("應該處理特殊情況", () => {
      expect(convertROCToGregorian("0/01/01")).toBe(""); // 民國 0 年無效
      expect(convertROCToGregorian("1/01/01")).toBe("1912/01/01"); // 民國 1 年有效
      expect(convertROCToGregorian("abc/01/01")).toBe(""); // 非數字年份
      expect(convertROCToGregorian("1/13/01")).toBe(""); // 無效月份
      expect(convertROCToGregorian("1/01/32")).toBe(""); // 無效日期
    });
  });
});

describe("adjustDateTime", () => {
  describe("基本調整測試", () => {
    it("應該加天數", () => {
      expect(adjustDateTime("2025-06-12", { days: 5 })).toBe("2025/06/17");
    });

    it("應該減天數", () => {
      expect(adjustDateTime("2025-07-01", { days: -1 })).toBe("2025/06/30");
    });

    it("應該跨月調整", () => {
      expect(adjustDateTime("2025-06-30", { days: 1 })).toBe("2025/07/01");
    });

    it("應該跨年調整", () => {
      expect(adjustDateTime("2025-12-15", { years: 1, months: 1 })).toBe(
        "2027/01/15"
      );
    });
  });

  describe("時間調整測試", () => {
    it("應該調整小時和分鐘", () => {
      expect(
        adjustDateTime(
          "2025-06-12T10:00:00",
          { hours: 14, minutes: 30 },
          {
            components: ["year", "month", "day", "time"],
          }
        )
      ).toBe("2025/06/13 00:30");
    });

    it("應該跨日調整時間", () => {
      expect(
        adjustDateTime(
          "2025-06-12T00:00:00",
          { hours: -1, seconds: -30 },
          {
            components: ["year", "month", "day", "time", "seconds"],
          }
        )
      ).toBe("2025/06/11 22:59:30");
    });
  });

  describe("年月調整測試", () => {
    it("應該調整年份", () => {
      expect(adjustDateTime("2025-06-12", { years: 2 })).toBe("2027/06/12");
      expect(adjustDateTime("2025-06-12", { years: -2 })).toBe("2023/06/12");
    });

    it("應該調整月份", () => {
      expect(adjustDateTime("2025-06-12", { months: 3 })).toBe("2025/09/12");
      expect(adjustDateTime("2025-06-12", { months: -3 })).toBe("2025/03/12");
    });

    it("應該處理閏年邊界", () => {
      expect(adjustDateTime("2024-02-29", { years: 1 })).toBe("2025/03/01");
    });
  });

  describe("格式選項測試", () => {
    it("應該使用民國年格式", () => {
      expect(adjustDateTime("2025-06-12", { years: -2 }, { roc: true })).toBe(
        "112/06/12"
      );
    });

    it("應該使用自訂分隔符號", () => {
      expect(
        adjustDateTime("2025-06-12", { days: 1 }, { separator: "." })
      ).toBe("2025.06.13");
    });

    it("應該使用中文格式", () => {
      expect(
        adjustDateTime(
          "2025-06-12",
          { days: 0 },
          {
            components: ["year", "month", "day", "weekday"],
            useChineseFormat: true,
          }
        )
      ).toBe("2025年6月12日 星期四");
    });
  });

  describe("複合調整測試", () => {
    it("應該同時調整多個時間單位", () => {
      expect(
        adjustDateTime(
          "2025-01-01T00:00:00",
          {
            years: 1,
            months: 6,
            days: 15,
            hours: 12,
            minutes: 30,
            seconds: 45,
          },
          {
            components: ["year", "month", "day", "time", "seconds"],
          }
        )
      ).toBe("2026/07/16 12:30:45");
    });
  });

  describe("錯誤處理測試", () => {
    it("應該處理無效日期", () => {
      expect(adjustDateTime("invalid-date", { days: 5 })).toBe("");
    });

    it("應該處理特殊日期", () => {
      expect(adjustDateTime("0001-01-01T00:00:00", { days: 5 })).toBe("");
    });

    it("應該處理無效 Date 物件", () => {
      expect(adjustDateTime(new Date("invalid"), { days: 1 })).toBe("");
    });
  });

  describe("Date 物件輸入測試", () => {
    it("應該接受 Date 物件作為輸入", () => {
      const date = new Date("2025-06-12T00:00:00");
      expect(adjustDateTime(date, { days: 5 })).toBe("2025/06/17");
    });
  });

  describe("無調整測試", () => {
    it("應該在沒有調整時回傳原始格式化日期", () => {
      expect(adjustDateTime("2025-06-12")).toBe("2025/06/12");
      expect(adjustDateTime("2025-06-12", {})).toBe("2025/06/12");
    });
  });
});

describe("整合測試", () => {
  it("應該整合使用所有函數", () => {
    // 先調整日期，再用民國年格式顯示
    const adjusted = adjustDateTime("2025-06-12", { months: 6 }, { roc: true });
    expect(adjusted).toBe("114/12/12");
  });

  it("應該轉換民國年再調整", () => {
    const gregorian = convertROCToGregorian("113/06/12");
    expect(gregorian).toBe("2024/06/12");

    const adjusted = adjustDateTime(gregorian, { years: 1 });
    expect(adjusted).toBe("2025/06/12");
  });
});
