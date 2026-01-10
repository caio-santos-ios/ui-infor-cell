"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { ResetCategorie, TCategorie } from "@/types/product/categorie/categorie.type";

type TProp = {
  id?: string;
};

export default function ProductForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const router = useRouter();  

  const { getValues, reset, register } = useForm<TCategorie>({
    defaultValues: ResetCategorie
  });

  const save = async (body: TCategorie) => {
    if(!body.id) {
      await create(body);
    } else {
      await update(body);
    };
  };
      
  const create: SubmitHandler<TCategorie> = async (body: TCategorie) => {
    try {
      setIsLoading(true);
      const {data} = await api.post(`/categories`, body, configApi());
      const result = data.result;
      resolveResponse({status: 201, message: result.message});
      router.push(`/product/categories/${result.data.id}`)
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };
    
  const update: SubmitHandler<TCategorie> = async (body: TCategorie) => {
    try {
      setIsLoading(true);
      const {data} = await api.put(`/categories`, body, configApi());
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
      const {data} = await api.get(`/categories/${id}`, configApi());
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
      <ComponentCard title="Dados Gerais">
        <div className="grid grid-cols-6 gap-2 container-form">  
          <div className="col-span-6 xl:col-span-2">
            <Label title="Nome" />
            <input placeholder="Nome" {...register("name")} type="text" className="input-erp-primary input-erp-default"/>
          </div>
          <div className="col-span-6 xl:col-span-4">
            <Label title="Descrição" required={false} />
            <input placeholder="Descrição" {...register("description")} type="text" className="input-erp-primary input-erp-default"/>
          </div>
        </div>
      </ComponentCard>
      <Button onClick={() => save({...getValues()})} type="submit" className="w-full xl:max-w-20 mt-2" size="sm">Salvar</Button>
    </>
  );
}