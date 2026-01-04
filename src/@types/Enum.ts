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

// ย้ายมาไว้ที่นี่
export const ContentType = {
  NEWS: "News",
  PROMOTION: "Promotion",
  EVENT: "Event"
} as const;

export type ContentType = typeof ContentType[keyof typeof ContentType];

export const CONTENT_TYPE_OPTIONS = [
  { value: ContentType.NEWS, label: "ข่าวสาร (News)" },
  { value: ContentType.PROMOTION, label: "โปรโมชั่น (Promotion)" },
  { value: ContentType.EVENT, label: "กิจกรรม (Event)" },
];