export type TSituationStyle = {
    bg: string;
    border: string;
    text: string;
}

export const ResetSituationStyle: TSituationStyle = {
    bg: "",
    border: "",
    text: ""
}

export type TSituation = {
    id?: string;
    name: string;
    currentColor: string;
    style: TSituationStyle
    start: boolean;
    quite: boolean;
    end: boolean;
    generateFinancial: boolean;
    appearsOnPanel: boolean;
    sequence: number;
}

export const ResetSituation: TSituation = {
    id: "",
    currentColor: "",
    style: ResetSituationStyle,
    name: "",
    start: false,
    quite: false,
    end: false,
    generateFinancial: false,
    appearsOnPanel: false,
    sequence: 0
}