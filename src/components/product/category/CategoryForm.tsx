"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { ResetCategorie, TCategorie } from "@/types/product/categorie/categorie.type";
import { MdAdd } from "react-icons/md";
import { IconDelete } from "@/components/iconDelete/IconDelete";

type TProp = {
  id?: string;
};

export default function CategoryForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const router = useRouter();  

  const { getValues, reset, register, control } = useForm<TCategorie>({
    defaultValues: ResetCategorie
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "subcategories"
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

  const nextCode = () => {
    return `${fields.length + 1}`.padStart(4, '0');
  };

  useEffect(() => {
    if(id != "create") {
      getById(id!);
    };
  }, []);

  return (
    <>
      <ComponentCard title="Dados Gerais">
        <div className="grid grid-cols-12 gap-2">  
          
          <div className="col-span-12 md:col-span-6 lg:col-span-4">
            <Label title="Nome" />
            <input placeholder="Nome" {...register("name")} type="text" className="input-erp-primary input-erp-default"/>
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-8">
            <Label title="Descrição" required={false} />
            <input placeholder="Descrição" {...register("description")} type="text" className="input-erp-primary input-erp-default"/>
          </div>

          <div className="col-span-12 border-t pt-4 mt-2 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <Label title="Subcategorias" required={false} />
              <Button 
                type="button" 
                variant="default" 
                size="sm" 
                onClick={() => { append({ name: "", code: nextCode() }) }}
                className="border border-green-500 bg-green-500 hover:bg-green-800 text-white dark:text-gray-800"
              >
                <MdAdd size={18} /> Adicionar Subcategoria
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border dark:border-gray-700">
                  <input placeholder="Nome da subcategoria" {...register(`subcategories.${index}.name` as const)} type="text" className="input-erp-primary input-erp-default"/>
                  <IconDelete action="delete" getObj={() => remove(index)} />
                </div>  
              ))}
            </div>
            
            {fields.length === 0 && (
              <p className="text-xs text-gray-500 italic">Nenhuma subcategoria adicionada.</p>
            )}
          </div>
        </div>
      </ComponentCard>
      <Button onClick={() => save({...getValues()})} type="submit" className="w-full xl:max-w-20 mt-2" size="sm">Salvar</Button>
    </>
  );
}