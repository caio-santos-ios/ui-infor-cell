"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { ResetEmployee, TEmployee } from "@/types/master-data/employee/employee.type";
import ProductDataForm from "./ProductDataForm";
import ProductImageForm from "./ProductImageForm";
import ProductVariationForm from "./ProductVariationForm";
import ProductStockForm from "./ProductStockForm";
import ProductPriceCostForm from "./ProductPriceCostForm";
import ProductTaxForm from "./ProductTaxForm";
import ProductSerialControlForm from "./ProductSerialControlForm";
import { hasMoveStockProductAtom, hasVariationProductAtom } from "@/jotai/product/product.jotai";

type TProp = {
  id?: string;
};

export default function ProductForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [hasMoveStock] = useAtom(hasMoveStockProductAtom);
  const [hasVariation] = useAtom(hasVariationProductAtom);
  const [currentTab, setCurrentTab] = useState<string>("data");

  const tabs = useMemo(() => {
    const baseTabs = [
      { key: 'data', title: 'Identificação do Produto' },
      { key: 'priceCost', title: 'Preços e Custos' },
      { key: 'tax', title: 'Fiscal (NF-e / NFC-e)' },
    ];

    if (hasMoveStock === "yes" && hasVariation === "yes") {
      baseTabs.push({ key: 'variations', title: 'Estoque/Variações' });
    } else if (hasMoveStock === "yes") {
      baseTabs.push({ key: 'stock', title: 'Estoque' });
    } else if (hasVariation === "yes") {
      baseTabs.push({ key: 'variations', title: 'Variações' });
    }

    // baseTabs.push({ key: 'serialControl', title: 'Controle de Seriais' });
    baseTabs.push({ key: 'images', title: 'Galeria' });

    return baseTabs;
  }, [hasMoveStock, hasVariation]);

  const { reset } = useForm<TEmployee>({
    defaultValues: ResetEmployee
  });

  const getById = async (productId: string) => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/products/${productId}`, configApi());
      reset(data.result.data);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(id !== "create") getById(id!);
  }, [id]);

  useEffect(() => {
    const tabExists = tabs.find(t => t.key === currentTab);
    if (!tabExists) setCurrentTab("data");
  }, [tabs]);

  return (
    <>    
      <div className="flex flex-wrap items-center font-medium gap-2 rounded-lg transition px-2 py-2 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 w-full mb-3">
        {tabs.map((x) => (
          <button 
            key={x.key}
            onClick={() => setCurrentTab(x.key)} 
            className={`${currentTab === x.key ? 'bg-brand-500 text-white' : ''} px-3 py-1 rounded-md transition-all`}
          >
            {x.title}
          </button>
        ))}
      </div>

      <div className="mb-2">
        {currentTab === "data" && <ProductDataForm id={id} />}
        {currentTab === "priceCost" && <ProductPriceCostForm id={id} />}
        {currentTab === "tax" && <ProductTaxForm id={id} />}
        {currentTab === "images" && <ProductImageForm id={id} />}
        {/* {currentTab === "serialControl" && <ProductSerialControlForm id={id} />} */}
        
        {currentTab === "stock" && hasMoveStock === "yes" && <ProductStockForm id={id} />}
        {currentTab === "variations" && hasVariation === "yes" && <ProductVariationForm id={id} />}
      </div>     
    </>
  );
}