"use client";

import Button from "@/components/ui/button/Button";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { FaCheck, FaCreditCard, FaBarcode, FaQrcode, FaTimes } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { MdStarBorder, MdStarHalf, MdStar, MdDiamond } from "react-icons/md";
import { toast } from "react-toastify";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type BillingType = "PIX" | "BOLETO" | "CREDIT_CARD" | "DEBIT_CARD";

interface PlanOption {
  name: string;
  price: string;
  value: number;
  discount: string;
  items: { text: string; valid: boolean }[];
}

interface SubscriptionResult {
  status: string;
  paymentUrl: string;
  pixQrCode: string;
  pixQrCodeImage: string;
  identificationField: string;
  billingType: string;
  planType: string;
  value: number;
}

const PLANS: PlanOption[] = [
  {
    name: "Platina",
    // price: "R$ 379,00/mês",
    price: "R$ 5/mês",
    value: 379,
    discount: "R$ 583,08",
    items: [
      { text: "Emissão de boletos", valid: true },
      { text: "Emissão de notas fiscais", valid: true },
      { text: "Layout e domínio personalizado", valid: true },
      { text: "3 empresas/lojas", valid: true },
      { text: "7 usuários", valid: true },
    ],
  },
  {
    name: "Ouro",
    // price: "R$ 289,00/mês",
    price: "R$ 5/mês",
    value: 289,
    discount: "R$ 444,62",
    items: [
      { text: "Emissão de boletos", valid: true },
      { text: "Emissão de notas fiscais", valid: true },
      { text: "Layout e domínio personalizado", valid: true },
      { text: "2 empresas/lojas", valid: true },
      { text: "5 usuários", valid: true },
    ],
  },
  {
    name: "Prata",
    // price: "R$ 199,00/mês",
    price: "R$ 5/mês",
    value: 199,
    discount: "R$ 306,15",
    items: [
      { text: "Emissão de boletos", valid: true },
      { text: "Emissão de notas fiscais", valid: true },
      { text: "Layout e domínio personalizado", valid: false },
      { text: "1 empresa/loja", valid: true },
      { text: "3 usuários", valid: true },
    ],
  },
  {
    name: "Bronze",
    // price: "R$ 119,00/mês",
    price: "R$ 5/mês",
    value: 119,
    discount: "R$ 183,08",
    items: [
      { text: "Emissão de boletos", valid: false },
      { text: "Emissão de notas fiscais", valid: false },
      { text: "Layout e domínio personalizado", valid: false },
      { text: "1 empresa/loja", valid: true },
      { text: "1 usuário", valid: true },
    ],
  },
];

