export interface CreateMenuItemOption {
  name: string;
  isRequired: boolean;
  isMultiple: boolean;
  displayOrder: number;

  menuItemId: number;
}