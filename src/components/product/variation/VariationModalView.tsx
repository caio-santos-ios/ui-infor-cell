"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { variationModalViewAtom, variationSerialModalAtom } from "@/jotai/product/variation/variation.jotai";
import { useFieldArray, useForm } from "react-hook-form";
import { ResetVariation, TVariation, TVariationItem } from "@/types/product/variation/variation.type";
import Label from "@/components/form/Label";
import { MdClose, MdPlusOne } from "react-icons/md";
import React, { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { FaCheck } from "react-icons/fa6";
import { toast } from "react-toastify";

type TProps = {
  id?: string;
  index: number;
  send: () => void
}

export default function VariationModalView({id, index, send}: TProps) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [modalCreate, setModalCreate] = useAtom(variationModalViewAtom);
  const [variation, setVariation] = useState<TVariation>(ResetVariation);
  
  return (
    <Modal isOpen={modalCreate} onClose={() => {
      send();
      setModalCreate(false);
    }} className="max-w-[600px] m-4">
      <div className="no-scrollbar relative w-full max-w-[600px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Visualizar Variações</h4>
        </div>

        <form className="flex flex-col">
          <div className="custom-scrollbar max-h-[70dvh] overflow-y-auto px-2 pb-3">
            <div className="mt-7">
              <div className="grid grid-cols-3 gap-4">
                {/* {fields.map((field, i) => (
                  <React.Fragment key={field.id}>
                    <div className="col-span-6 xl:col-span-2">
                      <Label title="Número de Série" required={false}/>
                      <input 
                        maxLength={40}
                        {...register(`serial.${i}.value`)} 
                        placeholder="Número de Série" 
                        className="input-erp-primary input-erp-default" 
                      />
                    </div>
                    <div className="col-span-6 xl:col-span-1 self-end flex gap-2">
                      {
                        (totalSerial - 1) == i &&
                        <div title="Adicionar" onClick={() => updateVariation(i, "create")} className="cursor-pointer text-black dark:text-white bg-green-400 hover:bg-green-600 rounded-lg flex justify-center items-center w-12 h-8">
                          <IoMdAdd />
                        </div>
                      }
                      <div title="Salvar" onClick={() => updateVariation(i, "update", true)} className="cursor-pointer text-black dark:text-white bg-blue-400 hover:bg-blue-600 rounded-lg flex justify-center items-center w-12 h-8">
                        <FaCheck />
                      </div>
                      <div title="Excluír" onClick={() => removeVariation(i)} className="cursor-pointer text-black dark:text-white bg-red-400 hover:bg-red-600 rounded-lg flex justify-center items-center w-12 h-8">
                        <MdClose size={20}/>
                      </div>
                    </div>
                  </React.Fragment>
                ))} */}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={() => {
              send();
              setModalCreate(false);
            }}>Cancelar</Button>
          </div>
        </form>
      </div>
    </Modal> 
  );
}