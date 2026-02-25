"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { ResetCompany, TCompany } from "@/types/master-data/company/company.type";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import CompanyDataForm from "./CompanyDataForm";
import CompanyAddressForm from "./CompanyAddressForm";

type TProp = {
  id?: string;
};

export default function CompanyForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [__, setLogoCompany] = useState<any>("");
  const [tabs] = useState<any[]>([
    {key: 'data', title: 'Dados Gerais'},
    {key: 'address', title: 'Endereço'},
  ]);
  const [currentTab, setCurrentTab] = useState<any>({key: 'data', title: 'Dados Gerais'});

  const { reset, watch } = useForm<TCompany>({
    defaultValues: ResetCompany
  });

  const getById = async (id: string) => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/companies/${id}`, configApi());
      const result = data.result.data;
      reset(result);
      setLogoCompany(result.photo)
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
      <div className="flex gap-4 mb-2">
        {
          tabs.map((x: any) => {
            return <button onClick={() => setCurrentTab(x)} className={`${currentTab.key == x.key ? 'bg-blue-400 text-white' : ''} px-3 py-1 rounded-xl`} key={x.key}>{x.title}</button>
          })
        }
      </div>
      <div className="mb-2">
        {currentTab.key == "data" && <CompanyDataForm id={id} />}
        {currentTab.key == "address" && <CompanyAddressForm parentId={id} address={watch("address")} />}
      </div>     
    </>
  );
}