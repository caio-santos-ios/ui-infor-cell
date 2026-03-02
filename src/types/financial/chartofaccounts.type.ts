export type TChartOfAccounts = {
    id: string;
    code: string;
    name: string;
    type: "receita" | "despesa";
    groupDRE: string;
    account: string;
};

export const ResetChartOfAccounts: TChartOfAccounts = {
    id: "",
    code: "",
    name: "",
    type: "receita",
    groupDRE: "",
    account: ""
}

export type TDreData = {
    periodo: {
        inicio: string;
        fim: string;
        regime: "caixa" | "competencia";
    };
    valores: {
        receitaBruta: number;
        deducoes: number;
        receitaLiquida: number;
        cmv: number;
        lucroBruto: number;
        despesasOperacionais: {
            administrativas: number;
            comerciais: number;
            financeiras: number;
            total: number;
        };
        resultadoOperacional: number;
        impostos: number;
        lucroLiquido: number;
    };
    indicadores: {
        margemBruta: number;
        margemLiquida: number;
    };
};