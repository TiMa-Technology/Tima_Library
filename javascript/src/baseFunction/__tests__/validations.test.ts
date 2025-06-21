import { describe, it, expect } from "vitest";
import {
  isValidMac,
  isValidIPv4,
  isNumberString,
  isEmail,
  isValidDate,
  isEmptyGuid,
  isEmptyArray,
  isEmptyObject,
  isEven,
} from "../validations";

describe("isValidMac", () => {
  it("應該驗證有效的 MAC 地址", () => {
    expect(isValidMac("00:1A:2B:3C:4D:5E")).toBe(true);
    expect(isValidMac("FF:FF:FF:FF:FF:FF")).toBe(true);
    expect(isValidMac("aa:bb:cc:dd:ee:ff")).toBe(true);
    expect(isValidMac("12:34:56:78:9A:BC")).toBe(true);
  });

  it("應該拒絕無效的 MAC 地址", () => {
    expect(isValidMac("001A:2B:3C:4D:5E")).toBe(false);
    expect(isValidMac("00:1A:2B:3C:4D")).toBe(false);
    expect(isValidMac("00:1A:2B:3C:4D:5E:FF")).toBe(false);
    expect(isValidMac("GG:1A:2B:3C:4D:5E")).toBe(false);
    expect(isValidMac("00-1A-2B-3C-4D-5E")).toBe(false);
    expect(isValidMac("")).toBe(false);
    expect(isValidMac("invalid")).toBe(false);
  });
});

describe("isValidIPv4", () => {
  it("應該驗證有效的 IPv4 地址", () => {
    expect(isValidIPv4("192.168.0.1")).toBe(true);
    expect(isValidIPv4("0.0.0.0")).toBe(true);
    expect(isValidIPv4("255.255.255.255")).toBe(true);
    expect(isValidIPv4("127.0.0.1")).toBe(true);
    expect(isValidIPv4("10.0.0.1")).toBe(true);
    expect(isValidIPv4("172.16.0.1")).toBe(true);
  });

  it("應該拒絕無效的 IPv4 地址", () => {
    expect(isValidIPv4("256.256.256.256")).toBe(false);
    expect(isValidIPv4("192.168.0")).toBe(false);
    expect(isValidIPv4("192.168.0.1.1")).toBe(false);
    expect(isValidIPv4("192.168.-1.1")).toBe(false);
    expect(isValidIPv4("192.168.0.a")).toBe(false);
    expect(isValidIPv4("")).toBe(false);
    expect(isValidIPv4("invalid")).toBe(false);
  });
});

describe("isNumberString", () => {
  it("應該驗證純數字字串", () => {
    expect(isNumberString("12345")).toBe(true);
    expect(isNumberString("0")).toBe(true);
    expect(isNumberString("999999")).toBe(true);
    expect(isNumberString("1")).toBe(true);
  });

  it("應該拒絕包含非數字字符的字串", () => {
    expect(isNumberString("123a45")).toBe(false);
    expect(isNumberString("12.34")).toBe(false);
    expect(isNumberString("-123")).toBe(false);
    expect(isNumberString("+123")).toBe(false);
    expect(isNumberString("123 456")).toBe(false);
    expect(isNumberString("")).toBe(false);
    expect(isNumberString("abc")).toBe(false);
  });
});

describe("isEmail", () => {
  it("應該驗證有效的電子郵件地址", () => {
    expect(isEmail("test@example.com")).toBe(true);
    expect(isEmail("user.name@domain.co.uk")).toBe(true);
    expect(isEmail("test123@test123.org")).toBe(true);
    expect(isEmail("user+tag@example.com")).toBe(true);
    expect(isEmail("user_name@example.com")).toBe(true);
    expect(isEmail("user-name@example.com")).toBe(true);
  });

  it("應該拒絕無效的電子郵件地址", () => {
    expect(isEmail("test@.com")).toBe(false);
    expect(isEmail("test@")).toBe(false);
    expect(isEmail("@example.com")).toBe(false);
    expect(isEmail("test.example.com")).toBe(false);
    expect(isEmail("test@example")).toBe(false);
    expect(isEmail("")).toBe(false);
    expect(isEmail("invalid")).toBe(false);
    expect(isEmail("test@example.")).toBe(false);
  });
});

