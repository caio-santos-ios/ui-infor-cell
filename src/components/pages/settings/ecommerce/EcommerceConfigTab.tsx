"use client";

import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { ResetEcommerceConfig, TEcommerceConfig } from "@/types/ecommerce/ecommerce.type";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { MdStore, MdLocalShipping, MdColorLens, MdLink } from "react-icons/md";

export default function EcommerceConfigTab() {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [storeUrl, setStoreUrl] = useState("");

  const { register, handleSubmit, reset, watch } = useForm<TEcommerceConfig>({
    defaultValues: ResetEcommerceConfig,
  });

  const shippingEnabled = watch("shippingEnabled");

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get("/ecommerce/config", configApi());
        if (data?.result?.data) reset(data.result.data);
      } catch {}
    };
    fetch();

    if (typeof window !== "undefined") {
      const base = window.location.origin;
      // pega plan/company/store do localStorage
      const plan = localStorage.getItem("telemovviToken") ? "configurado" : "";
      setStoreUrl(`${base}/ecommerce`);
    }
  }, []);

  const save: SubmitHandler<TEcommerceConfig> = async (body) => {
    try {
      setIsLoading(true);
      const { data } = await api.post("/ecommerce/config", body, configApi());
      resolveResponse({ status: data.result?.statusCode ?? 200, message: data.result?.message });
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(save)} className="space-y-6">
      {/* Link da loja */}
      {storeUrl && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20">
          <MdLink className="text-brand-500 shrink-0" size={18} />
          <span className="text-sm text-brand-700 dark:text-brand-300">Link da sua loja:</span>
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-brand-600 dark:text-brand-400 underline truncate"
          >
            {storeUrl}
          </a>
        </div>
      )}

      {/* Habilitar loja */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div>
          <p className="font-medium text-gray-800 dark:text-white">Loja virtual ativa</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Quando desativada, a loja fica inacessível ao público</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" {...register("enabled")} className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500" />
        </label>
      </div>

      {/* Informações da loja */}
      <div className="space-y-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2 mb-2">
          <MdStore className="text-brand-500" size={18} />
          <h3 className="font-semibold text-gray-800 dark:text-white">Informações da loja</h3>
        </div>

        <div>
          <Label title="Nome da loja" />
          <input {...register("storeName")} placeholder="Ex: Tech Store" className="input-erp-primary input-erp-default" />
        </div>

        <div>
          <Label title="Descrição" />
          <textarea
            {...register("storeDescription")}
            rows={3}
            placeholder="Descreva sua loja em poucas palavras..."
            className="input-erp-primary input-erp-default resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label title="URL do Logo" />
            <input {...register("logoUrl")} placeholder="https://..." className="input-erp-primary input-erp-default" />
          </div>
          <div>
            <Label title="URL do Banner" />
            <input {...register("bannerUrl")} placeholder="https://..." className="input-erp-primary input-erp-default" />
          </div>
        </div>
      </div>

      {/* Cor primária */}
      <div className="space-y-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2 mb-2">
          <MdColorLens className="text-brand-500" size={18} />
          <h3 className="font-semibold text-gray-800 dark:text-white">Identidade visual</h3>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <Label title="Cor principal" />
            <input type="color" {...register("primaryColor")} className="h-10 w-20 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer" />
          </div>
          <div className="flex-1">
            <Label title="Código hex" />
            <input {...register("primaryColor")} placeholder="#7C3AED" className="input-erp-primary input-erp-default" />
          </div>
        </div>
      </div>

      {/* Frete */}
      <div className="space-y-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MdLocalShipping className="text-brand-500" size={18} />
            <h3 className="font-semibold text-gray-800 dark:text-white">Configuração de frete</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" {...register("shippingEnabled")} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500" />
          </label>
        </div>

        {shippingEnabled && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label title="Valor do frete fixo (R$)" />
                <input
                  type="number"
                  step="0.01"
                  {...register("shippingFixedPrice", { valueAsNumber: true })}
                  placeholder="0,00"
                  className="input-erp-primary input-erp-default"
                />
              </div>
              <div>
                <Label title="Frete grátis acima de (R$)" />
                <input
                  type="number"
                  step="0.01"
                  {...register("shippingFreeAbove", { valueAsNumber: true })}
                  placeholder="0 = desativado"
                  className="input-erp-primary input-erp-default"
                />
              </div>
            </div>
            <div>
              <Label title="Informações sobre entrega" />
              <textarea
                {...register("shippingDescription")}
                rows={2}
                placeholder="Ex: Entregamos em até 5 dias úteis..."
                className="input-erp-primary input-erp-default resize-none"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="sm">Salvar configurações</Button>
      </div>
    </form>
  );
}
