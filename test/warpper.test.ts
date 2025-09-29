import { warpper } from "../src/warpper";

describe("Create Wrapper", () => {
  it("should return result when warpper resolves", async () => {
    const [error, result] = await warpper(() => 42);

    expect(error).toBeNull();
    expect(result).toBe(42);
  });

  it("should return error when warpper rejects", async () => {
    const [error, result] = await warpper(async () => {
      throw new Error("Test error");
    });

    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe("Test error");
    expect(result).toBeNull();
  });

  it("should handle non-Error rejections", async () => {
    const [error, result] = await warpper(async () => {
      throw "String error";
    });

    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toContain("Unknown error");
    expect(result).toBeNull();
  });

  it("should work with synchronous warppers", async () => {
    const [error, result] = await warpper(() => {
      return new Promise((resolve) => setTimeout(() => resolve(100), 100));
    });

    expect(error).toBeNull();
    expect(result).toBe(100);
  });

  it("should work with asynchronous warppers", async () => {
    const [error, result] = await warpper(() => Promise.resolve(200));

    expect(error).toBeNull();
    expect(result).toBe(200);
  });

  it("should pass arguments to the warpper", async () => {
    const add = (a: number, b: number) => a + b;
    const [error, result] = await warpper(add, [5, 7]);

    expect(error).toBeNull();
    expect(result).toBe(12);
  });

  it("should handle warppers with no arguments", async () => {
    const [error, result] = await warpper(() => "No args");

    expect(error).toBeNull();
    expect(result).toBe("No args");
  });

  it("should handle warppers that return void", async () => {
    const [error, result] = await warpper(() => { });

    expect(error).toBeNull();
    expect(result).toBeUndefined();
  });
});
