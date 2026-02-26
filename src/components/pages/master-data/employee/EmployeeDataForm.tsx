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
import { ResetEmployee, TEmployee } from "@/types/master-data/employee/employee.type";
import MultiSelect from "@/components/form/MuiltSelect";
import { TStore } from "@/types/master-data/store/store.type";
import { TProfilePermission } from "@/types/setting/profile-permission/profile-permission.type";

type TProp = {
  id?: string;
};

export default function EmployeeDataForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [stores, setStore] = useState<any[]>([]);
  const [myStores, setMyStore] = useState<string[]>([])
  const [profilePermissions, setProfilePermission] = useState<TProfilePermission[]>([])
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
      const {data} = await api.post(`/users/employee`, body, configApi());
      const result = data.result;
      resolveResponse({status: 201, message: result.message});
      router.push(`/master-data/employees/${result.data.id}`)
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const update: SubmitHandler<TEmployee> = async (body: TEmployee) => {
    try {
      setIsLoading(true);
      const {data} = await api.put(`/employees`, body, configApi());
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
      const {data} = await api.get(`/users/employee/${id}`, configApi());
      const result = data.result.data;
      setMyStore(result.stores);
      reset(result);
      const date = result.dateOfBirth.split("T")[0];
      setValue("dateOfBirth", date);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectStore = async () => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/stores/select?deleted=false`, configApi());
      const result = data.result.data;

      const list = result.map((x: TStore) => ({key: x.id, text: x.tradeName, selected: false}));
      setStore(list);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getSelectProfilePermission = async () => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/profile-permissions/select?deleted=false&active=true`, configApi());
      const result = data.result.data;
      setProfilePermission(result);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initial = async () => {
      await getSelectStore();
      await getSelectProfilePermission();
      if(id != "create") {
        await getById(id!);
      };
    };
    initial();

  }, []);

  return (
    <>
      <ComponentCard title="Dados Gerais" hasHeader={false}>
        <div className="grid grid-cols-6 gap-2 container-form">
          <div className="col-span-6 xl:col-span-2">
            <Label title="Lojas" required={false}/>
            <MultiSelect 
              options={stores}
              selectedValues={myStores}
              placeholder="Selecione as lojas"
              onChange={(selectedStores) => setValue("stores", selectedStores)}
            />
          </div>

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
            <Label title="WhatsApp" required={false}/>
            <input placeholder="Whatsapp" onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("whatsapp")} type="text" className="input-erp-primary input-erp-default"/>
          </div>
          
          <div className="col-span-6 xl:col-span-2">
            <Label title="Tipo"/>
            <select {...register("type")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
              <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Selecione</option>
              {
                profilePermissions.map(profile => {
                  return <option key={profile.id} value={profile.id} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{profile.name}</option>
                })
              }
            </select>
          </div>  

          <div className="col-span-6 xl:col-span-1">
            <Label title="Data de Nascimento" required={false}/>
            <input placeholder="Data de Nascimento" {...register("dateOfBirth")} type="date" className="input-erp-primary input-erp-default"/>
          </div>
          
          
        </div>
      </ComponentCard>
      <Button onClick={() => save({...getValues()})} type="submit" className="w-full xl:max-w-20 mt-2" size="sm">Salvar</Button>
    </>
  );
}