"use client";

import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ResetModule, TModule, TRoutine } from "@/types/master-data/employee/employee.type";
import { iconAtom } from "@/jotai/global/icons.jotai";
import { menuRoutinesAtom } from "@/jotai/global/menu.jotai";
import { NavItem } from "@/types/global/menu.type";

type TProp = {
  id?: string;
  modules: any[]
};

export default function EmployeeModulesForm({id, modules}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [icons] = useAtom(iconAtom);
  const [menus] = useAtom(menuRoutinesAtom);
  const [routines, setRoutine] = useState([]);
  const [myRoutines, setMyRoutine] = useState([]);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const router = useRouter();

  const { register, handleSubmit, reset, setValue, watch, getValues, formState: { errors }} = useForm<TRoutine>({
    defaultValues: ResetModule
  });

  const save = async (body: TRoutine) => {
    if(body.code) {
      const currentModule: any = menus.find(x => x.code == watch("module"));
      const index = modules.findIndex((m: any) => m.code == watch("module"));

      if(index >= 0) {
        const subModuleIndexSaved = modules[index].routines.findIndex((x: any) => x.code == watch("code"));
        
        if(subModuleIndexSaved >= 0) {
          modules[index].routines[subModuleIndexSaved].permissions = {
            create: watch("permissions.create"),
            read: watch("permissions.read"),
            update: watch("permissions.update"),
            delete: watch("permissions.delete"),
          };
        } else {
            const currentModule = modules.find((x: any) => x.code == watch("module"));
            const currentSubModule = currentModule?.subMenu.find((x: any) => x.code == watch("code"));

            modules[index].routines.push({     
              code: currentSubModule?.code,
              description: currentSubModule?.description,
              permissions: body.permissions                    
            });                
        };           
      } 
      else {
        const currentSubModule = currentModule.subItems.find((x: any) => x.code == watch("code"));

        modules.push({
          code: currentModule?.code,
          description: currentModule?.name,
          routines: [{
            code: currentSubModule?.code,
            description: currentSubModule?.name,
            permissions: body.permissions
          }]
        });
      };
    };

    const form: any = {
      id, 
      modules
    };

    await update(form);
  };
  
  const update: SubmitHandler<TRoutine> = async (body: any) => {
    try {
      setIsLoading(true);
      const {data} = await api.put(`/employees/modules`, body, configApi());
      const result = data.result;
      resolveResponse({status: 200, message: result.message});
      setValue("permissions", {
        create: false,
        delete: false,
        read: false,
        update: false
      });
      setValue("code", "");
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(watch("module")) {
      const currentModule: any = menus.find(cm => cm.code == watch("module"));
      setRoutine(currentModule.subItems);
      setValue("permissions", {
        create: false,
        delete: false,
        read: false,
        update: false
      });
    };
  }, [watch("module")]);
  
  useEffect(() => {
    if(watch("code")) {
      const currentModule: any = modules.find(m => m.code == watch("module"));
      if(currentModule) {
        const currentRoutine = currentModule.routines.find((r: any) => r.code == watch("code"));
        if(currentRoutine) {
          setValue("permissions", currentRoutine.permissions);
        };
      };
    };
  }, [watch("code")]);

  return (
    <>
      <ComponentCard title="Módulos" hasHeader={false}>
        <div className="container-form">
          <div className="grid grid-cols-12 gap-2 container-form-not-scroll items-end mb-3">

            <div className="col-span-12 md:col-span-4 xl:col-span-3">
              <Label title="Módulo"/>
              <select {...register("module")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Selecione</option>
                {
                  menus.map((m: NavItem) => {
                    return (
                      <option key={m.code} value={m.code} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{m.name}</option>
                    )
                  })
                }
              </select>
            </div>

            <div className="col-span-12 md:col-span-4 xl:col-span-3">
              <Label title="Sub Módulo"/>
              <select {...register("code")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Selecione</option>
                {
                  routines.map((m: NavItem) => {
                    return (
                      <option key={m.code} value={m.code} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{m.name}</option>
                    )
                  })
                }
              </select>
            </div>
            {
              watch("module") &&
              <div className={`flex flex-col col-span-6`}>
                  <ul className="grid grid-cols-1 lg:grid-cols-8 gap-2">
                    <li className="flex flex-col col-span-2 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                      <div className="flex gap-1">
                        <input {...register("permissions.read")} type="checkbox" />
                        <span className="font-bold">Listagem</span>
                      </div>

                      {/* <p className="text-gray-500 text-sm">Permite que o usuário liste registros</p> */}
                    </li>
                    
                    <li className="flex flex-col col-span-2 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                      <div className="flex gap-1">
                        <input {...register("permissions.create")} type="checkbox" />
                        <span className="font-bold">Criação</span>
                      </div>

                      {/* <p className="text-gray-500 text-sm">Permite que o usuário crie registros</p> */}
                    </li>
                    <li className="flex flex-col col-span-2 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                      <div className="flex gap-1">
                        <input {...register("permissions.update")} type="checkbox" />
                        <span className="font-bold">Edição</span>
                      </div>

                        {/* <p className="text-gray-500 text-sm">Permite que o usuário edite registros</p> */}
                    </li>
                    <li className="flex flex-col col-span-2 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                      <div className="flex gap-1">
                        <input {...register("permissions.delete")} type="checkbox" />
                        <span className="font-bold">Exclusão</span>
                      </div>

                      {/* <p className="text-gray-500 text-sm">Permite que o usuário exclua registros</p> */}
                    </li>
                  </ul>
              </div>
          }

            <div className="col-span-12 md:col-span-1 xl:col-span-1">
              <Button onClick={() => save({...getValues()})} type="submit" className="w-full xl:max-w-20 mt-2" size="sm">Salvar</Button>
            </div>
          </div>

          <ul className="grid grid-cols-12 gap-2">
            {
              modules.map((x: TModule) => {
                const menu = menus.find(sub => sub.code == x.code);
                let IconComponent: any = {};
                if(menu) {
                  IconComponent = icons[menu.icon];
                };

                return (
                  <li key={x.code} className="col-span-12 md:col-span-6 lg:col-span-4 relative p-5 bg-white border border-gray-200 rounded-xl shadow-theme-sm dark:border-gray-800 dark:bg-white/5">
                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-5 mr-10 text-base font-semibold text-gray-800 dark:text-white/90">{x.description}</h4>
                        
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">Sub Módulos:</span>
                        </div> 
                        
                        {
                          x.routines.map((r: TRoutine) => {
                            return (
                              <span key={r.code} className="mr-3 mt-3 inline-flex rounded-full px-2 py-0.5 text-theme-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
                                {r.description}
                              </span>
                            )
                          })
                        }
                      </div>
                    </div>
                    <div className="h-6 absolute top-5 right-5 top w-full max-w-6 text-gray-800 dark:text-white/90">
                      {IconComponent && <IconComponent size={20} />}
                    </div>
                  </li>
                )
              })
            }
          </ul>
        </div>
      </ComponentCard>
      {/* <Button onClick={() => save({...getValues()})} type="submit" className="w-full xl:max-w-20 mt-2" size="sm">Salvar</Button> */}
    </>
  );
}