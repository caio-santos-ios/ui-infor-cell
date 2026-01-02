"use client";

import ComponentCard from "@/components/common/ComponentCard";
// import CheckboxComponents from "@/components/form/form-elements/CheckboxComponents";
// import DefaultInputs from "@/components/form/form-elements/DefaultInputs";
// import FileInputExample from "@/components/form/form-elements/FileInputExample";
// import InputGroup from "@/components/form/form-elements/InputGroup";
// import InputStates from "@/components/form/form-elements/InputStates";
// import RadioButtons from "@/components/form/form-elements/RadioButtons";
// import SelectInputs from "@/components/form/form-elements/SelectInputs";
// import TextAreaInput from "@/components/form/form-elements/TextAreaInput";
// import ToggleSwitch from "@/components/form/form-elements/ToggleSwitch";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { ResetCompany, TCompany } from "@/jotai/masterData/company.type";
import { api, uriBase } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { maskCNPJ, maskPhone } from "@/utils/mask.util";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import "./style.css";
import DropzoneComponent from "@/components/form/form-elements/DropZone";

type TProp = {
  id?: string;
};

export default function CompanyForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [logoCompany, setLogoCompany] = useState<string>("");

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
      // console.log(result)
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
      console.log(result.photo)
      setLogoCompany(result.photo)
      localStorage.setItem("logoCompany", result.photo);
      resolveResponse({status, ...data});
    } catch (error) {
      resolveResponse(error);
    }
  };

  useEffect(() => {
    if(id != "create") {
      getById(id!);
    };
  }, []);

  return (
    <>
      <div className="container-form">
        <ComponentCard title="Dados Cadastrais">
          <div className="grid grid-cols-6 gap-2">
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
              <Label title="Site"/>
              <input placeholder="Site" {...register("website")} type="text" className="input-erp input-erp-default"/>
            </div>           
            <div className="col-span-6 xl:col-span-4">
              <DropzoneComponent sendFile={uploadFile} title="Logo da Empresa" />
            </div>           
            <div className="col-span-6 xl:col-span-2">
              <img className="w-full h-full object-cover" src={`${uriBase}/${logoCompany}`} alt="logo da empresa" />
            </div>           
          </div>
        </ComponentCard>
      </div>
      <div className="col-span-6">
        <Button onClick={() => save({...getValues()})} type="submit" className="w-full xl:w-20" size="sm">Salvar</Button>
      </div>
    </>
  );
}