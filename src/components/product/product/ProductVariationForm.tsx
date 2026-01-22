"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import React, { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import { TProduct } from "@/types/product/product/product.type";
import Button from "@/components/ui/button/Button";
import { FaPlus, FaCheck } from "react-icons/fa6";
import { MdClose } from "react-icons/md";
import { NumericFormat } from "react-number-format";
import Switch from "@/components/form/Switch";

type TProp = { id?: string; };

export default function ProductVariationForm({ id }: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const { register, control, reset, handleSubmit, getValues, watch } = useForm<TProduct>({
    defaultValues: { variations: [] }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variations",
  });

  const getById = async (productId: string) => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/products/${productId}`, configApi());
      reset(data.result.data);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id && id !== "create") getById(id);
  }, [id]);

  const handleUpdateDatabase = async () => {
    const body = getValues(); 
    try {
      setIsLoading(true);
      await api.put(`/products`, body, configApi());
      resolveResponse({ status: 200, message: "Variações atualizadas!" });
      if (id) await getById(id);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const addNewVariation = () => {
    append({
      sequence: fields.length + 1,
      key: "",
      value: "",
      cost: 0,
      price: 0,
      sku: "",
      status: true
    });
    handleUpdateDatabase(); 
  };

  const removeVariation = (index: number) => {
    remove(index);
    handleUpdateDatabase();
  };

  return (
    <ComponentCard title="Variações do Produto" hasHeader={false}>
      <div className="grid grid-cols-12 gap-4 container-form">
        {fields.map((field, index) => (
          <React.Fragment key={field.id}>
            <div className="col-span-6 xl:col-span-2">
              <Label title="Nome (Atributo)" required={false}/>
              <input 
                {...register(`variations.${index}.key`)} 
                placeholder="Ex: Cor" 
                className="input-erp-primary input-erp-default" 
              />
            </div>

            <div className="col-span-6 xl:col-span-2">
              <Label title="Valor" required={false}/>
              <input 
                {...register(`variations.${index}.value`)} 
                placeholder="Ex: Azul" 
                className="input-erp-primary input-erp-default" 
              />
            </div>

            <div className="col-span-6 xl:col-span-2">
              <Label title="SKU" required={false}/>
              <input 
                {...register(`variations.${index}.sku`)} 
                placeholder="SKU" 
                className="input-erp-primary input-erp-default" 
              />
            </div>

            <div className="col-span-6 xl:col-span-2">
              <Label title="Custo" required={false}/>
              <Controller
                name={`variations.${index}.cost`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <NumericFormat
                    className="input-erp-primary input-erp-default"
                    value={value}
                    onValueChange={(v) => onChange(v.floatValue)}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    decimalScale={2}
                    fixedDecimalScale
                  />
                )}
              />
            </div>

            <div className="col-span-6 xl:col-span-2">
              <Label title="Preço" required={false}/>
              <Controller
                name={`variations.${index}.price`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <NumericFormat
                    className="input-erp-primary input-erp-default"
                    value={value}
                    onValueChange={(v) => onChange(v.floatValue)}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    decimalScale={2}
                    fixedDecimalScale
                  />
                )}
              />
            </div>

            <div className="col-span-6 xl:col-span-1">
              <Label title="Status" required={false}/>
              <Controller
                name={`variations.${index}.status`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Switch defaultChecked={value} onChange={onChange} />
                )}
              />
            </div>

            <div className="col-span-6 xl:col-span-1 self-end flex gap-2">
              <Button onClick={() => removeVariation(index)} type="button" size="sm">
                <MdClose />
              </Button>
            </div>
          </React.Fragment>
        ))}

        
      </div>
      <div className="col-span-12 mt-4">
        <div className="flex">
          <Button onClick={addNewVariation} type="button" className="gap-2">
            <FaPlus /> Adicionar Variação
          </Button>
          
          <Button 
            onClick={handleUpdateDatabase} 
            type="button" 
            className="ml-4 bg-green-600 hover:bg-green-700 gap-2"
          >
            <FaCheck /> Salvar Alterações
          </Button>
        </div>
      </div>
    </ComponentCard>
  );
}