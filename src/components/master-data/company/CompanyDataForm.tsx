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

type TProp = {
  id?: string;
};

export default function CompanyDataForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [logoCompany, setLogoCompany] = useState<string>("");
  const router = useRouter();

  const { register, handleSubmit, reset, setValue, watch, getValues, formState: { errors }} = useForm<TCompany>({
    defaultValues: ResetCompany
  });

  const save = async (body: TCompany) => {
    if(!body.id) {
      await create(body);
    } else {
      await update(body);
    };
  } 
    
  const create: SubmitHandler<TCompany> = async (body: TCompany) => {
    try {
      setIsLoading(true);
      const {data} = await api.post(`/companies`, body, configApi());
      resolveResponse({status: 201, message: data.result.message});
      router.push(`/master-data/companies/${data.result.data.id}`)
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const update: SubmitHandler<TCompany> = async (body: TCompany) => {
    try {
      setIsLoading(true);
      const {data} = await api.put(`/companies`, body, configApi());
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

  const uploadFile = async (file: File[]) => {
    const formBody = new FormData();
    formBody.append("id", id!);
    const fileToUpload = file[0];
    formBody.append('photo', fileToUpload);
    await updatePhoto(formBody);
  };

  const updatePhoto = async (form: FormData) => {
    try {
      const { status, data} = await api.put(`/companies/logo`, form, configApi(false));
      const result = data.result.data;
      setLogoCompany(result.photo)
      localStorage.setItem("logoCompany", result.photo);
      resolveResponse({status, ...data});
    } catch (error) {
      resolveResponse(error);
    }
  };

  const normalizeLogoCompany = () => {
    return `${uriBase}/${logoCompany}`;
  };

  useEffect(() => {
    if(id != "create") {
      console.log(id)
      getById(id!);
    };
  }, []);

  return (
    <>

      <ComponentCard title="Dados Gerais">
        <div className="grid grid-cols-6 gap-2 container-form">
          <div className="col-span-6 xl:col-span-2">
            <Label title="Razão social"/>
            <input placeholder="Razão social" {...register("corporateName")} type="text" className="input-erp input-erp-default"/>
          </div>

          <div className="col-span-6 xl:col-span-2">
            <Label title="Nome fantasia"/>
            <input placeholder="Nome fantasia" {...register("tradeName")} type="text" className="input-erp input-erp-default"/>
          </div>
          
          <div className="col-span-6 xl:col-span-2">
            <Label title="CNPJ"/>
            <input placeholder="CNPJ" onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskCNPJ(e)} {...register("document")} type="text" className="input-erp input-erp-default"/>
          </div>

          <div className="col-span-6 xl:col-span-2">
            <Label title="E-mail"/>
            <input placeholder="E-mail" {...register("email")} type="email" className="input-erp input-erp-default"/>
          </div>
          
          <div className="col-span-6 xl:col-span-2">
            <Label title="Telefone"/>
            <input placeholder="Telefone" onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("phone")} type="text" className="input-erp input-erp-default"/>
          </div>
          
          <div className="col-span-6 xl:col-span-2">
            <Label title="WhatsApp (Opcional)" required={false}/>
            <input placeholder="Whatsapp" onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("whatsapp")} type="text" className="input-erp input-erp-default"/>
          </div>
          
          <div className="col-span-6 xl:col-span-2">
            <Label title="Inscrição estadual"/>
            <input placeholder="Inscrição estadual" {...register("stateRegistration")} type="text" className="input-erp input-erp-default"/>
          </div>           

          <div className="col-span-6 xl:col-span-2">
            <Label title="Inscrição municipal"/>
            <input placeholder="Inscrição municipal" {...register("municipalRegistration")} type="text" className="input-erp input-erp-default"/>
          </div>           
          
          <div className="col-span-6 xl:col-span-2">
            <Label title="Site" required={false}/>
            <input placeholder="Site" {...register("website")} type="text" className="input-erp input-erp-default"/>
          </div>           
          <div className="col-span-6 xl:col-span-4">
            <DropzoneComponent sendFile={uploadFile} title="Logo da Empresa" />
          </div>           
          <div className="col-span-6 xl:col-span-2">
            {/* <CompanyLogo height={400} width={400} /> */}
            {
              logoCompany ?
              <img style={{width: `${400}px`, height: `${400}px`}} className="w-full h-full object-cover rounded-xl" src={normalizeLogoCompany()} alt="logo da empresa" />
              :
              <div className="border border-dashed border-(--erp-primary-color) p-3 text-(--erp-primary-color) rounded-xl h-full flex justify-center items-center">
                <p>Logo da Empresa</p>
              </div>
            }
          </div>           
        </div>
      </ComponentCard>
      <Button onClick={() => save({...getValues()})} type="submit" className="w-full xl:w-20 mt-2" size="sm">Salvar</Button>
    </>
  );
}