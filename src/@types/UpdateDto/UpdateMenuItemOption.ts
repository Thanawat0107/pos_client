import type { UpdateMenuOptionDetails } from "./UpdateMenuOptionDetails";

export interface UpdateMenuItemOption {
  id?: number;
  name?: string;
  isRequired?: boolean;
  isMultiple?: boolean;
  isUsed?: boolean;

  menuOptionDetails?: UpdateMenuOptionDetails[];
}