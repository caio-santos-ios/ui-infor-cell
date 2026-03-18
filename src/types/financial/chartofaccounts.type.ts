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

// ── DRE Types ─────────────────────────────────────────────────────────────────

export type TDreContaLinha = {
    id: string;
    code: string;
    name: string;
    valoresMes: Record<string, number>;
    total: number;
};

/** Subgrupo filho (ex: "rec_vendas", "imp_vendas") */
export type TDreSubGrupo = {
    key: string;
    label: string;
    isParent: false;
    linhas: TDreContaLinha[];
    totalMes: Record<string, number>;
    total: number;
};

/** Grupo pai (ex: "rec_bruta", "deducoes") */
export type TDreGrupoPai = {
    key: string;
    label: string;
    isParent: true;
    subGrupos: TDreSubGrupo[];
    totalMes: Record<string, number>;
    total: number;
};

export type TDreTotalizador = {
    mes: Record<string, number>;
    total: number;
};

export type TDreTotalizadores = {
    receitaBruta:   TDreTotalizador;
    deducoes:       TDreTotalizador;
    receitaLiquida: TDreTotalizador;
    custos:         TDreTotalizador;
    lucroBruto:     TDreTotalizador;
    despesasOp:     TDreTotalizador;
    resultadoOp:    TDreTotalizador;
    despesasFin:    TDreTotalizador;
    resultadoFin:   TDreTotalizador;
    outrasDespesas: TDreTotalizador;
    outrasReceitas: TDreTotalizador;
    receitasFinanc: TDreTotalizador;
    lucroLiquido:   TDreTotalizador;
};

export type TDreData = {
    periodo: {
        inicio: string;
        fim:    string;
        regime: "caixa" | "competencia";
    };
    meses: string[];
    secoes: {
        receitas: TDreGrupoPai[];
        despesas: TDreGrupoPai[];
    };
    totalizadores: TDreTotalizadores;
    indicadores: {
        margemBruta:   number;
        margemLiquida: number;
    };
};