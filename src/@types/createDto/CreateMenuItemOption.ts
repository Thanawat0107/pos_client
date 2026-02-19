import type { CreateMenuOptionDetail } from "./CreateMenuOptionDetail";

export interface CreateMenuItemOption {
  name: string;
  isRequired: boolean;
  isMultiple: boolean;
  isUsed: boolean;

  menuOptionDetails: CreateMenuOptionDetail[];
}