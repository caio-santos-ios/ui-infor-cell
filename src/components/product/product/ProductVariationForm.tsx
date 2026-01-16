"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import { useRouter } from "next/navigation";
import { ResetProduct, TProduct } from "@/types/product/product/product.type";
import { TCategorie } from "@/types/product/categorie/categorie.type";
import Button from "@/components/ui/button/Button";
import { FaPlus, FaCheck } from "react-icons/fa6";
import { MdClose } from "react-icons/md";

type TProp = {
  id?: string;
};

export default function ProductVariationForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [categories, setCategory] = useState<TCategorie[]>([]);
  const router = useRouter();  

  const { register, control, getValues, reset } = useForm<TProduct>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variations", 
  });

  const save = async (body: TProduct, action: string) => {
    if(action == "create") {
      body.variations.push({
        sequence: body.variations.length + 1,
        key: "",
        value: ""
      });
    };

    await update(body);
    console.log(body)
  };

  const clean = async (body: TProduct, index: number) => {
    body.variations = body.variations.filter((_: any, i: number) => i != index);
    await update(body);
    console.log(body)
  };

  const update: SubmitHandler<TProduct> = async (body: TProduct) => {
    try {
      setIsLoading(true);
      const {data} = await api.put(`/products`, body, configApi());
      const result = data.result;
      resolveResponse({status: 200, message: result.message});
      await getById(id!);
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
        <div className="grid grid-cols-8 gap-2 container-form">  
          {fields.map((field, index) => {
            return (
              <React.Fragment key={field.id}>
                <div className="col-span-6 xl:col-span-2">
                  <Label title="Nome" required={false}/>
                  <input placeholder="Nome" {...register(`variations.${index}.key` as const)} type="text" className="input-erp-primary input-erp-default" />
                </div>
                <div className="col-span-6 xl:col-span-4">
                  <Label title="Valor" required={false}/>
                  <input placeholder="Valor" {...register(`variations.${index}.value` as const)} type="text" className="input-erp-primary input-erp-default" />
                </div>
                <div className="col-span-6 xl:col-span-2 self-end">
                  {
                    index < (fields.length - 1) ?
                    <Button onClick={() => save({ ...getValues() }, "update")} type="button" className="w-full xl:max-w-10 mt-2 me-2" size="sm">
                      <FaCheck />
                    </Button>
                    :
                    <Button onClick={() => save({ ...getValues() }, "create")} type="button" className="w-full xl:max-w-10 mt-2 me-2" size="sm">
                      <FaPlus />                      
                    </Button>

                  }

                  {
                    index < (fields.length - 1) &&
                    <Button onClick={() => clean({ ...getValues() }, index)} type="button" className="w-full xl:max-w-10 mt-2" size="sm">
                      <MdClose />
                    </Button>
                  }
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </ComponentCard>
    </>
  );
}