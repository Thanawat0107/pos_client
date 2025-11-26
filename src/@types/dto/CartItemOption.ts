export interface CartItemOption {
    optionId: number;
    optionGroupId?: number;
    optionValueId?: number;

    optionGroupName: string;
    optionValueName: string;

    optionName: string;
    extraPrice: number;
}