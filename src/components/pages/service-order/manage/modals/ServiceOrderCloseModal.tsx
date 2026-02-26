"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { formattedMoney } from "@/utils/mask.util";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type TProp = {
  serviceOrderId: string;
  isWarranty: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ServiceOrderCloseModal({ serviceOrderId, isWarranty, onClose, onSuccess }: TProp) {
  const [_, setLoading] = useAtom(loadingAtom);
  const [warrantyDays, setWarrantyDays] = useState(90);
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [paymentMethodName, setPaymentMethodName] = useState("");
  const [installments, setInstallments] = useState(1);
  const [quantityInstallment, setQuantityInstallment] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [listOfParcels, setListOfParcels] = useState<any[]>([]);
  const [subTotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [surcharge, setSurcharge] = useState(0);
  const [transactionFee, setTransactionFee] = useState(0);

  const fetchPaymentMethods = async () => {
    try {
      const { data } = await api.get("/payment-methods?deleted=false&ne$type=payable&pageSize=50&pageNumber=1", configApi());
      setPaymentMethods(data.result.data || []);
    } catch {}
  };

  const fetchOrderTotal = async () => {
    try {
      const { data } = await api.get(`/serviceOrderItems?deleted=false&serviceOrderId=${serviceOrderId}&pageSize=100&pageNumber=1`, configApi());
      const items = data.result.data || [];
      const total = items.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0);
      setSubtotal(total);
    } catch {}
  };

  useEffect(() => {
    if (!isWarranty) {
      fetchPaymentMethods();
      fetchOrderTotal();
    }
  }, []);

  const handleClose = async () => {
    if (!isWarranty && !paymentMethodId) {
      toast.warn("Selecione a forma de pagamento para encerrar a O.S.", { theme: 'colored' })
      return;
    };

    try {
      setLoading(true);

      const valueParcels = listOfParcels.find(x => x.installment == installments);

      const payload = {
        id: serviceOrderId,
        warrantyDays,
        paymentMethodId: isWarranty ? "" : paymentMethodId,
        paymentMethodName: isWarranty ? "" : paymentMethodName,
        numberOfInstallments: installments,
        value: valueParcels ? valueParcels.value : 0
      };

      const { data } = await api.put("/serviceOrders/close", payload, configApi());
      resolveResponse({ status: 200, message: data.result?.message || "OS encerrada com sucesso" });
      onSuccess();
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setQuantityInstallment(0);
    setSurcharge(0);
    setTransactionFee(0);
    setTotal(0);

    if(paymentMethodId) {
      const payment = paymentMethods.find((p: any) => p.id === paymentMethodId);
      if(payment) {
        const list: any[] = [];

        let valueTotal = subTotal;
        let valueSurcharge = 0;
        let valueTransactionFee = 0;

        payment.interest.map((item: any) => {
          const parcel = subTotal / item.installment;

          const surcharge = (parcel * parseFloat(item.surcharge)) / 100;
          const transactionFee = (parcel * parseFloat(item.transactionFee)) / 100;

          valueSurcharge += surcharge;
          valueTransactionFee += transactionFee;
          valueTotal += surcharge + transactionFee;

          list.push({
            label: `${item.installment}x de ${formattedMoney(parcel + surcharge + transactionFee)}`,
            installment: item.installment,
            value: parcel + surcharge + transactionFee
          });
        });

        setSurcharge(valueSurcharge);
        setTransactionFee(valueTransactionFee);
        setTotal(valueTotal);
        setListOfParcels(list);
        setQuantityInstallment(payment.numberOfInstallments);
      };
    };
  }, [paymentMethodId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-white/10">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Encerrar Ordem de Serviço</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>

          {isWarranty && (
            <div className="mb-5 p-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/20 text-sm text-amber-800 dark:text-amber-300">
              ⚠ <strong>Garantia Interna</strong> — a OS será encerrada sem geração financeira.
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Período de Garantia
            </label>
            <div className="flex gap-2">
              {[30, 90, 180].map((d) => (
                <button
                  key={d}
                  onClick={() => setWarrantyDays(d)}
                  className={`flex-1 h-10 rounded-lg text-sm font-medium border transition-colors ${warrantyDays === d ? "bg-brand-500 text-white border-brand-500" : "border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-400 hover:border-brand-300"}`}
                >
                  {d} dias
                </button>
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={warrantyDays}
                  onChange={(e) => setWarrantyDays(Number(e.target.value))}
                  className="w-20 h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 text-gray-800 text-center"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Garantia até: {new Date(Date.now() + warrantyDays * 86400000).toLocaleDateString("pt-BR")}
            </p>
          </div>

          {/* Payment (only if not warranty) */}
          {!isWarranty && (
            <>
              <div className="border-t border-gray-100 dark:border-white/10 pt-4 mb-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-normal text-gray-700 dark:text-gray-300">Subtotal</h4>
                  <span className="text-md font-bold text-gray-800 dark:text-white/90">{formattedMoney(subTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-normal text-gray-700 dark:text-gray-300">Taxa de transação</h4>
                  <span className="text-sm font-bold text-gray-800 dark:text-white/90">{formattedMoney(transactionFee)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-normal text-gray-700 dark:text-gray-300">Acréscimo</h4>
                  <span className="text-sm font-bold text-gray-800 dark:text-white/90">{formattedMoney(surcharge)}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total</h4>
                  <span className="text-md font-bold text-gray-800 dark:text-white/90">{formattedMoney(total)}</span>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Forma de Pagamento</label>
                  <select
                    value={paymentMethodId}
                    onChange={(e) => {
                      const pm = paymentMethods.find((p: any) => p.id === e.target.value);
                      setPaymentMethodId(e.target.value);
                      setPaymentMethodName(pm?.name || "");
                    }}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 text-gray-800"
                  >
                    <option value="">Selecionar</option>
                    {paymentMethods.map((pm: any) => (
                      <option key={pm.id} value={pm.id} className="dark:bg-gray-900">{pm.name}</option>
                    ))}
                  </select>
                </div>
                {
                  paymentMethodId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Parcelas</label>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(Number(e.target.value))}
                        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 text-gray-800">
                        {listOfParcels.map((n, i) => (
                          <option key={i} value={n.installment} className="dark:bg-gray-900">
                            {n.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                }
              </div>
            </>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-11 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleClose}
              className="flex-1 h-11 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
            >
              {isWarranty ? "Encerrar (Garantia)" : "Confirmar e Encerrar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
