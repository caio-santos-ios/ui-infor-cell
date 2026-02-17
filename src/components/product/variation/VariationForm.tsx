"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { FaPlus, FaCheck } from "react-icons/fa6";
import { MdClose, MdQrCode } from "react-icons/md";
import Switch from "@/components/form/Switch";
import { TVariation } from "@/types/product/variation/variation.type";
import { variationSerialModalAtom } from "@/jotai/product/variation/variation.jotai";

type TProp = { id?: string; };

export default function VariationForm({ id }: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [__, setModalCreate] = useAtom(variationSerialModalAtom);
  const [variationIndex, setVariationIndex] = useState<number>(-1);

  const { register, control, reset, getValues, watch } = useForm<TVariation>({
    defaultValues: { items: [] }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const getById = async (variationId: string) => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/variations/${variationId}`, configApi());
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

  const update = async (showToastfy: boolean = true) => {
    const body = getValues(); 
    try {
      setIsLoading(true);
      await api.put(`/variations`, body, configApi());
      if(showToastfy) {
        resolveResponse({ status: 200, message: "Variações atualizadas!" });
      }
      if (id) await getById(id);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const addNewVariation = () => {
    append({
      code: (fields.length + 1).toString().padStart(6, '0'),
      key: "",
      value: "",
      active: true,
      deleted: false,
      serial: [{value: ''}]
    });

    update(false); 
  };

  const removeVariation = (index: number) => {
    let itemsNew = getValues().items;
    const newItem: any = {...itemsNew[index]};
    newItem.deleted = true;
    itemsNew[index] = newItem;

    reset({
      ...getValues(),
      items: itemsNew,
    });
    console.log(itemsNew)
    // remove(index);
    update();
  };

  const openModalSerial = (index: number) => {
    setVariationIndex(index);
    setModalCreate(true);
  };

  const closeModalSerial = () => {
    setVariationIndex(-1);
  };

  return (
    <ComponentCard title={`Variação: ${watch('name')}`} hasHeader={true}>
      <div className="grid grid-cols-6 gap-4 container-form">
        {fields.map((field, index) => (
          !field.deleted &&
          <React.Fragment key={field.id}>
            <div className="col-span-6 xl:col-span-2">
              <Label title="Nome (Atributo)" required={false}/>
              <input 
                {...register(`items.${index}.key`)} 
                placeholder="Ex: Cor" 
                className="input-erp-primary input-erp-default" 
              />
            </div>

            <div className="col-span-6 xl:col-span-2">
              <Label title="Valor" required={false}/>
              <input 
                {...register(`items.${index}.value`)} 
                placeholder="Ex: Azul" 
                className="input-erp-primary input-erp-default" 
              />
            </div>

            <div className="col-span-6 xl:col-span-1">
              <Label title={watch(`items.${index}.active`) ? 'Ativo' : 'Inativo'} required={false}/>
              <Controller
                name={`items.${index}.active`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Switch defaultChecked={value} onChange={onChange} />
                )}
              />
            </div>

            <div className="col-span-6 xl:col-span-1 self-end flex gap-2">
              <div title="Excluír" onClick={() => removeVariation(index)} className="cursor-pointer text-black dark:text-white bg-red-400 hover:bg-red-600 p-1 rounded-lg">
                <MdClose size={20}/>
              </div>
              {/* <div title="Adicionar serial" onClick={() => openModalSerial(index)} className="cursor-pointer text-black dark:text-white bg-blue-400 hover:bg-blue-600 p-1 rounded-lg">
                <MdQrCode size={20}/>
              </div> */}
            </div>
          </React.Fragment>
        ))}

        
      </div>
      <div className="col-span-12 mt-4">
        <div className="flex">
          <Button onClick={addNewVariation} type="button" className="gap-2">
            <FaPlus /> Adicionar Variação
          </Button>
          
          <Button onClick={update} type="button" className="ml-4 bg-green-600 hover:bg-green-700 gap-2">
            <FaCheck /> Salvar Alterações
          </Button>
        </div>
      </div>

      {/* <VariationSerialModalCreate id={id} send={closeModalSerial} index={variationIndex} /> */}
    </ComponentCard>
  );
}