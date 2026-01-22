"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ResetEmployee, TEmployee } from "@/types/master-data/employee/employee.type";
import ProductDataForm from "./ProductDataForm";
import ProductImageForm from "./ProductImageForm";
import ProductVariationForm from "./ProductVariationForm";
import ProductStockForm from "./ProductStockForm";
import ProductPriceCostForm from "./ProductPriceCostForm";
import ProductTaxForm from "./ProductTaxForm";
import ProductSerialControlForm from "./ProductSerialControlForm";

type TProp = {
  id?: string;
};

export default function ProductForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [tabs] = useState<{key: string; title: string;}[]>([
    {key: 'data', title: 'Identificação do Produto'},
    {key: 'stock', title: 'Controle de Estoque'},
    {key: 'priceCost', title: 'Preços e Custos'},
    {key: 'tax', title: 'Fiscal (NF-e / NFC-e)'},
    {key: 'variations', title: 'Variações'},
    {key: 'serialControl', title: 'Controle de Seriais'},
    {key: 'images', title: 'Galeria'}
  ]);
  const [currentTab, setCurrentTab] = useState<any>({key: 'data', title: 'Identificação do Produto'});

  const { reset } = useForm<TEmployee>({
    defaultValues: ResetEmployee
  });

  const getById = async (id: string) => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/products/${id}`, configApi());
      const result = data.result.data;
      reset(result);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(id != "create") {
      getById(id!);
    };
  }, []);

  return (
    <>    
      <div className="flex flex-wrap items-center font-medium gap-2 rounded-lg transition  px-2 py-2 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 w-full mb-3">
        {
          tabs.map((x: any) => {
            return <button onClick={() => setCurrentTab(x)} className={`${currentTab.key == x.key ? 'bg-brand-500 text-white' : ''} px-3 py-1 rounded-md`} key={x.key}>{x.title}</button>
          })
        }
      </div>

      <div className="mb-2">
        {currentTab.key == "data" && <ProductDataForm id={id} />}
        {currentTab.key == "stock" && <ProductStockForm id={id} />}
        {currentTab.key == "priceCost" && <ProductPriceCostForm id={id} />}
        {currentTab.key == "tax" && <ProductTaxForm id={id} />}
        {currentTab.key == "variations" && <ProductVariationForm id={id} />}
        {currentTab.key == "serialControl" && <ProductSerialControlForm id={id} />}
        {currentTab.key == "images" && <ProductImageForm id={id} />}
      </div>     
    </>
  );
}