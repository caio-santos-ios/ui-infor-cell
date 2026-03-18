"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { Controller, SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { NumericFormat } from "react-number-format";
import { ResetProduct, TProduct } from "@/types/product/product/product.type";
import { FaPlus, FaTrash } from "react-icons/fa6";

type TProp = {
  id?: string;
};

export default function ProductSerialForm({ id }: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);

  const { control, getValues, reset, register, setValue } = useForm<TProduct>({
    defaultValues: ResetProduct
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "serials" as any, 
  });

  const save = async (body: TProduct) => {
    if (body.id) {
      await update(body);
    }
  };

  const update: SubmitHandler<TProduct> = async (body: TProduct) => {
    try {
      setIsLoading(true);
      const { data } = await api.put(`/products`, body, configApi());
      const result = data.result;
      resolveResponse({ status: 200, message: result.message });
      if (id) await getById(id);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getById = async (productId: string) => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/products/${productId}`, configApi());
      const result = data.result.data;
      reset(result);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id !== "create") {
      getById(id!);
    }
  }, [id]);

  const addSerial = () => {
    append({
      serialNumber: "",
      imei1: "",
      status: "estoque",
      storeId: "",
      individualCost: 0,
      individualPrice: 0,
      origin: "compra"
    });
  };

  return (
    <>
      <ComponentCard title="Controle de Seriais / IMEI" hasHeader={false}>
        <div className="flex flex-col gap-4 max-h-[calc(100dvh-23.5rem)] md:max-h-[calc(100dvh-26rem)] overflow-y-auto pr-2">
          
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl relative bg-gray-50/30 dark:bg-white/3">
              
              <div className="col-span-12 xl:col-span-3">
                <Label title="Nº Série / ID" required={true} />
                <input {...register(`serials.${index}.serialNumber` as const)} placeholder="S/N" className="input-erp-primary input-erp-default" />
              </div>

              <div className="col-span-6 xl:col-span-3">
                <Label title="IMEI 1" />
                <input {...register(`serials.${index}.imei1` as const)} placeholder="IMEI 1" className="input-erp-primary input-erp-default" />
              </div>

              <div className="col-span-6 xl:col-span-3">
                <Label title="IMEI 2" />
                <input {...register(`serials.${index}.imei2` as const)} placeholder="IMEI 2" className="input-erp-primary input-erp-default" />
              </div>

              <div className="col-span-6 xl:col-span-3">
                <Label title="Status" />
                <select {...register(`serials.${index}.status` as const)} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                  <option value="estoque" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Estoque</option>
                  <option value="vendido" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Vendido</option>
                  <option value="reservado" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Reservado</option>
                  <option value="manutencao" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Manutenção</option>
                </select>
              </div>

              <div className="col-span-6 xl:col-span-2">
                <Label title="Custo Unit." />
                <Controller
                  name={`serials.${index}.individualCost` as const}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <NumericFormat
                      className="input-erp-primary input-erp-default"
                      value={value}
                      onValueChange={(v) => onChange(v.floatValue)}
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="R$ "
                    />
                  )}
                />
              </div>

              <div className="col-span-6 xl:col-span-2">
                <Label title="Preço Venda" />
                <Controller
                  name={`serials.${index}.individualPrice` as const}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <NumericFormat
                      className="input-erp-primary input-erp-default"
                      value={value}
                      onValueChange={(v) => onChange(v.floatValue)}
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="R$ "
                    />
                  )}
                />
              </div>

              <div className="col-span-6 xl:col-span-2">
                <Label title="Origem" />
                <select {...register(`serials.${index}.origin` as const)} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                  <option value="compra">Compra</option>
                  <option value="troca">Troca</option>
                  <option value="transferencia">Transferência</option>
                </select>
              </div>

              <div className="col-span-6 xl:col-span-3">
                <Label title="Doc. Origem" />
                <input {...register(`serials.${index}.originDoc` as const)} placeholder="NF / Pedido" className="input-erp-primary input-erp-default" />
              </div>

              <div className="col-span-6 xl:col-span-2">
                <Label title="Garantia" />
                <input type="date" {...register(`serials.${index}.warrantyExpiration` as const)} className="input-erp-primary input-erp-default" />
              </div>

              <div className="col-span-10 xl:col-span-11">
                <Label title="Observações" />
                <input {...register(`serials.${index}.observations` as const)} placeholder="Notas internas..." className="input-erp-primary input-erp-default" />
              </div>

              <div className="col-span-2 xl:col-span-1 self-end">
                <Button type="button" onClick={() => remove(index)} className="w-full bg-red-500 hover:bg-red-600 text-white h-11">
                  <FaTrash />
                </Button>
              </div>
            </div>
          ))}

          <Button onClick={addSerial} type="button" variant="outline" className="w-full border-dashed border-2 py-6">
            <FaPlus className="mr-2" /> Adicionar Novo Serial
          </Button>
        </div>
      </ComponentCard>

      <div className="flex gap-2">
        <Button onClick={() => save({ ...getValues() })} type="button" className="w-full md:max-w-20 mt-2" size="sm">
          Salvar
        </Button>
      </div>
    </>
  );
}