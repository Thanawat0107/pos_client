import type { UpdateMenuOptionDetail } from "./UpdateMenuOptionDetail";

export interface UpdateMenuItemOption {
  id: number;
  name: string;
  isRequired: boolean;
  isMultiple: boolean;
  isUsed: boolean;

  menuItemOptionDetail: UpdateMenuOptionDetail[];
}