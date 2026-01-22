"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { NumericFormat } from "react-number-format";
import { ResetProduct, TProduct } from "@/types/product/product/product.type";
import { TCategorie } from "@/types/product/categorie/categorie.type";
import { TModel } from "@/types/product/model/model.type";
import Switch from "@/components/form/Switch";
import TextArea from "@/components/form/input/TextArea";

type TProp = {
  id?: string;
};

export default function ProductDataForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [categories, setCategory] = useState<TCategorie[]>([]);
  const [models, setModel] = useState<TModel[]>([]);
  const [unitOfMeasure] = useState<any[]>([
    { code: "UN", name: "Unidade" },
    { code: "PC", name: "Peça" },
    { code: "KG", name: "Quilograma" },
    { code: "G", name: "Grama" },
    { code: "L", name: "Litro" },
    { code: "ML", name: "Mililitro" },
    { code: "MT", name: "Metro" },
    { code: "M2", name: "Metro Quadrado" },
    { code: "M3", name: "Metro Cúbico" },
    { code: "CX", name: "Caixa" },
    { code: "DZ", name: "Dúzia" },
    { code: "PAR", name: "Par" },
    { code: "PCT", name: "Pacote" },
    { code: "RL", name: "Rolo" },
    { code: "TON", name: "Tonelada" },
  ]);
  const router = useRouter();  

  const { control, getValues, reset, register, setValue, watch } = useForm<TProduct>({
    defaultValues: ResetProduct
  });

  const active = watch("active");
  const descriptionComplet = watch("descriptionComplet");

  const save = async (body: TProduct) => {
    if(!body.id) {
      await create(body);
    } else {
      await update(body);
    };
  };
      
  const create: SubmitHandler<TProduct> = async (body: TProduct) => {
    try {
      setIsLoading(true);
      const {data} = await api.post(`/products`, body, configApi());
      const result = data.result;
      resolveResponse({status: 201, message: result.message});
      router.push(`/product/products/${result.data.id}`)
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };
    
  const update: SubmitHandler<TProduct> = async (body: TProduct) => {
    try {
      setIsLoading(true);
      const {data} = await api.put(`/products`, body, configApi());
      const result = data.result;
      resolveResponse({status: 200, message: result.message});
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const getSelectCategory = async () => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/categories?deleted=false`, configApi());
      const result = data.result.data;
      setCategory(result);
      await getSelectModel(watch("categoryId"));
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getSelectModel = async (categoryId: string) => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/models?deleted=false&categoryId=${categoryId}`, configApi());
      const result = data.result.data;
      setModel(result);      
      setValue("modelId", watch("modelId"));
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setModel([]);

    if(watch("categoryId")) {
      getSelectModel(watch("categoryId"));
    };
  }, [watch("categoryId")]);
  
  useEffect(() => {
    getSelectCategory();    
    if(id != "create") {
      getById(id!);
    };
  }, []);

  return (
    <>
      <ComponentCard title="Dados Gerais" hasHeader={false}>
        <div className="grid grid-cols-6 gap-2 max-h-[calc(100dvh-23.5rem)] md:max-h-[calc(100dvh-26rem)] lg:max-h-[calc(100dvh-26rem)] xl:max-h-[calc(100dvh-23.5rem)] overflow-y-auto">  
          <div className="col-span-6 xl:col-span-2">
            <Label title="Nome" />
            <input maxLength={30} placeholder="Nome" {...register("name")} type="text" className="input-erp-primary input-erp-default"/>
          </div>
          <div className="col-span-6 xl:col-span-2">
            <Label title="SKU" required={false}/>
            <input maxLength={15} placeholder="SKU" {...register("sku")} type="text" className="input-erp-primary input-erp-default"/>
          </div>
          <div className="col-span-6 xl:col-span-2">
            <Label title="EAN/GTIN" required={false}/>
            <input maxLength={30} placeholder="EAN/GTIN" {...register("ean")} type="text" className="input-erp-primary input-erp-default"/>
          </div>
          <div className="col-span-6 xl:col-span-2">
            <Label title="Categoria"/>
            <select {...register("categoryId")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
              <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Selecione</option>
              {
                categories.map((x: TCategorie) => {
                  return <option key={x.id} value={x.id} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{x.code} - {x.name}</option>
                })
              }
            </select>
          </div>  
          <div className="col-span-6 xl:col-span-2">
            <Label title="Subcategoria" required={false}/>
            <select {...register("subCategory")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
              <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Selecione</option>
              {
                categories.map((x: TCategorie) => {
                  return <option key={x.id} value={x.id} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{x.code} - {x.name}</option>
                })
              }
            </select>
          </div>  
          <div className="col-span-6 xl:col-span-2">
            <Label title="Modelo"/>
            <select {...register("modelId")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
              <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Selecione</option>
              {
                models.map((x: TModel) => {
                  return <option key={x.id} value={x.id} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{x.code} - {x.name}</option>
                })
              }
            </select>
          </div>  
          <div className="col-span-6 xl:col-span-1">
            <Label title="Unidade de Medida" required={false}/>
            <select {...register("unitOfMeasure")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
              <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Selecione</option>
              {
                unitOfMeasure.map((x: any) => {
                  return <option key={x.code} value={x.code} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{x.code} - {x.name}</option>
                })
              }
            </select>
          </div>  
          <div className="col-span-6 xl:col-span-1">
            <Label title="Tipo" required={false}/>
            <select {...register("type")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
              <option value="Mercadoria" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Mercadoria</option>
              <option value="Serviço" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Serviço</option>
              <option value="Use e Consumo" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Use e Consumo</option>
            </select>
          </div>  
          <div className="col-span-6 xl:col-span-1">
            <Label title={`Status ${active ? 'Ativo' : 'Inativo'}`} required={false}/>
            <Switch defaultChecked={active} onChange={(e) => {setValue("active", e)}} />
          </div>  
          <div className="col-span-6">
            <Label title="Descrição Curta" required={false} />
            <input maxLength={60} placeholder="Descrição Curta" {...register("description")} type="text" className="input-erp-primary input-erp-default"/>
          </div>
          <div className="col-span-6">
            <Label title="Descrição Completa" required={false} />
            <TextArea rows={5} value={descriptionComplet} onChange={(v) => setValue("descriptionComplet", v)} placeholder="Descrição Completa"/>
          </div>
        </div>
      </ComponentCard>
      <Button onClick={() => save({...getValues()})} type="submit" className="w-full xl:max-w-20 mt-2" size="sm">Salvar</Button>
    </>
  );
}