import { warpper } from "../src/warpper";

describe("Basic Cases", () => {
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

describe("Edge Cases", () => {
  it("should handle functions that return null", async () => {
    const [error, result] = await warpper(() => null);

    expect(error).toBeNull();
    expect(result).toBeNull();
  });

  it("should handle functions that return undefined", async () => {
    const [error, result] = await warpper(() => undefined);

    expect(error).toBeNull();
    expect(result).toBeUndefined();
  });

  it("should handle functions that return 0", async () => {
    const [error, result] = await warpper(() => 0);

    expect(error).toBeNull();
    expect(result).toBe(0);
  });

  it("should handle functions that return false", async () => {
    const [error, result] = await warpper(() => false);

    expect(error).toBeNull();
    expect(result).toBe(false);
  });

  it("should handle functions that return empty string", async () => {
    const [error, result] = await warpper(() => "");

    expect(error).toBeNull();
    expect(result).toBe("");
  });

  it("should handle functions that return empty array", async () => {
    const [error, result] = await warpper(() => []);

    expect(error).toBeNull();
    expect(result).toEqual([]);
  });

  it("should handle functions that return empty object", async () => {
    const [error, result] = await warpper(() => ({}));

    expect(error).toBeNull();
    expect(result).toEqual({});
  });

  it("should handle functions with complex object return types", async () => {
    const complexObject = {
      id: 1,
      name: "test",
      nested: { value: true },
      array: [1, 2, 3]
    };

    const [error, result] = await warpper(() => complexObject);

    expect(error).toBeNull();
    expect(result).toEqual(complexObject);
  });
});

describe("Type Safety and Generics", () => {
  it("should preserve type information for string functions", async () => {
    const stringFunction = (): string => "hello";
    const [error, result] = await warpper(stringFunction);

    expect(error).toBeNull();
    expect(typeof result).toBe("string");
    expect(result).toBe("hello");
  });

  it("should preserve type information for number functions", async () => {
    const numberFunction = (): number => 42;
    const [error, result] = await warpper(numberFunction);

    expect(error).toBeNull();
    expect(typeof result).toBe("number");
    expect(result).toBe(42);
  });

  it("should preserve type information for boolean functions", async () => {
    const booleanFunction = (): boolean => true;
    const [error, result] = await warpper(booleanFunction);

    expect(error).toBeNull();
    expect(typeof result).toBe("boolean");
    expect(result).toBe(true);
  });

  it("should handle functions with multiple parameter types", async () => {
    const multiParamFunction = (str: string, num: number, bool: boolean) => ({
      str,
      num,
      bool
    });

    const [error, result] = await warpper(multiParamFunction, ["test", 123, true]);

    expect(error).toBeNull();
    expect(result).toEqual({ str: "test", num: 123, bool: true });
  });
});

describe("Error Handling", () => {
  it("should handle custom Error instances", async () => {
    class CustomError extends Error {
      constructor(message: string, public code: number) {
        super(message);
        this.name = "CustomError";
      }
    }

    const [error, result] = await warpper(() => {
      throw new CustomError("Custom error message", 500);
    });

    expect(error).toBeInstanceOf(CustomError);
    expect(error?.message).toBe("Custom error message");
    expect((error as any)?.code).toBe(500);
    expect(result).toBeNull();
  });

  it("should handle TypeError instances", async () => {
    const [error, result] = await warpper(() => {
      throw new TypeError("Type error occurred");
    });

    expect(error).toBeInstanceOf(TypeError);
    expect(error?.message).toBe("Type error occurred");
    expect(result).toBeNull();
  });

  it("should handle RangeError instances", async () => {
    const [error, result] = await warpper(() => {
      throw new RangeError("Range error occurred");
    });

    expect(error).toBeInstanceOf(RangeError);
    expect(error?.message).toBe("Range error occurred");
    expect(result).toBeNull();
  });

  it("should handle number rejections", async () => {
    const [error, result] = await warpper(() => {
      throw 404;
    });

    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toContain("Unknown error");
    expect(error?.message).toContain("404");
    expect(result).toBeNull();
  });

  it("should handle object rejections", async () => {
    const errorObject = { code: 500, message: "Internal Server Error" };
    const [error, result] = await warpper(() => {
      throw errorObject;
    });

    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toContain("Unknown error");
    expect(error?.message).toContain("500");
    expect(error?.message).toContain("Internal Server Error");
    expect(result).toBeNull();
  });

  it("should handle null rejections", async () => {
    const [error, result] = await warpper(() => {
      throw null;
    });

    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toContain("Unknown error");
    expect(result).toBeNull();
  });

  it("should handle undefined rejections", async () => {
    const [error, result] = await warpper(() => {
      throw undefined;
    });

    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toContain("Unknown error");
    expect(result).toBeNull();
  });

  it("should include function name in error for named functions", async () => {
    function namedFunction() {
      throw "Named function error";
    }

    const [error, result] = await warpper(namedFunction);

    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toContain("namedFunction");
    expect(result).toBeNull();
  });

  it("should handle anonymous function errors", async () => {
    const [error, result] = await warpper(() => {
      throw "Anonymous function error";
    });

    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toContain("anonymous function");
    expect(result).toBeNull();
  });

  it("should preserve error cause when available", async () => {
    const originalError = new Error("Original error");
    const [error, result] = await warpper(() => {
      throw originalError;
    });

    expect(error).toBe(originalError);
    expect(result).toBeNull();
  });
});

describe("Async and Performance", () => {
  it("should handle Promise.resolve", async () => {
    const [error, result] = await warpper(() => Promise.resolve("resolved"));

    expect(error).toBeNull();
    expect(result).toBe("resolved");
  });

  it("should handle Promise.reject", async () => {
    const [error, result] = await warpper(() => Promise.reject(new Error("rejected")));

    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe("rejected");
    expect(result).toBeNull();
  });

  it("should handle delayed promises", async () => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const [error, result] = await warpper(async () => {
      await delay(50);
      return "delayed result";
    });

    expect(error).toBeNull();
    expect(result).toBe("delayed result");
  });

  it("should handle concurrent warpper calls", async () => {
    const promises = [
      warpper(() => Promise.resolve(1)),
      warpper(() => Promise.resolve(2)),
      warpper(() => Promise.resolve(3))
    ];

    const results = await Promise.all(promises);

    expect(results).toHaveLength(3);
    expect(results[0]).toEqual([null, 1]);
    expect(results[1]).toEqual([null, 2]);
    expect(results[2]).toEqual([null, 3]);
  });

  it("should handle mixed success and failure in concurrent calls", async () => {
    const promises = [
      warpper(() => Promise.resolve("success")),
      warpper(() => Promise.reject(new Error("failure"))),
      warpper(() => Promise.resolve("another success"))
    ];

    const results = await Promise.all(promises);

    expect(results).toHaveLength(3);
    expect(results[0]).toEqual([null, "success"]);
    expect(results[1]).toBeDefined();
    expect(results[1]?.[0]).toBeInstanceOf(Error);
    expect(results[1]?.[1]).toBeNull();
    expect(results[2]).toEqual([null, "another success"]);
  });

  it("should handle functions that throw immediately", async () => {
    const start = Date.now();
    const [error, result] = await warpper(() => {
      throw new Error("Immediate error");
    });
    const duration = Date.now() - start;

    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe("Immediate error");
    expect(result).toBeNull();
    expect(duration).toBeLessThan(10); // Should be very fast
  });

  it("should handle async functions that throw after delay", async () => {
    const [error, result] = await warpper(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      throw new Error("Delayed error");
    });

    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe("Delayed error");
    expect(result).toBeNull();
  });
});

