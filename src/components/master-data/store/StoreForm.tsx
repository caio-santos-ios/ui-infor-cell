"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import StoreAddressForm from "./StoreAddressForm";
import { ResetStore, TStore } from "@/types/master-data/store/store.type";
import StoreDataForm from "./StoreDataForm";
import "./style.css";

type TProp = {
  id?: string;
};

export default function StoreForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [logoStore, setLogoStore] = useState<any>("");
  const [tabs] = useState<any[]>([
    {key: 'data', title: 'Dados Gerais'},
    {key: 'address', title: 'Endereço'},
  ]);
  const [currentTab, setCurrentTab] = useState<any>({key: 'data', title: 'Dados Gerais'});
  const router = useRouter();

  const { reset, watch } = useForm<TStore>({
    defaultValues: ResetStore
  });

  const getById = async (id: string) => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/stores/${id}`, configApi());
      const result = data.result.data;
      reset(result);
      setLogoStore(result.photo)
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
        {currentTab.key == "data" && <StoreDataForm id={id} />}
        {currentTab.key == "address" && <StoreAddressForm parentId={id} address={watch("address")} />}
      </div>     
    </>
  );
}