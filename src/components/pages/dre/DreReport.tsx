"use client";
import { useState } from "react";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { TDreData } from "@/types/financial/chartofaccounts.type";
import Button from "@/components/ui/button/Button";

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
    }).format(value ?? 0);
}

export default function DreReport() {
    const [data, setData] = useState<TDreData | null>(null);
    const [loading, setLoading] = useState(false);
    
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [regime, setRegime] = useState<"caixa" | "competencia">("competencia");

    const handleGenerate = () => {
        if (!startDate || !endDate) {
            resolveResponse({ 
                status: 400, 
                response: { data: { result: { message: "Por favor, preencha as datas" } } } 
            });
            return;
        }

        setLoading(true);
        api
        .get(`/dre?startDate=${startDate}&endDate=${endDate}&regime=${regime}`, configApi())
        .then((res) => {
            setData(res.data?.result?.data ?? null);
        })
        .catch((error) => {
            resolveResponse(error);
            setData(null);
        })
        .finally(() => setLoading(false));
    };

    const DreRow = ({ label, value, level = 0, bold = false, highlight = false }: any) => (
        <div 
        className={`flex justify-between py-2 px-4 ${
            level > 0 ? `pl-${4 + (level * 4)}` : ""
        } ${highlight ? "bg-blue-50 dark:bg-blue-900/20 font-semibold" : ""} ${
            bold ? "font-semibold" : ""
        }`}
        >
        <span className={`${bold ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
            {label}
        </span>
        <span className={`${value >= 0 ? "text-gray-900 dark:text-white" : "text-red-600 dark:text-red-400"} ${bold ? "font-bold" : ""}`}>
            {formatCurrency(value)}
        </span>
        </div>
    );

    return (
        <div className="space-y-6">
        {/* Filtros */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                Filtros
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Inicial
                </label>
                <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Final
                </label>
                <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Regime
                </label>
                <select
                value={regime}
                onChange={(e) => setRegime(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400"
                >
                <option value="competencia">Competência</option>
                <option value="caixa">Caixa</option>
                </select>
            </div>
            <div className="flex items-end">
                <Button disabled={loading} size="sm" variant="primary" onClick={handleGenerate}>{loading ? "Gerando..." : "Gerar DRE"}</Button>
                {/* <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600">
                {loading ? "Gerando..." : "Gerar DRE"}
                </button> */}
            </div>
            </div>
        </div>

        {data && (
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
            <div className="border-b border-gray-200 p-6 dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Demonstração do Resultado do Exercício (DRE)
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Período: {data.periodo.inicio} a {data.periodo.fim} • Regime: {data.periodo.regime === "caixa" ? "Caixa" : "Competência"}
                </p>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                <DreRow label="RECEITA BRUTA DE VENDAS" value={data.valores.receitaBruta} bold />
                <DreRow label="(-) Deduções e Impostos" value={-data.valores.deducoes} level={1} />
                <DreRow label="(=) RECEITA LÍQUIDA" value={data.valores.receitaLiquida} bold highlight />
                
                <DreRow label="(-) Custo da Mercadoria Vendida (CMV)" value={-data.valores.cmv} level={1} />
                <DreRow label="(=) LUCRO BRUTO" value={data.valores.lucroBruto} bold highlight />
                
                <DreRow label="(-) DESPESAS OPERACIONAIS" value={-data.valores.despesasOperacionais.total} bold />
                <DreRow label="Despesas Administrativas" value={-data.valores.despesasOperacionais.administrativas} level={1} />
                <DreRow label="Despesas Comerciais" value={-data.valores.despesasOperacionais.comerciais} level={1} />
                <DreRow label="Despesas Financeiras" value={-data.valores.despesasOperacionais.financeiras} level={1} />
                
                <DreRow label="(=) RESULTADO OPERACIONAL (EBITDA)" value={data.valores.resultadoOperacional} bold highlight />
                <DreRow label="(-) Impostos (IRPJ/CSLL)" value={-data.valores.impostos} level={1} />
                <DreRow label="(=) LUCRO/PREJUÍZO LÍQUIDO" value={data.valores.lucroLiquido} bold highlight />
            </div>

            <div className="border-t border-gray-200 p-6 dark:border-gray-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Indicadores</h4>
                <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Margem Bruta</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.indicadores.margemBruta.toFixed(2)}%</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Margem Líquida</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.indicadores.margemLiquida.toFixed(2)}%</p>
                </div>
                </div>
            </div>
            </div>
        )}

        {!data && !loading && (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-white/3">
            <p className="text-gray-500 dark:text-gray-400">
                Selecione o período e clique em "Gerar DRE" para visualizar o relatório.
            </p>
            </div>
        )}
        </div>
    );
}