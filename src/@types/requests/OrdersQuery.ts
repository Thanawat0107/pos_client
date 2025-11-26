export interface OrdersQuery {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
  from?: string;
  to?: string;
  keyword?: string;
  sortBy?: string;
  desc?: boolean;
}