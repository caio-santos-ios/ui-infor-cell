"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import ComponentCard from "@/components/common/ComponentCard";
import { TProduct } from "@/types/product/product/product.type";
import { FaPlus, FaBarcode } from "react-icons/fa";
import { TVariation } from "@/types/product/variation/variation.type";
import Label from "@/components/form/Label";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Button from "@/components/ui/button/Button";

type TProp = { id?: string; };

export default function ProductVariationForm({ id }: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [variationTypes, setVariationTypes] = useState<TVariation[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  
  const { register, control, reset, getValues } = useForm<TProduct>({
    defaultValues: { variations: [] }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variations",
  });

  const update = async (body: TProduct) => {
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

  const getSelectVariation = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/variations/select?deleted=false`, configApi());
      setVariationTypes(data.result.data); 
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSelectVariation();
    if (id && id !== "create") getById(id);
  }, [id]);

  const toggleGrade = (gradeId: string) => {
    setSelectedGrades(prev => 
      prev.includes(gradeId) ? prev.filter(i => i !== gradeId) : [...prev, gradeId]
    );
  };

  const addNewLine = async () => {
    append({
      barcode: "",
      stock: 0,
      code: "",
      variationId: "",
      variationItemId: "",
    });

    const body = {...getValues()};
    const itens = body.variations.map(v => ({...v, variationId: v.variationItemId.split("-")[1], variationItemId: v.variationItemId.split("-")[0]})); 
    console.log(body)
    console.log(itens)
    body.variations = itens;
    await update(body);
  };

  return (
    <>
      <ComponentCard title="Variações" hasHeader={false} className="max-h-[calc(100dvh-22rem)] overflow-y-auto">
        <div className="flex flex-wrap gap-6 mb-8 px-2">
          {variationTypes.map(v => (
            <div key={v.code}>
              <Label title={v.name} required={false} />
              <input checked={selectedGrades.includes(v.code)} onChange={() => toggleGrade(v.code)} className="w-5 h-5 appearance-none cursor-pointer dark:border-gray-700 border border-gray-300 checked:border-transparent rounded-md checked:bg-brand-500 disabled:opacity-60" type="checkbox"/>
            </div>
          ))}
        </div>

        <div className="erp-container-table rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 mb-3">
          <div className="max-w-full overflow-x-auto tele-container-table">
            <div className="min-w-[1102px] divide-y">
              <Table className="divide-y">
                <TableHeader className="border-b border-gray-100 dark:border-white/5 tele-table-thead">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Código de Barras</TableCell>
                    {selectedGrades.map(gradeId => (
                      <TableCell key={gradeId} className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">
                        {variationTypes.find(t => t.code === gradeId)?.name}
                      </TableCell>
                    ))}
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Estoque Atual</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ações</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                  {fields.map((field, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">
                        <input {...register(`variations.${index}.barcode`)} maxLength={40} placeholder="Código de barras"className="input-erp-primary input-erp-default w-full"/>
                      </TableCell>

                      {selectedGrades.map(gradeId => {
                        const currentGrade: any = variationTypes.find(t => t.code === gradeId);
                        console.log(currentGrade?.id)
                        return (
                          <TableCell key={currentGrade?.code} className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">
                              <select 
                                {...register(`variations.${index}.variationItemId`)}
                                className="input-erp-primary input-erp-default w-full">
                                {currentGrade?.items?.map((item: any, j: number) => {
                                  return item.key && item.value && <option key={j} value={`${item.code}-${currentGrade?.id}`}>{item.value}</option>
                                })}
                              </select>
                          </TableCell>
                        );
                      })}

                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">
                        <input {...register(`variations.${index}.stock`)} type="number" maxLength={40} placeholder="Estoque Atual" className="input-erp-primary input-erp-default w-full"/>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button 
            type="button" 
            onClick={addNewLine}
            className="flex items-center gap-2 bg-[#1a2233] text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-black transition-colors"
          >
            <FaPlus size={12} /> Adicionar nova variação
          </button>
          <button 
            type="button"
            className="flex items-center gap-2 bg-[#7b1d4a] text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-[#5a1536] transition-colors"
          >
            <FaBarcode size={14} /> Gerar código de barra
          </button>
        </div>
      </ComponentCard>
      <Button onClick={() => {}} type="submit" className="w-full xl:max-w-20 mt-2" size="sm">Salvar</Button>
    </>
  );
}