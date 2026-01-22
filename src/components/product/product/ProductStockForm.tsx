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

export default function ProductStockForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);

  const { control, getValues, reset, register, setValue, watch } = useForm<TProduct>({
    defaultValues: ResetProduct
  });

  const save = async (body: TProduct) => {
    if(body.id) {
      await update(body);
    };
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
  
  useEffect(() => {
    if(id != "create") {
      getById(id!);
    };
  }, []);

  return (
    <>
      <ComponentCard title="Dados Gerais" hasHeader={false}>
        <div className="grid grid-cols-6 gap-2 max-h-[calc(100dvh-23.5rem)] md:max-h-[calc(100dvh-26rem)] lg:max-h-[calc(100dvh-26rem)] xl:max-h-[calc(100dvh-23.5rem)] overflow-y-auto">  
          <div className="col-span-6 xl:col-span-1">
            <Label title="Controla Estoque" required={false}/>
            <select {...register("moveStock")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
              <option value="yes" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Sim</option>
              <option value="no" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Não</option>
            </select>
          </div>          
          <div className="col-span-6 xl:col-span-1">
            <Label title="Estoque Mínimo" required={false}/>
            <input maxLength={30} placeholder="Estoque Mínimo" {...register("minimumStock")} type="number" className="input-erp-primary input-erp-default"/>
          </div>
          <div className="col-span-6 xl:col-span-1">
            <Label title="Estoque Máximo" required={false}/>
            <input maxLength={30} placeholder="Estoque Máximo" {...register("maximumStock")} type="number" className="input-erp-primary input-erp-default"/>
          </div>
          <div className="col-span-6 xl:col-span-2">
            <Label title="Localização Física" required={false}/>
            <input maxLength={50} placeholder="Localização Física" {...register("physicalLocation")} type="text" className="input-erp-primary input-erp-default"/>
          </div>
          <div className="col-span-6 xl:col-span-1">
            <Label title="Venda Sem Estoque" required={false}/>
            <select {...register("saleWithoutStock")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
              <option value="yes" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Sim</option>
              <option value="no" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Não</option>
            </select>
          </div>          
          <div className="col-span-6 xl:col-span-1">
            <Label title="Contém Variações" required={false}/>
            <select {...register("hasVariations")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
              <option value="yes" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Sim</option>
              <option value="no" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Não</option>
            </select>
          </div>
          <div className="col-span-6 xl:col-span-1">
            <Label title="Contém Serial/IMEI" required={false}/>
            <select {...register("hasSerial")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
              <option value="yes" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Sim</option>
              <option value="no" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Não</option>
            </select>
          </div>
          {/* 
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
            <select {...register("moveStock")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
              <option value="Mercadoria" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Mercadoria</option>
              <option value="Serviço" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Serviço</option>
              <option value="Use e Consumo" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Use e Consumo</option>
            </select>
          </div>  
          <div className="col-span-6 xl:col-span-1">
            <Label title={`Controla Estoque: ${active ? 'SIM' : 'NÃO'}`} required={false}/>
            <Switch defaultChecked={active} onChange={(e) => {setValue("active", e)}} />
          </div>   
          */}
          {/* <div className="col-span-6 xl:col-span-1">
            <Label title="Custo"/>
            <Controller
              name="costPrice"
              control={control}
              defaultValue={0}
              render={({ field: { onChange, value } }) => (
                <NumericFormat
                  className="input-erp-primary input-erp-default" 
                  value={value}
                  onValueChange={(values) => {
                    setValue("costPrice", values.floatValue ? values.floatValue : 0);
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                  placeholder="Custo"
                />
              )}
            />
          </div>
          <div className="col-span-6 xl:col-span-1">
            <Label title="Custo Despesas" required={false}/>
            <Controller
              name="expenseCostPrice"
              control={control}
              defaultValue={0}
              render={({ field: { onChange, value } }) => (
                <NumericFormat
                  className="input-erp-primary input-erp-default" 
                  value={value}
                  onValueChange={(values) => {
                    setValue("expenseCostPrice", values.floatValue ? values.floatValue : 0);
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                  placeholder="Custo"
                />
              )}
            />
          </div>
          <div className="col-span-6 xl:col-span-1">
            <Label title="Preço"/>
            <Controller
              name="price"
              control={control}
              defaultValue={0}
              render={({ field: { onChange, value } }) => (
                <NumericFormat
                  className="input-erp-primary input-erp-default" 
                  value={value}
                  onValueChange={(values) => {
                    setValue("price", values.floatValue ? values.floatValue : 0);
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                  placeholder="Preço"
                />
              )}
            />
          </div>
          <div className="col-span-6 xl:col-span-1">
            <Label title="Desconto Preço" required={false}/>
            <Controller
              name="priceDiscount"
              control={control}
              defaultValue={0}
              render={({ field: { onChange, value } }) => (
                <NumericFormat
                  className="input-erp-primary input-erp-default" 
                  value={value}
                  onValueChange={(values) => {
                    setValue("priceDiscount", values.floatValue ? values.floatValue : 0);
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                  placeholder="Desconto Preço"
                />
              )}
            />
          </div>
          <div className="col-span-6 xl:col-span-1">
            <Label title="Preço Total" required={false}/>
            <Controller
              disabled
              name="priceTotal"
              control={control}
              defaultValue={0}
              render={({ field: { onChange, value } }) => (
                <NumericFormat
                  className="input-erp-primary input-erp-default" 
                  value={value}
                  onValueChange={(values) => {
                    setValue("priceTotal", values.floatValue ? values.floatValue : 0);
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                  placeholder="Preço Total"
                  disabled
                />
              )}
            />
          </div> */}
        </div>
      </ComponentCard>
      <Button onClick={() => save({...getValues()})} type="submit" className="w-full xl:max-w-20 mt-2" size="sm">Salvar</Button>
    </>
  );
}