"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { variationModalAtom } from "@/jotai/product/variation/variation.jotai";
import { useForm } from "react-hook-form";
import { ResetVariation, TVariation } from "@/types/product/variation/variation.type";
import Label from "@/components/form/Label";
import { useRouter } from "next/navigation";

export default function VariationModalCreate() {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [modalCreate, setModalCreate] = useAtom(variationModalAtom);
  const router = useRouter();

  const { getValues, register } = useForm<TVariation>({
    defaultValues: ResetVariation
  });

  const create = async () => {
    try {
      setIsLoading(true);
      const {data} = await api.post(`/variations`, {...getValues()}, configApi());
      const result = data.result;
      resolveResponse({status: 201, message: result.message});
      router.push(`/product/variations/${result.data.id}`);
      setModalCreate(false);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={modalCreate} onClose={() => setModalCreate(false)} className="max-w-[500] m-4">
      <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Inserir Variação</h4>
        </div>

        <form className="flex flex-col">
          <div className="custom-scrollbar h-[150px] overflow-y-auto px-2 pb-3">
            <div className="mt-7">
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div className="col-span-6 xl:col-span-3">
                  <Label title="Nome" />
                  <input {...register("name")} placeholder="Nome" className="input-erp-primary input-erp-default" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={() => setModalCreate(false)}>Cancelar</Button>
            <Button size="sm" variant="primary" onClick={() => create()}>Salvar</Button>
          </div>
        </form>
      </div>
    </Modal> 
  );
}