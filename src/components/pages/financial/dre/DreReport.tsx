"use client";

import { useState, Fragment } from "react";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import {
    TDreData, TDreGrupoPai, TDreSubGrupo, TDreTotalizador
} from "@/types/financial/chartofaccounts.type";
import Button from "@/components/ui/button/Button";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function fmt(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency", currency: "BRL", minimumFractionDigits: 2,
    }).format(value ?? 0);
}

function getUltimos3Meses() {
    const hoje = new Date();
    const fim   = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1);
    return {
        start: inicio.toISOString().split("T")[0],
        end:   fim.toISOString().split("T")[0],
    };
}

const colorPos  = "text-emerald-600 dark:text-emerald-400";
const colorNeg  = "text-red-500 dark:text-red-400";
const colorZero = "text-gray-400 dark:text-gray-600";

function colorVal(v: number, invert = false) {
    if (v === 0) return colorZero;
    if (invert)  return v > 0 ? colorNeg : colorPos;
    return v > 0 ? colorPos : colorNeg;
}

function colorTot(v: number) {
    if (v === 0)  return "text-gray-500 dark:text-gray-400 font-semibold";
    if (v > 0)    return "text-emerald-600 dark:text-emerald-400 font-bold";
    return "text-red-500 dark:text-red-400 font-bold";
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componentes
// ─────────────────────────────────────────────────────────────────────────────

function TotRow({
    label, tot, meses, variant = "default",
}: {
    label: string;
    tot: TDreTotalizador;
    meses: string[];
    variant?: "default" | "result" | "final";
}) {
    const bg =
        variant === "final"  ? "bg-gray-900 dark:bg-gray-950" :
        variant === "result" ? "bg-blue-50 dark:bg-blue-900/20" :
        "bg-gray-50 dark:bg-gray-800/40";

    const textLabel =
        variant === "final" ? "text-white font-bold" : "text-gray-900 dark:text-white font-bold";

    return (
        <tr className={`border-t-2 border-gray-300 dark:border-gray-600 ${bg}`}>
            <td className={`sticky left-0 z-10 py-3 px-4 text-sm ${textLabel} ${bg}`}>
                {label}
            </td>
            {meses.map((m) => (
                <td key={m} className={`py-3 px-4 text-right text-sm ${variant === "final" ? "text-white font-bold" : colorTot(tot.mes[m] ?? 0)}`}>
                    {fmt(tot.mes[m] ?? 0)}
                </td>
            ))}
            <td className={`py-3 px-4 text-right text-sm border-l-2 border-gray-300 dark:border-gray-600 ${variant === "final" ? "text-white font-bold" : colorTot(tot.total)}`}>
                {fmt(tot.total)}
            </td>
        </tr>
    );
}

function GrupoPaiRow({
    grupo, meses, isOpen, onToggle, invert,
}: {
    grupo: TDreGrupoPai;
    meses: string[];
    isOpen: boolean;
    onToggle: () => void;
    invert?: boolean;
}) {
    return (
        <tr
            className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={onToggle}
        >
            <td className="sticky left-0 z-10 bg-gray-100 dark:bg-gray-800 py-2.5 px-4 text-sm font-bold text-gray-800 dark:text-gray-200">
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-[10px]">{isOpen ? "▼" : "▶"}</span>
                    {grupo.label}
                </div>
            </td>
            {meses.map((m) => (
                <td key={m} className={`py-2.5 px-4 text-right text-sm font-semibold ${colorVal(grupo.totalMes[m] ?? 0, invert)}`}>
                    {fmt(grupo.totalMes[m] ?? 0)}
                </td>
            ))}
            <td className={`py-2.5 px-4 text-right text-sm font-bold border-l-2 border-gray-200 dark:border-gray-700 ${colorVal(grupo.total, invert)}`}>
                {fmt(grupo.total)}
            </td>
        </tr>
    );
}

function SubGrupoRow({
    sub, meses, isOpen, onToggle, invert,
}: {
    sub: TDreSubGrupo;
    meses: string[];
    isOpen: boolean;
    onToggle: () => void;
    invert?: boolean;
}) {
    const hasLines = sub.linhas.length > 0;
    return (
        <tr
            className={`bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700/50 ${hasLines ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50" : ""} transition-colors`}
            onClick={() => hasLines && onToggle()}
        >
            <td className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-800/50 py-2 px-4 pl-8 text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                    {hasLines && (
                        <span className="text-gray-400 text-[10px]">{isOpen ? "▼" : "▶"}</span>
                    )}
                    {sub.label}
                </div>
            </td>
            {meses.map((m) => (
                <td key={m} className={`py-2 px-4 text-right text-sm ${colorVal(sub.totalMes[m] ?? 0, invert)}`}>
                    {fmt(sub.totalMes[m] ?? 0)}
                </td>
            ))}
            <td className={`py-2 px-4 text-right text-sm font-semibold border-l border-gray-100 dark:border-gray-700 ${colorVal(sub.total, invert)}`}>
                {fmt(sub.total)}
            </td>
        </tr>
    );
}

function ContaRow({
    conta, meses, invert,
}: {
    conta: { id: string; code: string; name: string; valoresMes: Record<string, number>; total: number };
    meses: string[];
    invert?: boolean;
}) {
    return (
        <tr className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
            <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 py-2 px-4 pl-14 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-xs text-gray-400 dark:text-gray-600 mr-2 font-mono">{conta.code}</span>
                {conta.name}
            </td>
            {meses.map((m) => (
                <td key={m} className={`py-2 px-4 text-right text-sm ${colorVal(conta.valoresMes[m] ?? 0, invert)}`}>
                    {fmt(conta.valoresMes[m] ?? 0)}
                </td>
            ))}
            <td className={`py-2 px-4 text-right text-sm border-l border-gray-100 dark:border-gray-800 ${colorVal(conta.total, invert)}`}>
                {fmt(conta.total)}
            </td>
        </tr>
    );
}

export default function DreReport() {
    const defaults = getUltimos3Meses();
    const [data, setData]           = useState<TDreData | null>(null);
    const [loading, setLoading]     = useState(false);
    const [startDate, setStartDate] = useState(defaults.start);
    const [endDate,   setEndDate]   = useState(defaults.end);
    const [regime,    setRegime]    = useState<"caixa" | "competencia">("competencia");

    const [openPai, setOpenPai]   = useState<Record<string, boolean>>({});
    const [openSub, setOpenSub]   = useState<Record<string, boolean>>({});

    const togglePai = (key: string) => setOpenPai(p => ({ ...p, [key]: !p[key] }));
    const toggleSub = (key: string) => setOpenSub(p => ({ ...p, [key]: !p[key] }));
    const isPaiOpen = (key: string) => openPai[key] !== false;
    const isSubOpen = (key: string) => openSub[key] !== false;

    const handleGenerate = () => {
        if (!startDate || !endDate) {
            resolveResponse({ status: 400, response: { data: { result: { message: "Preencha as datas" } } } });
            return;
        }
        setLoading(true);
        api
            .get(`/dre?startDate=${startDate}&endDate=${endDate}&regime=${regime}`, configApi())
            .then((res) => setData(res.data?.result?.data ?? null))
            .catch((err) => { resolveResponse(err); setData(null); })
            .finally(() => setLoading(false));
    };

    const renderSecao = (grupos: TDreGrupoPai[], invert = false) =>
        grupos.map((pai) => (
            <Fragment key={pai.key}>
                <GrupoPaiRow
                    grupo={pai}
                    meses={data!.meses}
                    isOpen={isPaiOpen(pai.key)}
                    onToggle={() => togglePai(pai.key)}
                    invert={invert}
                />
                {isPaiOpen(pai.key) && pai.subGrupos.map((sub) => (
                    <Fragment key={sub.key}>
                        <SubGrupoRow
                            sub={sub}
                            meses={data!.meses}
                            isOpen={isSubOpen(sub.key)}
                            onToggle={() => toggleSub(sub.key)}
                            invert={invert}
                        />
                        {isSubOpen(sub.key) && sub.linhas.map((c) => (
                            <ContaRow key={c.id} conta={c} meses={data!.meses} invert={invert} />
                        ))}
                    </Fragment>
                ))}
            </Fragment>
        ));

    return (
        <div className="space-y-5 max-h-[calc(100vh-11rem)] overflow-y-auto pr-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Inicial</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Final</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Regime</label>
                        <select value={regime} onChange={e => setRegime(e.target.value as any)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500">
                            <option value="competencia">Competência</option>
                            <option value="caixa">Caixa</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <Button disabled={loading} size="sm" variant="primary" onClick={handleGenerate}>
                            {loading ? "Gerando..." : "Gerar DRE"}
                        </Button>
                    </div>
                </div>
            </div>

            {data && (
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 overflow-hidden">
                    <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Demonstração do Resultado do Exercício (DRE)
                        </h3>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {data.periodo.inicio} a {data.periodo.fim}
                            &nbsp;•&nbsp;Regime {data.periodo.regime === "caixa" ? "Caixa" : "Competência"}
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max border-collapse">
                            <thead>
                                <tr className="bg-gray-900 dark:bg-gray-950">
                                    <th className="sticky left-0 z-20 bg-gray-900 dark:bg-gray-950 py-3 px-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider min-w-[280px]">
                                        Conta / Descrição
                                    </th>
                                    {data.meses.map(m => (
                                        <th key={m} className="py-3 px-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider min-w-[150px]">
                                            {m}
                                        </th>
                                    ))}
                                    <th className="py-3 px-4 text-right text-xs font-semibold text-white uppercase tracking-wider min-w-[150px] border-l-2 border-gray-600">
                                        Total
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="bg-white dark:bg-gray-900">
                                <tr className="bg-gray-800 dark:bg-gray-950">
                                    <td colSpan={data.meses.length + 2} className="py-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Receitas
                                    </td>
                                </tr>
                                {renderSecao(data.secoes.receitas, false)}

                                <TotRow label="(=) RECEITA LÍQUIDA" tot={data.totalizadores.receitaLiquida} meses={data.meses} variant="result" />

                                <tr className="bg-gray-800 dark:bg-gray-950">
                                    <td colSpan={data.meses.length + 2} className="py-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Custos
                                    </td>
                                </tr>
                                {renderSecao(data.secoes.despesas.filter(g => g.key === "custos"), true)}

                                <TotRow label="(=) LUCRO BRUTO" tot={data.totalizadores.lucroBruto} meses={data.meses} variant="result" />

                                <tr className="bg-gray-800 dark:bg-gray-950">
                                    <td colSpan={data.meses.length + 2} className="py-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Deduções
                                    </td>
                                </tr>
                                {renderSecao(data.secoes.despesas.filter(g => g.key === "deducoes"), true)}

                                <tr className="bg-gray-800 dark:bg-gray-950">
                                    <td colSpan={data.meses.length + 2} className="py-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Despesas Operacionais
                                    </td>
                                </tr>
                                {renderSecao(data.secoes.despesas.filter(g => g.key === "desp_op"), true)}

                                <TotRow label="(=) RESULTADO OPERACIONAL" tot={data.totalizadores.resultadoOp} meses={data.meses} variant="result" />

                                <tr className="bg-gray-800 dark:bg-gray-950">
                                    <td colSpan={data.meses.length + 2} className="py-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Despesas Financeiras
                                    </td>
                                </tr>
                                {renderSecao(data.secoes.despesas.filter(g => g.key === "desp_fin"), true)}

                                <TotRow label="(=) RESULTADO FINANCEIRO" tot={data.totalizadores.resultadoFin} meses={data.meses} variant="result" />

                                <tr className="bg-gray-800 dark:bg-gray-950">
                                    <td colSpan={data.meses.length + 2} className="py-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Outras Despesas
                                    </td>
                                </tr>
                                {renderSecao(data.secoes.despesas.filter(g => g.key === "outras"), true)}

                                <TotRow label="(=) LUCRO / PREJUÍZO LÍQUIDO" tot={data.totalizadores.lucroLiquido} meses={data.meses} variant="final" />
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-5">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Indicadores do Período</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Receita Bruta",   value: fmt(data.totalizadores.receitaBruta.total),  raw: data.totalizadores.receitaBruta.total },
                                { label: "Lucro Bruto",     value: fmt(data.totalizadores.lucroBruto.total),    raw: data.totalizadores.lucroBruto.total },
                                { label: "Margem Bruta",    value: `${data.indicadores.margemBruta.toFixed(2)}%`, raw: data.indicadores.margemBruta },
                                { label: "Margem Líquida",  value: `${data.indicadores.margemLiquida.toFixed(2)}%`, raw: data.indicadores.margemLiquida },
                            ].map(({ label, value, raw }) => (
                                <div key={label} className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                                    <p className={`text-lg font-bold ${raw === 0 ? "text-gray-500" : raw > 0 ? colorPos : colorNeg}`}>
                                        {value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {!data && !loading && (
                <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center dark:border-gray-800 dark:bg-white/3">
                    <div className="text-4xl mb-3">📊</div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Selecione o período e clique em &quot;Gerar DRE&quot; para visualizar o relatório.
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                        Por padrão são exibidos os últimos 3 meses.
                    </p>
                </div>
            )}
        </div>
    );
}