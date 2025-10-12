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

export const createSuccessResult = <T>(value: T): SuccessResult<T> =>
  ({
    success: true,
    value,
  }) as SuccessResult<T>;

export const createFailureResult = <E>(error: E): FailureResult<E> =>
  ({
    success: false,
    error,
  }) as FailureResult<E>;
