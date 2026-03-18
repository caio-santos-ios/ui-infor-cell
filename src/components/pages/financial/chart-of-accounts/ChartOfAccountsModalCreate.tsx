"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useForm } from "react-hook-form";
import Label from "@/components/form/Label";
import { useEffect, useState } from "react";
import { ResetAccountReceivable } from "@/types/financial/accounts-receivable/accounts-receivable.type";
import { accountReceivableIdAtom } from "@/jotai/financial/accounts-receivable/accountsReceivable.jotai";
import { customerAtom, customerModalCreateAtom } from "@/jotai/masterData/customer.jotai";
import { chartOfAccountIdAtom, chartOfAccountModalAtom } from "@/jotai/financial/chart-of-account.jotai";
import { ResetChartOfAccounts, TChartOfAccounts } from "@/types/financial/chartofaccounts.type";

export default function ChartOfAccountsModalCreate() {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [modalCreate, setModalCreate] = useAtom(chartOfAccountModalAtom);
  const [chartOfAccountId, setChartOfAccountId] = useAtom(chartOfAccountIdAtom);
  const [accounts] = useState<any[]>([
    {type: "despesa", value: "1",   level: 1, label: "1 - Pagamentos"},
    {type: "despesa", value: "1.1", level: 2, label: "1.1 - Despesas administrativas e comerciais" },
    {type: "despesa", value: "1.2", level: 2, label: "1.2 - Despesas de produtos vendidos" },
    {type: "despesa", value: "1.3", level: 2, label: "1.3 - Despesas financeiras" },
    {type: "despesa", value: "1.4", level: 2, label: "1.4 - Investimentos" },
    {type: "despesa", value: "1.5", level: 2, label: "1.5 - Outras despesas" },
    {type: "receita",  value: "2",   level: 1, label: "2 - Recebimentos"},
    {type: "receita", value: "2.1", level: 2, label: "2.1 - Receitas de vendas" },
    {type: "receita", value: "2.2", level: 2, label: "2.2 - Receitas financeiras" },
    {type: "receita", value: "2.3", level: 2, label: "2.3 - Outras receitas" },
  ]);
  const [groupsDespesaDRE] = useState<any[]>([
    { value: "none", level: 1, label: "Não mostrar no DRE" },    
    { value: "deducoes", level: 1, label: "Deduções" },
    { value: "imp_vendas", level: 2, label: "(-) Impostos sobre vendas" },
    { value: "com_vendas", level: 2, label: "(-) Comissões sobre vendas" },
    { value: "dev_vendas", level: 2, label: "(-) Devolução de vendas" },    
    { value: "custos", level: 1, label: "Custos operacionais" },
    { value: "cpv", level: 2, label: "(-) Custo dos produtos vendidos" },    
    { value: "desp_op", level: 1, label: "Despesas operacionais" },
    { value: "desp_adm", level: 2, label: "(-) Despesas administrativas" },
    { value: "desp_ger", level: 2, label: "(-) Despesas operacionais" },
    { value: "desp_com", level: 2, label: "(-) Despesas comerciais" },    
    { value: "desp_fin", level: 1, label: "Despesas financeiras" },
    { value: "emp_div", level: 2, label: "(-) Empréstimos e dívidas" },
    { value: "jur_mul", level: 2, label: "(-) Juros/multas pagos" },
    { value: "desc_conc", level: 2, label: "(-) Descontos concedidos" },
    { value: "tax_ban", level: 2, label: "(-) Taxas/tarifas bancárias" },    
    { value: "outras", level: 1, label: "Outras despesas" },
    { value: "outras_esp", level: 2, label: "(-) Outras despesas" },
  ]);
  const [groupsReceitaDRE] = useState<any[]>([
    { type: "dre", value: "rec_bruta", level: 1, label: "Receita bruta" },
    { type: "dre", value: "rec_vendas", level: 2, label: "(+) Receitas de vendas" },    
    { type: "dre", value: "rec_fin", level: 1, label: "Receitas financeiras" },
    { type: "dre", value: "rend_fin", level: 2, label: "(+) Rendimentos financeiros" },
    { type: "dre", value: "jur_rec", level: 2, label: "(+) Juros/multas recebidos" },
    { type: "dre", value: "desc_rec", level: 2, label: "(+) Descontos recebidos" },
    { type: "dre", value: "rec_outras", level: 1, label: "Outras receitas" },
    { type: "dre", value: "outras_rec_item", level: 2, label: "(+) Outras receitas" },
  ]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [__, setCustomerModalCreate] = useAtom(customerModalCreateAtom);
  const [customer, setCustomer] = useAtom(customerAtom);
  const [chartOfAccounts, setChartOfAccounts] = useState<any[]>([]);

  const { getValues, setValue, register, reset, control, watch } = useForm<TChartOfAccounts>({
    defaultValues: ResetChartOfAccounts
  });

  const create = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.post(`/chart-of-accounts`, { ...getValues() }, configApi());
      const result = data.result;
      resolveResponse({ status: 201, message: result.message });
      close();
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const update = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.put(`/chart-of-accounts`, { ...getValues() }, configApi());
      const result = data.result;
      resolveResponse({ status: 200, message: result.message });
      close();
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getById = async (id: string) => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/chart-of-accounts/${id}`, configApi());
      const result = data.result.data;
      reset(result);
      // setValue("dueDate", result.dueDate.split("T")[0]);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getChartOfAccount = async () => {
    try {
      const { data } = await api.get(`/chart-of-accounts/select?deleted=false&type=receita`, configApi());
      const result = data.result.data;
      setChartOfAccounts(result ?? []);
    } catch {
      setChartOfAccounts([]);
    }
  };

  const getAutocompleCustomer = async (value: string) => {
    try {
      if(!value) return setCustomers([]);
      const {data} = await api.get(`/customers?deleted=false&orderBy=tradeName&sort=desc&pageSize=10&pageNumber=1&regex$or$tradeName=${value}&regex$or$corporateName=${value}&regex$or$document=${value}`, configApi());
      const result = data.result;
      setCustomers(result.data);
    } catch (error) {
      resolveResponse(error);
    }
  };

  const close = () => {
    setModalCreate(false);
    setChartOfAccountId("");
    reset(ResetChartOfAccounts);
  };

  useEffect(() => {
    if(watch("account")) {
      const account = accounts.find((a) => a.value === watch("account"));
      if(account) {
        setValue("type", account.type);
        setValue("groupDRE", "");
      }
    }
  }, [watch("account")])

  useEffect(() => {
    const initial = async () => {
      await getChartOfAccount();

      if (chartOfAccountId) {
        await getById(chartOfAccountId);
      }
    };
    initial();
  }, [modalCreate]);

  return (
    <Modal isOpen={modalCreate} onClose={() => setModalCreate(false)} className="m-4 w-[80dvw] max-w-160">
      <div className="no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Plano de Conta
          </h4>
        </div>

        <form className="flex flex-col">
          <div className="max-h-[70dvh] custom-scrollbar overflow-y-auto px-2 pb-3">
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-6">
                <Label title="Nome" />
                <input maxLength={200} placeholder="Nome" {...register("name")} type="text" className="input-erp-primary input-erp-default" />
              </div>
              <div className="col-span-6 lg:col-span-3">
                <Label title="Conta Mãe" required={false} />
                <select {...register("account")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800">
                    <option value="">Selecione</option>
                    {accounts.map((p: any) => (
                      <option className={`${p.level > 1 ? '' : 'text-gray-500'}`} key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-span-6 lg:col-span-3">
                <Label title="Grupo de DRE" required={false} />
                {
                  watch("type") === "receita" ? 
                  <select {...register("groupDRE")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800">
                    <option value="">Selecione</option>
                    {groupsReceitaDRE.map((p: any) => (
                      <option className={`${p.level > 1 ? '' : 'text-gray-500'}`} key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  :
                  <select {...register("groupDRE")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800">
                    <option value="">Selecione</option>
                    {groupsDespesaDRE.map((p: any) => (
                      <option className={`${p.level > 1 ? '' : 'text-gray-500'}`} key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                }
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={() => close()}>Cancelar</Button>
            {
              (
                chartOfAccountId
              ? <Button size="sm" variant="primary" onClick={() => update()}>Salvar</Button>
              : <Button size="sm" variant="primary" onClick={() => create()}>Adicionar</Button>
              )
            }
          </div>
        </form>
      </div>
    </Modal>
  );
}
