import { z } from "zod";

export const resultSchema = <T, E = string>(
  valueSchema: z.ZodType<T>,
  errorSchema: z.ZodType<E>,
) =>
  z.union([
    z
      .object({
        success: z.literal(true),
        value: valueSchema,
      })
      .readonly(),
    z
      .object({
        success: z.literal(false),
        error: errorSchema,
      })
      .readonly(),
  ]);

export type Result<T, E = string> = z.infer<
  ReturnType<typeof resultSchema<T, E>>
>;
export type SuccessResult<T> = Extract<Result<T>, { success: true }>;
export type FailureResult<E> = Extract<Result<never, E>, { success: false }>;

export const resultCreateSuccess = <T>(value: T): SuccessResult<T> =>
  ({
    success: true,
    value,
  }) as SuccessResult<T>;

export const resultCreateFailure = <E>(error: E): FailureResult<E> =>
  ({
    success: false,
    error,
  }) as FailureResult<E>;

export const resultIsSuccess = <T, E>(r: Result<T, E>): r is SuccessResult<T> =>
  r.success;
export const resultIsFailure = <T, E>(r: Result<T, E>): r is FailureResult<E> =>
  !r.success;

export const resultMap = <T, U, E>(
  r: Result<T, E>,
  fn: (t: T) => U,
): Result<U, E> => (resultIsSuccess(r) ? resultCreateSuccess(fn(r.value)) : r);

export const resultFlatMap = <T, U, E>(
  r: Result<T, E>,
  fn: (t: T) => Result<U, E>,
): Result<U, E> => (resultIsSuccess(r) ? fn(r.value) : r);
