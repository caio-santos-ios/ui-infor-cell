"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import TextArea from "@/components/form/input/TextArea";
import { useRouter } from "next/navigation";
import { TChartOfAccounts } from "@/types/financial/chartofaccounts.type";
import Link from "next/link";

const SELECT_CLASS =
  "h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900";

const OPTION_CLASS = "text-gray-700 dark:bg-gray-900 dark:text-gray-400";

const ResetChartOfAccounts = {
  id: "",
  code: "",
  name: "",
  parentId: "",
  type: "despesa" as "receita" | "despesa" | "custo",
  dreCategory: "",
  showInDre: true,
  description: "",
  level: 1,
  isAnalytical: false,
  plan: "",
  company: "",
  store: "",
};

type TProp = {
  id?: string;
};

export default function ChartOfAccountsForm({ id }: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [parentAccounts, setParentAccounts] = useState<TChartOfAccounts[]>([]);
  const router = useRouter();

  const { register, reset, watch, setValue, getValues } = useForm({
    defaultValues: ResetChartOfAccounts,
  });

  const description = watch("description");

  const save = async () => {
    const body = {
      ...getValues(),
      plan:    localStorage.getItem("plan")    ?? "",
      company: localStorage.getItem("company") ?? "",
      store:   localStorage.getItem("store")   ?? "",
    };

    if (!body.code || !body.name || !body.type) {
      resolveResponse({ status: 400, response: { data: { result: { message: "Preencha todos os campos obrigatórios" } } } });
      return;
    }

    if (!body.id) {
      await create(body);
    } else {
      await update(body);
    }
  };

  const create = async (body: any) => {
    try {
      setIsLoading(true);
      const { data } = await api.post(`/chart-of-accounts`, body, configApi());
      resolveResponse({ status: 201, message: data.result.message });
      router.push("/financial/chart-of-accounts");
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (body: any) => {
    try {
      setIsLoading(true);
      const { data } = await api.put(`/chart-of-accounts/${id}`, body, configApi());
      resolveResponse({ status: 200, message: data.result.message });
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getById = async (id: string) => {
    try {
      const { data } = await api.get(`/chart-of-accounts/${id}`, configApi());
      const result = data.result.data;
      reset({
        id:           result.id           ?? "",
        code:         result.code         ?? "",
        name:         result.name         ?? "",
        parentId:     result.parentId     ?? "",
        type:         result.type         ?? "despesa",
        dreCategory:  result.dreCategory  ?? "",
        showInDre:    result.showInDre    ?? true,
        description:  result.description  ?? "",
        level:        result.level        ?? 1,
        isAnalytical: result.isAnalytical ?? false,
        plan:         result.plan         ?? "",
        company:      result.company      ?? "",
        store:        result.store        ?? "",
      });
    } catch (error) {
      resolveResponse(error);
    }
  };

  const getParentAccounts = async () => {
    try {
      const { data } = await api.get(`/chart-of-accounts?pageSize=1000`, configApi());
      setParentAccounts(data.result?.data?.data ?? []);
    } catch {
      setParentAccounts([]);
    }
  };

  useEffect(() => {
    const initial = async () => {
      setIsLoading(true);
      await getParentAccounts();
      if (id && id !== "create") {
        await getById(id);
      }
      setIsLoading(false);
    };
    initial();
  }, []);

  return (
    <>
      <ComponentCard title="Dados da Conta">
        <div className="grid grid-cols-6 gap-2 container-form">

          {/* Código */}
          <div className="col-span-6 md:col-span-3 xl:col-span-1">
            <Label title="Código" />
            <input placeholder="Ex: 3.1.1" {...register("code")} type="text" className="input-erp-primary input-erp-default" />
          </div>

          {/* Nome */}
          <div className="col-span-6 md:col-span-3 xl:col-span-3">
            <Label title="Nome" />
            <input placeholder="Ex: Vendas de Produtos" {...register("name")} type="text" className="input-erp-primary input-erp-default" />
          </div>

          {/* Tipo */}
          <div className="col-span-6 md:col-span-3 xl:col-span-2">
            <Label title="Tipo" />
            <select {...register("type")} className={SELECT_CLASS}>
              <option value="receita"  className={OPTION_CLASS}>Receita</option>
              <option value="despesa"  className={OPTION_CLASS}>Despesa</option>
              <option value="custo"    className={OPTION_CLASS}>Custo</option>
            </select>
          </div>

          {/* Conta Pai */}
          <div className="col-span-6 md:col-span-3 xl:col-span-3">
            <Label title="Conta Pai" required={false} />
            <select {...register("parentId")} className={SELECT_CLASS}>
              <option value="" className={OPTION_CLASS}>Nenhuma (Conta Raiz)</option>
              {parentAccounts.map((acc) => (
                <option key={acc.id} value={acc.id} className={OPTION_CLASS}>
                  {acc.code} — {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Categoria DRE */}
          <div className="col-span-6 md:col-span-3 xl:col-span-3">
            <Label title="Categoria DRE" required={false} />
            <select {...register("dreCategory")} className={SELECT_CLASS}>
              <option value=""                         className={OPTION_CLASS}>Nenhuma</option>
              <option value="receita_bruta"            className={OPTION_CLASS}>Receita Bruta</option>
              <option value="deducoes"                 className={OPTION_CLASS}>Deduções e Impostos</option>
              <option value="cmv"                      className={OPTION_CLASS}>CMV — Custo da Mercadoria Vendida</option>
              <option value="despesas_administrativas" className={OPTION_CLASS}>Despesas Administrativas</option>
              <option value="despesas_comerciais"      className={OPTION_CLASS}>Despesas Comerciais</option>
              <option value="despesas_financeiras"     className={OPTION_CLASS}>Despesas Financeiras</option>
              <option value="impostos"                 className={OPTION_CLASS}>Impostos (IRPJ/CSLL)</option>
            </select>
          </div>

          {/* Nível */}
          <div className="col-span-6 md:col-span-3 xl:col-span-1">
            <Label title="Nível" required={false} />
            <input
              placeholder="1"
              {...register("level", { valueAsNumber: true, min: 1, max: 10 })}
              type="number"
              className="input-erp-primary input-erp-default no-spinner"
            />
          </div>

          {/* Conta Analítica */}
          <div className="col-span-6 md:col-span-3 xl:col-span-2">
            <Label title="Aceita lançamentos?" required={false} />
            <select
              {...register("isAnalytical", { setValueAs: (v) => v === "true" || v === true })}
              className={SELECT_CLASS}
            >
              <option value="true"  className={OPTION_CLASS}>Sim — Conta Analítica</option>
              <option value="false" className={OPTION_CLASS}>Não — Conta Sintética</option>
            </select>
          </div>

          {/* Exibir no DRE */}
          <div className="col-span-6 md:col-span-3 xl:col-span-2">
            <Label title="Exibir no DRE?" required={false} />
            <select
              {...register("showInDre", { setValueAs: (v) => v === "true" || v === true })}
              className={SELECT_CLASS}
            >
              <option value="true"  className={OPTION_CLASS}>Sim</option>
              <option value="false" className={OPTION_CLASS}>Não</option>
            </select>
          </div>

          {/* Descrição */}
          <div className="col-span-6">
            <Label title="Descrição" required={false} />
            <TextArea
              rows={3}
              value={description}
              onChange={(v) => setValue("description", v)}
              placeholder="Descrição detalhada da conta (opcional)"
            />
          </div>

        </div>
        <div className="col-span-6 items-center">
          <Link href="/financial/chart-of-accounts" className="mr-4">
            <Button type="submit" variant="outline" size="sm">Cancelar</Button>
          </Link>
          <Button onClick={save} type="button" className="w-full md:max-w-20 mt-2" size="sm">
            Salvar
          </Button>
        </div>
      </ComponentCard>
    </>
  );
}