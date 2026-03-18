"use client";

import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api, uriBase } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { maskCNPJ, maskPhone } from "@/utils/mask.util";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import "./style.css";
import DropzoneComponent from "@/components/form/form-elements/DropZone";
import { useRouter } from "next/navigation";
import { ResetStore, TStore } from "@/types/master-data/store/store.type";

type TProp = {
  id?: string;
};

export default function StoreDataForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const router = useRouter();

  const { register, handleSubmit, reset, setValue, watch, getValues, formState: { errors }} = useForm<TStore>({
    defaultValues: ResetStore
  });

  const save = async (body: TStore) => {
    if(!body.id) {
      await create(body);
    } else {
      await update(body);
    };
  } 
    
  const create: SubmitHandler<TStore> = async (body: TStore) => {
    try {
      setIsLoading(true);
      const {data} = await api.post(`/stores`, body, configApi());
      resolveResponse({status: 201, message: data.result.message});
      router.push(`/master-data/stores/${data.result.data.id}`)
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const update: SubmitHandler<TStore> = async (body: TStore) => {
    try {
      setIsLoading(true);
      const {data} = await api.put(`/stores`, body, configApi());
      resolveResponse({status: 200, message: data.result.message});
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getById = async (id: string) => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/stores/${id}`, configApi());
      const result = data.result.data;
      console.log(result)
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
            <Label title="Razão social"/>
            <input placeholder="Razão social" {...register("corporateName")} type="text" className="input-erp-primary input-erp-default"/>
          </div>

          <div className="col-span-6 xl:col-span-2">
            <Label title="Nome fantasia"/>
            <input placeholder="Nome fantasia" {...register("tradeName")} type="text" className="input-erp-primary input-erp-default"/>
          </div>
          
          <div className="col-span-6 xl:col-span-2">
            <Label title="CNPJ"/>
            <input placeholder="CNPJ" onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskCNPJ(e)} {...register("document")} type="text" className="input-erp-primary input-erp-default"/>
          </div>

          <div className="col-span-6 xl:col-span-2">
            <Label title="E-mail"/>
            <input placeholder="E-mail" {...register("email")} type="email" className="input-erp-primary input-erp-default"/>
          </div>
          
          <div className="col-span-6 xl:col-span-2">
            <Label title="Telefone"/>
            <input placeholder="Telefone" onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("phone")} type="text" className="input-erp-primary input-erp-default"/>
          </div>
          
          <div className="col-span-6 xl:col-span-2">
            <Label title="WhatsApp (Opcional)" required={false}/>
            <input placeholder="Whatsapp" onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("whatsapp")} type="text" className="input-erp-primary input-erp-default"/>
          </div>
          
          <div className="col-span-6 xl:col-span-2">
            <Label title="Inscrição estadual"/>
            <input placeholder="Inscrição estadual" {...register("stateRegistration")} type="text" className="input-erp-primary input-erp-default"/>
          </div>           

          <div className="col-span-6 xl:col-span-2">
            <Label title="Inscrição municipal"/>
            <input placeholder="Inscrição municipal" {...register("municipalRegistration")} type="text" className="input-erp-primary input-erp-default"/>
          </div>           
          
          <div className="col-span-6 xl:col-span-2">
            <Label title="Site" required={false}/>
            <input placeholder="Site" {...register("website")} type="text" className="input-erp-primary input-erp-default"/>
          </div>          
        </div>
      </ComponentCard>
      <Button onClick={() => save({...getValues()})} type="submit" className="w-full xl:w-20 mt-2" size="sm">Salvar</Button>
    </>
  );
}