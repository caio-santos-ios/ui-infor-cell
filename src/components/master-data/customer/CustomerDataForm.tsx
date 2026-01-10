"use client";

import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { maskCPF, maskPhone } from "@/utils/mask.util";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { TStore } from "@/types/master-data/store/store.type";
import { ResetCustomer, TCustomer } from "@/types/master-data/customer/customer.type";

type TProp = {
  id?: string;
};

export default function CustomerDataForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const router = useRouter();

  const { register, reset, watch, getValues, formState: { errors }} = useForm<TCustomer>({
    defaultValues: ResetCustomer
  });

  const save = async (body: TCustomer) => {
    if(!body.id) {
      await create(body);
    } else {
      await update(body);
    };
  } 
    
  const create: SubmitHandler<TCustomer> = async (body: TCustomer) => {
    try {
      setIsLoading(true);
      const {data} = await api.post(`/customers`, body, configApi());
      const result = data.result;
      resolveResponse({status: 201, message: result.message});
      router.push(`/master-data/customers/${result.data.id}`)
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const update: SubmitHandler<TCustomer> = async (body: TCustomer) => {
    try {
      setIsLoading(true);
      const {data} = await api.put(`/customers`, body, configApi());
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
      const {data} = await api.get(`/customers/${id}`, configApi());
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
        <div className="grid grid-cols-6 gap-2 container-form">  
          <div className="col-span-6 xl:col-span-2">
            <Label title="Tipo"/>
            <select {...register("type")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
              <option value="F" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Pessoa Fisica</option>
              <option value="J" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Pessoa Juridica</option>
            </select>
          </div>  

          <div className="col-span-6 xl:col-span-2">
            <Label title={`${watch("type") == "F" ? "Nome" : "Razão Social"}`}/>
            <input placeholder={`${watch("type") == "F" ? "Nome" : "Razão Social"}`} {...register("corporateName")} type="text" className="input-erp-primary input-erp-default"/>
          </div>

          {
            watch("type") == "J" &&
            <div className="col-span-6 xl:col-span-2">
              <Label title="Nome Fantasia"/>
              <input placeholder="Nome Fantasia" {...register("tradeName")} type="text" className="input-erp-primary input-erp-default"/>
            </div>
          }

          {
            watch("type") == "J" ?
            <div className="col-span-6 xl:col-span-2">
              <Label title="CNPJ"/>
              <input placeholder="CNPJ" {...register("document")} type="text" className="input-erp-primary input-erp-default"/>
            </div>
            :
            <div className="col-span-6 xl:col-span-2">
              <Label title="CPF"/>
              <input placeholder="CPF" onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskCPF(e)} {...register("document")} type="text" className="input-erp-primary input-erp-default"/>
            </div>
          }

          
          <div className="col-span-6 xl:col-span-2">
            <Label title="E-mail"/>
            <input placeholder="E-mail" {...register("email")} type="email" className="input-erp-primary input-erp-default"/>
          </div>          
          
          
          <div className="col-span-6 xl:col-span-2">
            <Label title="Telefone" required={false}/>
            <input placeholder="Telefone" onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("phone")} type="text" className="input-erp-primary input-erp-default"/>
          </div>
          
          <div className="col-span-6 xl:col-span-2">
            <Label title="WhatsApp" required={false}/>
            <input placeholder="Whatsapp" onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("whatsapp")} type="text" className="input-erp-primary input-erp-default"/>
          </div>
        </div>
      </ComponentCard>
      <Button onClick={() => save({...getValues()})} type="submit" className="w-full xl:max-w-20 mt-2" size="sm">Salvar</Button>
    </>
  );
}