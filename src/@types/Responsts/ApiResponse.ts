/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

export type ApiResponse<T> = {
  isSuccess: boolean;
  message?: string;
  result?: T;
  meta?: any;
}