// ─── Ícones de plano ─────────────────────────────────────────────────────────
function PlanIcon({ name }: { name: string }) {
  if (name === "Bronze") return <MdStarBorder size={22} />;
  if (name === "Prata") return <MdStarHalf size={22} />;
  if (name === "Ouro") return <MdStar size={22} className="text-yellow-400" />;
  if (name === "Platina") return <MdDiamond size={22} className="text-blue-400" />;
  return null;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export const SubscriptionFlow = () => {
  const [, setLoading] = useAtom(loadingAtom);
  const [step, setStep] = useState<"plans" | "payment" | "result">("plans");
  const [selectedPlan, setSelectedPlan] = useState<PlanOption | null>(null);
  const [billingType, setBillingType] = useState<BillingType>("PIX");
  const [result, setResult] = useState<SubscriptionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dados do cartão
  const [card, setCard] = useState({
    holderName: "",
    number: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });

  const handleSelectPlan = (plan: PlanOption) => {
    setSelectedPlan(plan);
    setStep("payment");
  };

  const handleSubmit = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      const payload: any = {
        planType: selectedPlan.name,
        billingType,
      };

      if (billingType === "CREDIT_CARD" || billingType === "DEBIT_CARD") {
        if (!card.holderName || !card.number || !card.expiryMonth || !card.expiryYear || !card.cvv) {
          toast.warn("Preencha todos os dados do cartão", { theme: "colored" });
          setSubmitting(false);
          return;
        }
        payload.cardHolderName = card.holderName;
        payload.cardNumber = card.number.replace(/\s/g, "");
        payload.cardExpiryMonth = card.expiryMonth;
        payload.cardExpiryYear = card.expiryYear;
        payload.cardCvv = card.cvv;
      }

      const response = await api.post("/subscriptions", payload, configApi());
      resolveResponse(response);
      setResult(response.data.result?.data ?? response.data.result);
      setStep("result");
    } catch (err: any) {
      resolveResponse(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado!", { theme: "colored" });
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  // ── Step: Selecionar Plano ──────────────────────────────────────────────────
  if (step === "plans") {
    return (
      <div className="w-full max-w-6xl px-4">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">
          Escolha o seu plano
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">
          Assinatura mensal recorrente · Cancele quando quiser
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className={`flex flex-col rounded-2xl border p-5 transition-all duration-200 hover:shadow-lg
                ${plan.name === "Ouro"
                  ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10"
                  : plan.name === "Platina"
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-900/10"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5"
                }`}
            >
              {/* Badge popular */}
              {plan.name === "Ouro" && (
                <span className="self-start text-xs font-semibold bg-yellow-400 text-white px-2 py-0.5 rounded-full mb-2">
                  Mais Popular
                </span>
              )}

              <div className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white mb-3">
                <PlanIcon name={plan.name} />
                {plan.name}
              </div>

              <div className="mb-4">
                <span className="line-through text-gray-400 text-sm">{plan.discount}</span>
                {/* <div className="text-2xl font-bold text-gray-900 dark:text-white">{plan.price}</div> */}
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{plan.price}</div>
              </div>

              <ul className="flex flex-col gap-1.5 flex-1 mb-5">
                {plan.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    {item.valid ? (
                      <FaCheck className="text-green-500 shrink-0" size={12} />
                    ) : (
                      <IoMdClose className="text-red-400 shrink-0" size={14} />
                    )}
                    <span className={item.valid ? "" : "line-through text-gray-400"}>{item.text}</span>
                  </li>
                ))}
              </ul>

              <Button
                type="button"
                size="sm"
                className={`w-full ${plan.name === "Ouro" ? "bg-yellow-500 hover:bg-yellow-600" : "bg-brand-500 hover:bg-brand-600"}`}
                onClick={() => handleSelectPlan(plan)}
              >
                Selecionar
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Step: Forma de Pagamento ──────────────────────────────────────────────
  if (step === "payment" && selectedPlan) {
    return (
      <div className="w-full max-w-lg px-4">
        <button
          onClick={() => setStep("plans")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 mb-6"
        >
          ← Voltar aos planos
        </button>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 p-6 shadow-sm">
          {/* Resumo do plano */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div>
              <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-white text-lg">
                <PlanIcon name={selectedPlan.name} />
                Plano {selectedPlan.name}
              </div>
              <div className="text-sm text-gray-500">Renovação mensal automática</div>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{selectedPlan.price}</div>
          </div>

          {/* Forma de pagamento */}
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Forma de pagamento</p>

          <div className="grid grid-cols-2 gap-2 mb-5">
            {(
              [
                { id: "PIX", label: "PIX", icon: <FaQrcode size={16} /> },
                { id: "BOLETO", label: "Boleto", icon: <FaBarcode size={16} /> },
                { id: "CREDIT_CARD", label: "Crédito", icon: <FaCreditCard size={16} /> },
                { id: "DEBIT_CARD", label: "Débito", icon: <FaCreditCard size={16} /> },
              ] as { id: BillingType; label: string; icon: React.ReactNode }[]
            ).map((b) => (
              <button
                key={b.id}
                onClick={() => setBillingType(b.id)}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-sm font-medium border transition-all
                  ${billingType === b.id
                    ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                    : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                  }`}
              >
                {b.icon} {b.label}
              </button>
            ))}
          </div>

          {/* Dados do cartão */}
          {(billingType === "CREDIT_CARD" || billingType === "DEBIT_CARD") && (
            <div className="flex flex-col gap-3 mb-5">
              <input
                type="text"
                placeholder="Nome do titular"
                value={card.holderName}
                onChange={(e) => setCard({ ...card, holderName: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="text"
                placeholder="Número do cartão"
                maxLength={19}
                value={card.number}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                  const formatted = val.replace(/(.{4})/g, "$1 ").trim();
                  setCard({ ...card, number: formatted });
                }}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Mês (MM)"
                  maxLength={2}
                  value={card.expiryMonth}
                  onChange={(e) => setCard({ ...card, expiryMonth: e.target.value.replace(/\D/g, "") })}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <input
                  type="text"
                  placeholder="Ano (YYYY)"
                  maxLength={4}
                  value={card.expiryYear}
                  onChange={(e) => setCard({ ...card, expiryYear: e.target.value.replace(/\D/g, "") })}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  maxLength={4}
                  value={card.cvv}
                  onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          {/* Info PIX / Boleto */}
          {billingType === "PIX" && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 mb-5 text-sm text-green-700 dark:text-green-300">
              Um QR Code PIX será gerado após confirmar. Após o pagamento, seu plano é ativado automaticamente.
            </div>
          )}
          {billingType === "BOLETO" && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-3 mb-5 text-sm text-orange-700 dark:text-orange-300">
              O boleto tem prazo de 3 dias úteis para compensação. Seu plano será ativado após confirmação.
            </div>
          )}

          <Button
            type="button"
            size="md"
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Processando..." : `Confirmar · ${selectedPlan.price}`}
          </Button>
        </div>
      </div>
    );
  }

  // ── Step: Resultado / Pagamento ───────────────────────────────────────────
  if (step === "result" && result) {
    return (
      <div className="w-full max-w-lg px-4">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 p-6 shadow-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 mb-3">
              <FaCheck className="text-green-500" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Assinatura criada!</h3>
            <p className="text-sm text-gray-500 mt-1">
              Plano <strong>{result.planType}</strong> — aguardando pagamento
            </p>
          </div>

          {/* PIX */}
          {result.billingType === "PIX" && result.pixQrCodeImage && (
            <div className="flex flex-col items-center gap-4">
              <img
                src={`data:image/png;base64,${result.pixQrCodeImage}`}
                alt="QR Code PIX"
                className="w-48 h-48 rounded-lg border border-gray-200 dark:border-gray-600"
              />
              {result.pixQrCode && (
                <div className="w-full">
                  <p className="text-xs text-gray-500 mb-1">PIX Copia e Cola</p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={result.pixQrCode}
                      className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    />
                    <button
                      onClick={() => handleCopy(result.pixQrCode)}
                      className="px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-medium"
                    >
                      {copied ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BOLETO */}
          {result.billingType === "BOLETO" && (
            <div className="flex flex-col gap-3">
              {result.identificationField && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Linha digitável</p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={result.identificationField}
                      className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    />
                    <button
                      onClick={() => handleCopy(result.identificationField)}
                      className="px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-medium"
                    >
                      {copied ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                </div>
              )}
              {result.paymentUrl && (
                <a
                  href={result.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium"
                >
                  Abrir boleto →
                </a>
              )}
            </div>
          )}

          {/* CARTÃO */}
          {(result.billingType === "CREDIT_CARD" || result.billingType === "DEBIT_CARD") && (
            <div className="text-center py-4">
              <div className="text-green-600 dark:text-green-400 font-semibold text-lg">
                Pagamento aprovado!
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Seu plano <strong>{result.planType}</strong> já está ativo.
              </p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 text-center">
              Após a confirmação do pagamento, seu plano será ativado automaticamente.
              Em caso de dúvidas, entre em contato com o suporte.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};