describe("isValidDate", () => {
  it("應該驗證有效的日期字串", () => {
    expect(isValidDate("2023-10-05")).toBe(true);
    expect(isValidDate("2023/10/05")).toBe(true);
    expect(isValidDate("2024-02-29")).toBe(true); // 閏年
    expect(isValidDate("2023-01-01")).toBe(true);
    expect(isValidDate("2023-12-31")).toBe(true);
  });

  it("應該拒絕無效的日期字串", () => {
    expect(isValidDate("0001-01-01T00:00:00")).toBe(false); // C# DateTime.MinValue
    expect(isValidDate("2023-13-05")).toBe(false); // 無效月份
    expect(isValidDate("2023-02-30")).toBe(false); // 無效日期
    expect(isValidDate("2023-02-29")).toBe(false); // 非閏年的2月29日
    expect(isValidDate("2023-00-05")).toBe(false); // 無效月份
    expect(isValidDate("2023-01-00")).toBe(false); // 無效日期
    expect(isValidDate("")).toBe(false);
    expect(isValidDate("invalid")).toBe(false);
    expect(isValidDate("23-10-05")).toBe(false); // 年份格式錯誤
  });

  it("應該處理空值和特殊情況", () => {
    expect(isValidDate("")).toBe(false);
    expect(isValidDate("0001-01-01T00:00:00")).toBe(false);
  });
});

describe("isEmptyGuid", () => {
  it("應該識別空的 GUID", () => {
    expect(isEmptyGuid("00000000-0000-0000-0000-000000000000")).toBe(true);
    expect(isEmptyGuid("")).toBe(true);
  });

  it("應該識別非空的 GUID", () => {
    expect(isEmptyGuid("123e4567-e89b-12d3-a456-426614174000")).toBe(false);
    expect(isEmptyGuid("12345678-1234-1234-1234-123456789abc")).toBe(false);
  });
});

describe("isEmptyArray", () => {
  it("應該識別空陣列", () => {
    expect(isEmptyArray([])).toBe(true);
  });

  it("應該識別非空陣列", () => {
    expect(isEmptyArray([1])).toBe(false);
    expect(isEmptyArray([1, 2, 3])).toBe(false);
    expect(isEmptyArray(["a"])).toBe(false);
    expect(isEmptyArray([null])).toBe(false);
    expect(isEmptyArray([undefined])).toBe(false);
    expect(isEmptyArray([{}])).toBe(false);
    expect(isEmptyArray(new Array(5))).toBe(false); // 空的 iterable array 應該要被視為非空陣列
  });
});

describe("isEmptyObject", () => {
  it("應該識別空物件", () => {
    expect(isEmptyObject({})).toBe(true);
    expect(isEmptyObject(new Object())).toBe(true);
  });

  it("應該識別非空物件", () => {
    expect(isEmptyObject({ a: 1 })).toBe(false);
    expect(isEmptyObject({ a: 1, b: 2 })).toBe(false);
    expect(isEmptyObject({ key: "value" })).toBe(false);
    expect(isEmptyObject({ nested: {} })).toBe(false);
    expect(isEmptyObject({ arr: [] })).toBe(false);
    expect(isEmptyObject({ nullValue: null })).toBe(false);
    expect(isEmptyObject({ undefinedValue: undefined })).toBe(false);
  });
});

describe("isEven", () => {
  it("應該識別偶數", () => {
    expect(isEven(2)).toBe(true);
    expect(isEven(0)).toBe(true);
    expect(isEven(4)).toBe(true);
    expect(isEven(100)).toBe(true);
    expect(isEven(-2)).toBe(true);
    expect(isEven(-4)).toBe(true);
  });

  it("應該識別奇數", () => {
    expect(isEven(1)).toBe(false);
    expect(isEven(3)).toBe(false);
    expect(isEven(5)).toBe(false);
    expect(isEven(99)).toBe(false);
    expect(isEven(-1)).toBe(false);
    expect(isEven(-3)).toBe(false);
  });
});
