"use client";

import Label from "@/components/form/Label";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { maskCNPJ, maskPhone } from "@/utils/mask.util";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import "./style.css";
import DropzoneComponent from "@/components/form/form-elements/DropZone";
import { CompanyLogo } from "@/components/logoCompany/LogoCompany";
import { useRouter } from "next/navigation";
import { ResetAddress, TAddress } from "@/types/master-data/address/address";
import axios from "axios";
import Button from "@/components/ui/button/Button";
import ComponentCard from "@/components/common/ComponentCard";

type TProp = {
  address: TAddress,
  parentId?: string;
};

export default function CompanyAddressForm({address, parentId}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [logoCompany, setLogoCompany] = useState<string>("");
  const router = useRouter();

  const { register, handleSubmit, reset, setValue, watch, getValues, formState: { errors }} = useForm<TAddress>({
    defaultValues: ResetAddress
  });

  const save = async (body: TAddress) => {
    if(!body.id) {
      console.log(body)
      await create(body);
    } else {
      await update(body);
    };
  } 
    
  const create: SubmitHandler<TAddress> = async (body: TAddress) => {
    try {
      setIsLoading(true);
      const {data} = await api.post(`/addresses`, body, configApi());
      reset(data.result.data)
      resolveResponse({status: 201, message: data.result.message});
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const update: SubmitHandler<TAddress> = async (body: TAddress) => {
    try {
      setIsLoading(true);
      const {data} = await api.put(`/addresses`, body, configApi());
      resolveResponse({status: 200, message: data.result.message});
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAddressByZipCode = async (zipCode: React.ChangeEvent<HTMLInputElement>, parent: string) => {
    let value = zipCode.target.value.replace(/\D/g, "");

    if(value.length == 8) {
      setIsLoading(true);
      const {data} = await axios.get(`https://viacep.com.br/ws/${value}/json/`);

      const address = {
        id: watch("id"),
        city: data.localidade,
        complement: data.complemento,
        neighborhood: data.bairro,
        number: watch("number"),
        parent: "company",
        parentId,
        state: data.estado,
        street: data.logradouro,
        zipCode: data.cep
      };

      reset(address);
      
      setIsLoading(false);
    };
  };

  useEffect(() => {
    if(address.id) {
      reset(address);
    };
  }, []);

  return (
    <>
      <ComponentCard title="Endereço">
        <div className="grid grid-cols-6 gap-2 container-form">
          <div className={`flex flex-col col-span-6 lg:col-span-1 mb-2`}>
            <Label title="CEP" />
            <input placeholder="Digite" onInput={(e: React.ChangeEvent<HTMLInputElement>) => getAddressByZipCode(e, '')} {...register("zipCode")} type="text" className="input-erp input-erp-default"/>
          </div>
          <div className={`flex flex-col col-span-6 lg:col-span-1 mb-2`}>
            <Label title="Número" />
            <input {...register("number")} type="text" className={`input-erp input-erp-default`} placeholder="Digite"/>
          </div>
          <div className={`flex flex-col col-span-6 lg:col-span-4 mb-2`}>
            <Label title="Rua" />
            <input {...register("street")} type="text" className={`input-erp input-erp-default`} placeholder="Digite"/>
          </div>
          <div className={`flex flex-col col-span-6 lg:col-span-2 mb-2`}>
            <Label title="Bairro" />
            <input {...register("neighborhood")} type="text" className={`input-erp input-erp-default`} placeholder="Digite"/>
          </div>
          <div className={`flex flex-col col-span-6 lg:col-span-2 mb-2`}>
            <Label title="Cidade" />
            <input {...register("city")} type="text" className={`input-erp input-erp-default`} placeholder="Digite"/>
          </div>
          <div className={`flex flex-col col-span-6 lg:col-span-2 mb-2`}>
            <Label title="Estado" />
            <input {...register("state")} type="text" className={`input-erp input-erp-default`} placeholder="Digite"/>
          </div>
          <div className={`flex flex-col col-span-6 mb-2`}>
            <Label title="Complemento" required={false} />
            <input {...register("complement")} type="text" className={`input-erp input-erp-default`} placeholder="Digite"/>
          </div>          
        </div>
      </ComponentCard>

      <Button onClick={() => save({...getValues()})} type="submit" className="w-full xl:w-20 mt-2" size="sm">Salvar</Button>
    </>
  );
}