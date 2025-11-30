import type { ApiResponse } from "../@types/Responsts/ApiResponse";

export const unwrapResult = <T,>(response: ApiResponse<T>): T => {
  if (response.result !== undefined && response.result !== null) {
    return response.result;
  }
  throw new Error(response.message || "Unknown error");
};
