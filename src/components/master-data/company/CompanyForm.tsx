"use client";

import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { ResetCompany, TCompany } from "@/types/master-data/company/company.type";
import { api, uriBase } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { maskCNPJ, maskPhone } from "@/utils/mask.util";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import "./style.css";
import DropzoneComponent from "@/components/form/form-elements/DropZone";
import { CompanyLogo } from "@/components/logoCompany/LogoCompany";
import { useRouter } from "next/navigation";
import CompanyDataForm from "./CompanyDataForm";
import CompanyAddressForm from "./CompanyAddressForm";

type TProp = {
  id?: string;
};

export default function CompanyForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [logoCompany, setLogoCompany] = useState<any>("");
  const [tabs] = useState<any[]>([
    {key: 'data', title: 'Dados Gerais'},
    {key: 'address', title: 'Endereço'},
  ]);
  const [currentTab, setCurrentTab] = useState<any>({key: 'data', title: 'Dados Gerais'});
  const router = useRouter();

  const { reset, watch } = useForm<TCompany>({
    defaultValues: ResetCompany
  });

  // const save = async (body: TCompany) => {
  //   if(!body.id) {
  //     await create(body);
  //   } else {
  //     await update(body);
  //   };
  // } 
    
  // const create: SubmitHandler<TCompany> = async (body: TCompany) => {
  //   try {
  //     setIsLoading(true);
  //     const {data} = await api.post(`/companies`, body, configApi());
  //     resolveResponse({status: 201, message: data.result.message});
  //     router.push(`/master-data/companies/${data.result.data.id}`)
  //   } catch (error) {
  //     resolveResponse(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  
  // const update: SubmitHandler<TCompany> = async (body: TCompany) => {
  //   try {
  //     setIsLoading(true);
  //     const {data} = await api.put(`/companies`, body, configApi());
  //     resolveResponse({status: 200, message: data.result.message});
  //   } catch (error) {
  //     resolveResponse(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

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

  // const uploadFile = async (file: File[]) => {
  //   const formBody = new FormData();
  //   formBody.append("id", id!);
  //   const fileToUpload = file[0];
  //   formBody.append('photo', fileToUpload);
  //   await updatePhoto(formBody);
  // };

  // const updatePhoto = async (form: FormData) => {
  //   try {
  //     const { status, data} = await api.put(`/companies/logo`, form, configApi(false));
  //     const result = data.result.data;
  //     setLogoCompany(result.photo)
  //     localStorage.setItem("logoCompany", result.photo);
  //     resolveResponse({status, ...data});
  //   } catch (error) {
  //     resolveResponse(error);
  //   }
  // };

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