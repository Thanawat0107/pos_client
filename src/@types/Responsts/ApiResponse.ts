/* eslint-disable @typescript-eslint/no-explicit-any */

export type ApiResponse<T, M = unknown> = {
  isSuccess: boolean;
  message?: string;
  result?: T;
  meta?: M;
};