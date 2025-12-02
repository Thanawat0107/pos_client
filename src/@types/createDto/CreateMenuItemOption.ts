import type { CreateMenuOptionDetail } from "./CreateMenuOptionDetail";

export interface CreateMenuItemOption {
  name: string;
  isRequired: boolean;
  isMultiple: boolean;

  // menuItemId: number;
  menuItemOptionDetail: CreateMenuOptionDetail[];
}