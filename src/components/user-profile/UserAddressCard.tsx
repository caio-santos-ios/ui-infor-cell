"use client";

import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { useAtom } from "jotai";
import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { ResetUserProfile, TUserProfile } from "@/types/master-data/user/user.type";
import Label from "../form/Label";
import axios from "axios";

export default function UserAddressCard() {
  const [userLogger, setUserLogger] = useAtom(userLoggerAtom);
  const [_, setIsLoading] = useAtom(loadingAtom);
  const { isOpen, openModal, closeModal } = useModal();

  const { register, handleSubmit, watch, reset, setValue, getValues, formState: { errors }} = useForm<TUserProfile>({
    defaultValues: ResetUserProfile
  });

  const handleSave = async (body: TUserProfile) => {
    const address = {
      ...body.address
    };

    if(!address.id) {
      await create(address);
    } else {
      await update(address);
    }
  };

  const create = async (body: any) => {
    try {
    const { status, data} = await api.post(`/addresses`, body, configApi());
      resolveResponse({status, ...data});
      getUser();
      closeModal();
    } catch (error) {
      resolveResponse(error);
    }
  };

  const update = async (body: any) => {
    try {
    const { status, data} = await api.put(`/addresses`, body, configApi());
      resolveResponse({status, ...data});
      getUser();
      closeModal();
    } catch (error) {
      resolveResponse(error);
    }
  };

  const getUser = async () => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/users/logged`, configApi());
      const result = data.result.data;

      reset({
        id: result.id,
        name: result.name,
        email: result.email,
        phone: result.phone,
        whatsapp: result.whatsapp,
        photo: result.photo,
        address: {
          id: result.address.id ? result.address.id : "",
          zipCode: result.address.zipCode,
          city: result.address.city,
          complement: result.address.complement,
          neighborhood: result.address.neighborhood,
          number: result.address.number,
          parent: result.address.parent,
          parentId: result.address.parentId,
          state: result.address.state,
          street: result.address.street
        } 
      });
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
        id: watch("address.id"),
        city: data.localidade,
        complement: data.complemento,
        neighborhood: data.bairro,
        number: watch("address.number"),
        parent: "user-profile",
        parentId: watch("id"),
        state: data.estado,
        street: data.logradouro,
        zipCode: data.cep
      };

      reset({
        ...getValues(),
        address
      });
      
      setIsLoading(false);
    };
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Endereço
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                {watch("address.street")}, {watch("address.number")}
              </p>
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Bairro
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {watch("address.neighborhood")}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Cidade/Estado
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {watch("address.state") ? `${watch("address.city")}/${watch("address.state")}` : watch("address.city")}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  CEP
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {watch("address.zipCode")}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Editar
          </button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Editar Endereço
            </h4>
          </div>
          <form onSubmit={handleSubmit(handleSave)} className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-6">
                <div className={`flex flex-col col-span-6 lg:col-span-3 mb-2`}>
                  <Label title="CEP" />
                  <input placeholder="Digite" onInput={(e: React.ChangeEvent<HTMLInputElement>) => getAddressByZipCode(e, '')} {...register("address.zipCode")} type="text" className="input-erp-primary input-erp-default"/>
                </div>
                <div className={`flex flex-col col-span-6 lg:col-span-3 mb-2`}>
                  <Label title="Número" />
                  <input {...register("address.number")} type="text" className={`input-erp-primary input-erp-default`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-6 mb-2`}>
                  <Label title="Rua" />
                  <input {...register("address.street")} type="text" className={`input-erp-primary input-erp-default`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-6 lg:col-span-3 mb-2`}>
                  <Label title="Bairro" />
                  <input {...register("address.neighborhood")} type="text" className={`input-erp-primary input-erp-default`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-6 lg:col-span-3 mb-2`}>
                  <Label title="Cidade" />
                  <input {...register("address.city")} type="text" className={`input-erp-primary input-erp-default`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-6 lg:col-span-3 mb-2`}>
                  <Label title="Estado" />
                  <input {...register("address.state")} type="text" className={`input-erp-primary input-erp-default`} placeholder="Digite"/>
                </div>
                <div className={`flex flex-col col-span-6 mb-2`}>
                  <Label title="Complemento" required={false} />
                  <input {...register("address.complement")} type="text" className={`input-erp-primary input-erp-default`} placeholder="Digite"/>
                </div>
              </div> 
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button size="sm" type="submit">
                Salvar
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
