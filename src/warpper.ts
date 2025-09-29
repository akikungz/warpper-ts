/** A function that takes any number of arguments and returns a promise or a value. */
export type CallbackFunction<TResult extends unknown = unknown, TArgs extends unknown[] = unknown[]> = (...args: TArgs) => Promise<TResult> | TResult;

/**
 * Executes a callback function and returns a promise that resolves with a tuple containing an error (if any) and the result.
 * It supports both synchronous and asynchronous functions.
 * @param callback The original callback function to wrap.
 * @param args The arguments to pass to the callback function.
 * @returns A promise that resolves with the result of the callback function or an error as a tuple.
 */
export const warpper = async <
  TFunction extends (...args: any[]) => any,
  TError extends Error = Error,
  TResult = ReturnType<TFunction> extends Promise<infer U> ? U : ReturnType<TFunction>
>(callback: TFunction, args?: Parameters<TFunction>): Promise<[TError | null, TResult]> => {
  try {
    const result = await callback(...(args || []));
    return [null, result as TResult];
  } catch (error) {
    if (error instanceof Error) {
      return [error as TError, null as TResult];
    }

    const newError = new Error(
      JSON.stringify({
        message: `Unknown error: from ${callback.name || 'anonymous function'}`,
        args,
        error,
      }),
      { cause: error }
    );

    return [newError as TError, null as TResult];
  }
}
