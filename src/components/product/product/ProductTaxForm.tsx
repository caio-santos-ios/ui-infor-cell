"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { NumericFormat } from "react-number-format";
import { ResetProduct, TProduct } from "@/types/product/product/product.type";

type TProp = {
  id?: string;
};

export default function ProductTaxForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);

  const { control, getValues, reset, register, setValue, watch } = useForm<TProduct>({
    defaultValues: ResetProduct
  });

  const costPrice = watch("cost");
  const salePrice = watch("price");
  const priceDiscount = 0;

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
    const finalSaleValue = salePrice - priceDiscount;
    const profit = finalSaleValue - costPrice;

    if (costPrice > 0) {
      const calculatedMarkup = (profit / costPrice) * 100;
      setValue("margin", calculatedMarkup);
    } else if (finalSaleValue > 0 && costPrice === 0) {
      setValue("margin", 100); 
    } else {
      setValue("margin", 0);
    }
  }, [costPrice, salePrice, priceDiscount, setValue]);
  
  useEffect(() => {
    if(id != "create") {
      getById(id!);
    };
  }, []);

  return (
    <>
      <ComponentCard title="Dados Gerais" hasHeader={false}>
        <div className="grid grid-cols-8 gap-2 max-h-[calc(100dvh-23.5rem)] md:max-h-[calc(100dvh-26rem)] lg:max-h-[calc(100dvh-26rem)] xl:max-h-[calc(100dvh-23.7rem)] overflow-y-auto">  
          <div className="col-span-6 xl:col-span-2">
            <Label title="NCM" required={false} />
            <input 
              {...register("ncm")} 
              maxLength={15}
              placeholder="NCM"
              className="input-erp-primary input-erp-default w-full" 
            />
          </div>

          <div className="col-span-6 xl:col-span-2">
            <Label title="CEST" required={false} />
            <input 
              {...register("cest")} 
              maxLength={7}
              placeholder="CEST"
              className="input-erp-primary input-erp-default w-full" 
            />
          </div>

          <div className="col-span-12 xl:col-span-2">
            <Label title="Origem do Produto" required={false}/>
            <select {...register("origin")} className="input-erp-primary input-erp-default w-full">
              <option value="0">0 - Nacional</option>
              <option value="1">1 - Estrangeira (Importação Direta)</option>
              <option value="2">2 - Estrangeira (Adquirida no Mercado Interno)</option>
            </select>
          </div>
          
          <div className="col-span-12 xl:col-span-2">
            <Label title="Grupo Fiscal" required={false}/>
            <select {...register("taxGroup")} className="input-erp-primary border-blue-500 input-erp-default w-full">
              <option value="revenda">Revenda de Mercadorias</option>
              <option value="producao">Produção Própria</option>
            </select>
          </div>

          <div className="col-span-6 xl:col-span-2">
            <Label title="CFOP Entrada" required={false}/>
            <input {...register("cfopIn")} className="input-erp-primary input-erp-default w-full" placeholder="CFOP Entrada" />
          </div>

          <div className="col-span-6 xl:col-span-2">
            <Label title="CFOP Saída" required={false}/>
            <input {...register("cfopOut")} className="input-erp-primary input-erp-default w-full" placeholder="CFOP Saída" />
          </div>

          <div className="col-span-8 xl:col-span-2">
            <Label title="CST / CSOSN ICMS" required={false}/>
            <input {...register("cstIcms")} className="input-erp-primary input-erp-default w-full" placeholder="CST / CSOSN ICMS" />
          </div>

          <div className="col-span-4 xl:col-span-2">
            <Label title="Alíquota ICMS" required={false}/>
            <Controller
              name="icms"
              control={control}
              render={({ field: { onChange, value } }) => (
                <NumericFormat
                  className="input-erp-primary input-erp-default w-full"
                  value={value}
                  onValueChange={(v) => onChange(v.floatValue)}
                  suffix=" %"
                  decimalScale={2}
                  fixedDecimalScale
                  placeholder="Alíquota ICMS"
                />
              )}
            />
          </div>
          
          {/* <div className="col-span-6 xl:col-span-2">
            <Label title="CST PIS" required={false}/>
            <input {...register("cstPis")} placeholder="CST PIS" className="input-erp-primary input-erp-default w-full" />
          </div> */}

          <div className="col-span-6 xl:col-span-2">
            <Label title="Alíquota PIS" required={false}/>
            <Controller
              name="pis"
              control={control}
              render={({ field: { onChange, value } }) => (
                <NumericFormat
                  className="input-erp-primary input-erp-default w-full"
                  value={value}
                  onValueChange={(v) => onChange(v.floatValue)}
                  suffix=" %"
                  decimalScale={2}
                  placeholder="Alíquota PIS"
                />
              )}
            />
          </div>

          {/* <div className="col-span-6 xl:col-span-2">
            <Label title="CST COFINS" required={false}/>
            <input {...register("cstCofins")} placeholder="CST COFINS" className="input-erp-primary input-erp-default w-full" />
          </div> */}

          <div className="col-span-6 xl:col-span-2">
            <Label title="Alíquota COFINS" required={false}/>
            <Controller
              name="cofins"
              control={control}
              render={({ field: { onChange, value } }) => (
                <NumericFormat
                  className="input-erp-primary input-erp-default w-full"
                  value={value}
                  onValueChange={(v) => onChange(v.floatValue)}
                  suffix=" %"
                  decimalScale={2}
                  placeholder="Alíquota COFINS"
                />
              )}
            />
          </div>

          {/* <div className="col-span-6 xl:col-span-2">
            <Label title="CST IPI" required={false}/>
            <input {...register("cstIpi")} placeholder="CST IPI" className="input-erp-primary input-erp-default w-full" />
          </div> */}

          <div className="col-span-6 xl:col-span-2">
            <Label title="Alíquota IPI" required={false}/>
            <Controller
              name="ipi"
              control={control}
              render={({ field: { onChange, value } }) => (
                <NumericFormat
                  className="input-erp-primary input-erp-default w-full"
                  value={value}
                  onValueChange={(v) => onChange(v.floatValue)}
                  suffix=" %"
                  decimalScale={2}
                  placeholder="Alíquota IPI"
                />
              )}
            />
          </div>

          <div className="col-span-4 xl:col-span-2">
            <Label title="IBPT (Carga Aprox.)" required={false}/>
            <Controller
              name="ibpt"
              control={control}
              render={({ field: { onChange, value } }) => (
                <NumericFormat
                  className="input-erp-primary input-erp-default w-full"
                  value={value}
                  onValueChange={(v) => onChange(v.floatValue)}
                  suffix=" %"
                  decimalScale={2}
                  placeholder="IBPT (Carga Aprox.)"
                />
              )}
            />
          </div>
        </div>
      </ComponentCard>
      <Button onClick={() => save({...getValues()})} type="submit" className="w-full md:max-w-20 mt-2" size="sm">Salvar</Button>
    </>
  );
}