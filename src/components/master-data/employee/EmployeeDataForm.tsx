"use client";

import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { maskCNPJ, maskCPF, maskPhone } from "@/utils/mask.util";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ResetEmployee, TEmployee } from "@/types/master-data/employee/employee.type";

type TProp = {
  id?: string;
};

export default function EmployeeDataForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const router = useRouter();

  const { register, handleSubmit, reset, setValue, watch, getValues, formState: { errors }} = useForm<TEmployee>({
    defaultValues: ResetEmployee
  });

  const save = async (body: TEmployee) => {
    if(!body.id) {
      await create(body);
    } else {
      await update(body);
    };
  } 
    
  const create: SubmitHandler<TEmployee> = async (body: TEmployee) => {
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
  
  const update: SubmitHandler<TEmployee> = async (body: TEmployee) => {
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
            <Label title="Nome"/>
            <input placeholder="Nome" {...register("name")} type="text" className="input-erp-primary input-erp-default"/>
          </div>

          <div className="col-span-6 xl:col-span-2">
            <Label title="CPF"/>
            <input placeholder="CPF" onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskCPF(e)} {...register("cpf")} type="text" className="input-erp-primary input-erp-default"/>
          </div>

          <div className="col-span-6 xl:col-span-2">
            <Label title="RG" required={false}/>
            <input placeholder="RG" {...register("rg")} type="text" className="input-erp-primary input-erp-default"/>
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
            <Label title="Tipo"/>
            <select className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:text-white/90 dark:bg-dark-900">
              <option value="technical" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Técnico</option>
              <option value="seller" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Vendedor</option>
            </select>
          </div>                
          <div className="col-span-6 xl:col-span-2">
            <Label title="Idade" required={false}/>
            <input placeholder="Idade" onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("whatsapp")} type="text" className="input-erp-primary input-erp-default"/>
          </div>
        </div>
      </ComponentCard>
      <Button onClick={() => save({...getValues()})} type="submit" className="w-full xl:max-w-20 mt-2" size="sm">Salvar</Button>
    </>
  );
}