"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useForm } from "react-hook-form";
import Label from "@/components/form/Label";
import { TPayAccountReceivable } from "@/types/financial/accounts-receivable/accounts-receivable.type";
import { accountReceivableIdAtom, accountReceivablePayModalAtom } from "@/jotai/financial/accounts-receivable/accountsReceivable.jotai";

export default function AccountReceivableModalPay() {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [payModal, setPayModal] = useAtom(accountReceivablePayModalAtom);
  const [accountReceivableId, setAccountReceivableId] = useAtom(accountReceivableIdAtom);

  const { getValues, register, reset } = useForm<TPayAccountReceivable>({
    defaultValues: {
      id: "",
      amountPaid: 0,
      paidAt: new Date().toISOString().split("T")[0],
      status: "paid"
    }
  });

  const pay = async () => {
    try {
      setIsLoading(true);
      const payload = { ...getValues(), id: accountReceivableId };
      const { data } = await api.put(`/accounts-receivable/pay`, payload, configApi());
      const result = data.result;
      resolveResponse({ status: 200, message: result.message });
      close();
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const close = () => {
    setPayModal(false);
    setAccountReceivableId("");
    reset();
  };

  return (
    <Modal isOpen={payModal} onClose={() => close()} className="m-4 w-[80dvw] max-w-120">
      <div className="no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-1 text-2xl font-semibold text-gray-800 dark:text-white/90">Baixar Título</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Registre o recebimento deste título</p>
        </div>

        <form className="flex flex-col">
          <div className="px-2 pb-3">
            <div className="grid grid-cols-6 gap-4">

              <div className="col-span-6 lg:col-span-3">
                <Label title="Valor Recebido (R$)" />
                <input placeholder="0,00" {...register("amountPaid", { valueAsNumber: true })} type="number" step="0.01" min="0" className="input-erp-primary input-erp-default no-spinner" />
              </div>

              <div className="col-span-6 lg:col-span-3">
                <Label title="Data do Recebimento" />
                <input {...register("paidAt")} type="date" className="input-erp-primary input-erp-default" />
              </div>

              <div className="col-span-6">
                <Label title="Status" />
                <select {...register("status")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 text-gray-800">
                  <option value="paid">Recebido</option>
                  <option value="partial">Recebimento Parcial</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

            </div>
          </div>

          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={() => close()}>Cancelar</Button>
            <Button size="sm" variant="primary" onClick={() => pay()}>Confirmar Baixa</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
