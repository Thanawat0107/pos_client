export interface contentRequest {
  userRole: string;
  userId?: string;
  guestToken?: string;
  pageNumber?: number;
  pageSize?: number;
}