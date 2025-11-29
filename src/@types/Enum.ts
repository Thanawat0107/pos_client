export const SD_Roles = {
  Admin: "admin",
  Customer: "customer",
  Employee: "exployee",
} as const;

export type SD_Roles = (typeof SD_Roles)[keyof typeof SD_Roles];

export const SD_OrderStatus = {
  InProgress: "inProgress",
  Ordered: "ordered",
  Cooking: "cooking",
  Ready: "ready",
  Served: "served",
  Paid: "paid",
  Cancelled: "cancelled",
  Closed: "closed",
} as const;

export type SD_OrderStatus = (typeof SD_OrderStatus)[keyof typeof SD_OrderStatus];