export type TSituation = {
    id?: string;
    name: string;
    currentColor: string;
    style: {
        bg: string;
        border: string;
        text: string;
    };
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
    style: {
        bg: "",
        border: "",
        text: ""
    },
    name: "",
    start: false,
    quite: false,
    end: false,
    generateFinancial: false,
    appearsOnPanel: false,
    sequence: 0
}