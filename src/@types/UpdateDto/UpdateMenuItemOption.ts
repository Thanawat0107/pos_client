export interface UpdateMenuItemOption {
  id: number;
  name: string;
  isRequired: boolean;
  isMultiple: boolean;
  isUsed: boolean;
  displayOrder: number;

  menuItemId: number;
}