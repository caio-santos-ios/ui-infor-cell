"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { ResetModel, TModel } from "@/types/product/model/model.type";
import { TBrand } from "@/types/product/brand/brand.type";
import { TCategorie } from "@/types/product/categorie/categorie.type";

type TProp = {
  id?: string;
};

export default function ModelForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [brands, setBrand] = useState<TBrand[]>([]);
  const [groups, setGroup] = useState<TCategorie[]>([]);
  const router = useRouter();  

  const { getValues, reset, register } = useForm<TModel>({
    defaultValues: ResetModel
  });

  const save = async (body: TModel) => {
    if(!body.id) {
      await create(body);
    } else {
      await update(body);
    };
  };
      
  const create: SubmitHandler<TModel> = async (body: TModel) => {
    try {
      setIsLoading(true);
      const {data} = await api.post(`/models`, body, configApi());
      const result = data.result;
      resolveResponse({status: 201, message: result.message});
      router.push(`/product/models/${result.data.id}`)
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };
    
  const update: SubmitHandler<TModel> = async (body: TModel) => {
    try {
      setIsLoading(true);
      const {data} = await api.put(`/models`, body, configApi());
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
      const {data} = await api.get(`/models/${id}`, configApi());
      const result = data.result.data;
      reset(result);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getSelectBrand = async () => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/brands?deleted=false`, configApi());
      const result = data.result.data;
      setBrand(result)
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getSelectGroup= async (id?: string) => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/models?deleted=false&groupFather=nenhum`, configApi());
      const result = data.result.data;
      if(id) {
        const list = result.filter((x: any) => x.id != id);
        setGroup(list)
      } else {
        setGroup(result)
      };

    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // getSelectBrand();
    getSelectGroup(id);

    if(id != "create") {
      getById(id!);
    };
  }, []);

  return (
    <>
      <ComponentCard title="Dados Gerais">
        <div className="grid grid-cols-12 gap-2 container-form">  
          <div className="col-span-12 xl:col-span-3">
            <Label title="Nome" />
            <input placeholder="Nome" {...register("name")} type="text" className="input-erp-primary input-erp-default"/>
          </div>
          {/* <div className="col-span-12 xl:col-span-2">
            <Label title="Marca"/>
            <select {...register("brandId")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
              <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Selecione</option>
              {
                brands.map((x: TBrand) => {
                  return <option key={x.id} value={x.id} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{x.code} - {x.name}</option>
                })
              }
            </select>
          </div>   */}
          <div className="col-span-12 xl:col-span-3">
            <Label title="Grupo Pai" required={false}/>
            <select {...register("groupFather")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
              <option value="nenhum" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Nenhum</option>
              {
                groups.map((x: TBrand) => {
                  return <option key={x.id} value={x.id} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{x.code} - {x.name}</option>
                })
              }
            </select>
          </div>  
          <div className="col-span-12 xl:col-span-6">
            <Label title="Descrição" required={false} />
            <input placeholder="Descrição" {...register("description")} type="text" className="input-erp-primary input-erp-default"/>
          </div>
        </div>
      </ComponentCard>
      <Button onClick={() => save({...getValues()})} type="submit" className="w-full xl:max-w-20 mt-2" size="sm">Salvar</Button>
    </>
  );
}