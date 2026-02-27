"use client";

import { useEffect, useState } from "react";

const STEPS = [
    { id: "company",       label: "Configurando empresa",         icon: "🏢", duration: 900  },
    { id: "store",         label: "Criando loja principal",       icon: "🏪", duration: 700  },
    { id: "categories",    label: "Tabela de categorias",         icon: "🗂️", duration: 600  },
    { id: "payment",       label: "Formas de pagamento",          icon: "💳", duration: 500  },
    { id: "chartaccounts", label: "Plano de contas",              icon: "📊", duration: 800  },
    { id: "flags",         label: "Bandeiras de cartão",          icon: "🚩", duration: 400  },
    { id: "generictables", label: "Tabelas auxiliares",           icon: "⚙️", duration: 600  },
    { id: "permissions",   label: "Perfis de permissão",          icon: "🔐", duration: 500  },
    { id: "user",          label: "Configurando seu usuário",     icon: "👤", duration: 700  },
    { id: "finishing",     label: "Finalizando instalação",       icon: "✅", duration: 900  },
];

type StepStatus = "waiting" | "running" | "done";

interface StepState {
    id: string;
    status: StepStatus;
}

interface InstalationProps {
    onComplete?: () => void;
}

export const Instalation = ({ onComplete }: InstalationProps) => {
    const [steps, setSteps] = useState<StepState[]>(STEPS.map((s) => ({ id: s.id, status: "waiting" })));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [finished, setFinished] = useState(false);
    const [dots, setDots] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((d) => (d.length >= 3 ? "" : d + "."));
        }, 400);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (currentIndex >= STEPS.length) {
            setTimeout(() => {
                setFinished(true);
                setTimeout(() => onComplete?.(), 1200);
            }, 400);
            return;
        }

        setSteps((prev) =>
            prev.map((s, i) => (i === currentIndex ? { ...s, status: "running" } : s))
        );

        const timer = setTimeout(() => {
            setSteps((prev) =>
                prev.map((s, i) => (i === currentIndex ? { ...s, status: "done" } : s))
            );
            setCurrentIndex((i) => i + 1);
        }, STEPS[currentIndex].duration);

        return () => clearTimeout(timer);
    }, [currentIndex]);

    const progress = Math.round((steps.filter((s) => s.status === "done").length / STEPS.length) * 100);

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-[#080410]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
            className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(113,39,167,0.15) 0%, transparent 70%)" }}
            />
            <div
            className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(168,98,220,0.1) 0%, transparent 70%)" }}
            />
        </div>

        <div className="relative h-[calc(100dvh-4rem)] w-full max-w-md px-6 flex flex-col items-center gap-8">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-white leading-snug">
                    {finished ? "Aguarde!" : "Preparando seu ERP"}
                </h1>
                <div className="text-sm text-brand-300/60 font-mono">
                    {finished ? "Redirecionando para o sistema..." : "Isso vai levar apenas alguns segundos"}
                </div>
            </div>

            <div className="w-full">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-mono text-zinc-500">Progresso</span>
                    <span className="text-xs font-mono text-brand-400">{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                        width: `${progress}%`,
                        background: "linear-gradient(90deg, #7127A7, #A862DC)",
                        boxShadow: "0 0 12px rgba(168,98,220,0.5)",
                    }}
                    />
                </div>
            </div>

        <div className="w-full flex flex-col gap-2">
            {STEPS.map((step, i) => {
                const state = steps[i].status;
                const isRunning = state === "running";
                const isDone = state === "done";
                const isWaiting = state === "waiting";

            return (
            <div
                key={step.id}
                className="flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300"
                style={{
                    background: isRunning ? "rgba(113,39,167,0.15)" : isDone ? "rgba(113,39,167,0.06)" : "rgba(255,255,255,0.02)",
                    border: isRunning ? "1px solid rgba(113,39,167,0.4)" : isDone ? "1px solid rgba(113,39,167,0.15)" : "1px solid rgba(255,255,255,0.04)",
                    opacity: isWaiting ? 0.4 : 1,
                }}>

                <div className="w-6 h-4 flex items-center justify-center shrink-0">
                  {isDone ? (
                    <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isRunning ? (
                    <div
                      className="w-3.5 h-3.5 rounded-full border-2 border-brand-400 border-t-transparent"
                      style={{ animation: "spin 0.7s linear infinite" }}
                    />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  )}
                </div>

                <span className="text-base leading-none">{step.icon}</span>

                <span
                    className="text-sm font-medium flex-1 transition-colors duration-300"
                    style={{ color: isDone ? "#C492F0" : isRunning ? "#E8D5FF" : "#4A3D63" }}>
                    {isRunning ? `${step.label}${dots}` : step.label}
                </span>

                {isDone && (
                    <span className="text-[10px] font-mono text-brand-500/60">ok</span>
                )}
            </div>
            );
          })}
        </div>

        {finished && (
            <div className="text-center" style={{ animation: "fadeUp 0.6s ease-out forwards" }}>
                <div className="inline-flex items-center gap-2 text-brand-400 text-sm font-mono">
                    <div className="w-3 h-3 rounded-full border border-brand-400 border-t-transparent" style={{ animation: "spin 0.8s linear infinite" }} />
                    Abrindo o sistema...
                </div>
            </div>
        )}
        </div>

        <style>{`
            @keyframes spin   { to { transform: rotate(360deg); } }
            @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
    </div>
    );
};