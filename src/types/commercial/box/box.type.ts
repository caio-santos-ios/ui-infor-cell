export type TBox = {
    id: string;
    openingValue: number;
    closingValue: number;
    twoSteps: string;
}

export const ResetBox: TBox = {
    id: "",
    openingValue: 0,
    closingValue: 0,
    twoSteps: "no"
}

export type TBoxSettings = {
    id: string;
    valueSettings: number;
}

export const ResetBoxSettings: TBoxSettings = {
    id: "",
    valueSettings: 0,
}