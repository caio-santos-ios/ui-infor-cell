export type TChartOfAccounts = {
    id: string;
    code: string;
    name: string;
    parentId?: string;
    parentName?: string;
    type: "receita" | "despesa" | "custo";
    dreCategory?: string;
    showInDre: boolean;
    description: string;
    level: number;
    isAnalytical: boolean;
    plan: string;
    company: string;
    createdAt: string;
    updatedAt?: string;
    deleted: boolean;
};

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