describe("Complex Functions and Classes", () => {
  class TestClass {
    private value: number;

    constructor(value: number) {
      this.value = value;
    }

    getValue(): number {
      return this.value;
    }

    async getValueAsync(): Promise<number> {
      await new Promise(resolve => setTimeout(resolve, 10));
      return this.value;
    }

    setValue(newValue: number): void {
      this.value = newValue;
    }

    throwError(): never {
      throw new Error("Method error");
    }

    static staticMethod(input: string): string {
      return `Static: ${input}`;
    }
  }

  it("should handle class method calls", async () => {
    const instance = new TestClass(42);
    const [error, result] = await warpper(() => instance.getValue());

    expect(error).toBeNull();
    expect(result).toBe(42);
  });

  it("should handle async class method calls", async () => {
    const instance = new TestClass(42);
    const [error, result] = await warpper(() => instance.getValueAsync());

    expect(error).toBeNull();
    expect(result).toBe(42);
  });

  it("should handle class methods that return void", async () => {
    const instance = new TestClass(42);
    const [error, result] = await warpper(() => instance.setValue(100));

    expect(error).toBeNull();
    expect(result).toBeUndefined();
    expect(instance.getValue()).toBe(100);
  });

  it("should handle class methods that throw errors", async () => {
    const instance = new TestClass(42);
    const [error, result] = await warpper(() => instance.throwError());

    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe("Method error");
    expect(result).toBeNull();
  });

  it("should handle static methods", async () => {
    const [error, result] = await warpper(() => TestClass.staticMethod("test"));

    expect(error).toBeNull();
    expect(result).toBe("Static: test");
  });

  it("should handle functions with rest parameters", async () => {
    const sum = (...numbers: number[]) => numbers.reduce((a, b) => a + b, 0);
    const [error, result] = await warpper(sum, [1, 2, 3, 4, 5]);

    expect(error).toBeNull();
    expect(result).toBe(15);
  });

  it("should handle functions with optional parameters", async () => {
    const greet = (name: string, greeting?: string) =>
      `${greeting || "Hello"}, ${name}!`;

    const [error1, result1] = await warpper(greet, ["World"]);
    const [error2, result2] = await warpper(greet, ["World", "Hi"]);

    expect(error1).toBeNull();
    expect(result1).toBe("Hello, World!");
    expect(error2).toBeNull();
    expect(result2).toBe("Hi, World!");
  });

  it("should handle functions with default parameters", async () => {
    const multiply = (a: number, b: number = 2) => a * b;

    const [error1, result1] = await warpper(multiply, [5]);
    const [error2, result2] = await warpper(multiply, [5, 3]);

    expect(error1).toBeNull();
    expect(result1).toBe(10);
    expect(error2).toBeNull();
    expect(result2).toBe(15);
  });

  it("should handle arrow functions", async () => {
    const arrow = (x: number) => x * 2;
    const [error, result] = await warpper(arrow, [21]);

    expect(error).toBeNull();
    expect(result).toBe(42);
  });

  it("should handle function expressions", async () => {
    const funcExpression = function (x: number) { return x + 1; };
    const [error, result] = await warpper(funcExpression, [41]);

    expect(error).toBeNull();
    expect(result).toBe(42);
  });

  it("should handle higher-order functions", async () => {
    const higherOrder = (fn: (x: number) => number, value: number) => fn(value);
    const double = (x: number) => x * 2;

    const [error, result] = await warpper(higherOrder, [double, 21]);

    expect(error).toBeNull();
    expect(result).toBe(42);
  });

  it("should handle functions that return functions", async () => {
    const createMultiplier = (factor: number) => (value: number) => value * factor;
    const [error, result] = await warpper(createMultiplier, [3]);

    expect(error).toBeNull();
    expect(typeof result).toBe("function");
    expect((result as any)(10)).toBe(30);
  });

  it("should handle recursive functions", async () => {
    const factorial = (n: number): number => n <= 1 ? 1 : n * factorial(n - 1);
    const [error, result] = await warpper(factorial, [5]);

    expect(error).toBeNull();
    expect(result).toBe(120);
  });

  it("should handle functions with complex return types", async () => {
    interface User {
      id: number;
      name: string;
      email: string;
      active: boolean;
    }

    const createUser = (id: number, name: string, email: string): User => ({
      id,
      name,
      email,
      active: true
    });

    const [error, result] = await warpper(createUser, [1, "John Doe", "john@example.com"]);

    expect(error).toBeNull();
    expect(result).toEqual({
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      active: true
    });
  });
});
