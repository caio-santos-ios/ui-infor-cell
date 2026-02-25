"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useForm } from "react-hook-form";
import Label from "@/components/form/Label";
import { useEffect } from "react";
import { ResetPaymentMethod } from "@/types/payment-method/payment-method.type";
import { situationIdAtom, situationModalAtom } from "@/jotai/serviceOrder/situation.jotai";
import { ResetSituation, TSituation } from "@/types/order-service/situation.type";
import Checkbox from "@/components/form/input/Checkbox";

const COLORS: { name: string; bg: string; text: string; border: string; }[] = [
  { name: "Vermelho",       border: "border border-red-700 dark:border-red-400",             text: "text-red-700 dark:text-red-400",               bg: "bg-red-100 dark:bg-red-900/30 bg-red-500" },
  { name: "Laranja",        border: "border border-orange-700 dark:border-orange-400",             text: "text-orange-700 dark:text-orange-400",         bg: "bg-orange-100 dark:bg-orange-900/30 bg-orange-500" },
  // { name: "Âmbar",          border: "border border-amber-700 dark:border-amber-400",             text: "text-amber-700 dark:text-amber-400",           bg: "bg-amber-100 dark:bg-amber-900/30 bg-amber-500" },
  { name: "Amarelo",        border: "border border-yellow-700 dark:border-yellow-400",             text: "text-yellow-700 dark:text-yellow-400",         bg: "bg-yellow-100 dark:bg-yellow-900/30 bg-yellow-400" },
  { name: "Lima",           border: "border border-lime-700 dark:border-lime-400",             text: "text-lime-700 dark:text-lime-400",             bg: "bg-lime-100 dark:bg-lime-900/30 bg-lime-500" },
  { name: "Verde",          border: "border border-green-700 dark:border-green-400",             text: "text-green-700 dark:text-green-400",           bg: "bg-green-100 dark:bg-green-900/30 bg-green-500" },
  // { name: "Esmeralda",      border: "border border-emerald-700 dark:border-emerald-400",             text: "text-emerald-700 dark:text-emerald-400",       bg: "bg-emerald-100 dark:bg-emerald-900/30 bg-emerald-500" },
  { name: "Teal",           border: "border border-teal-700 dark:border-teal-400",             text: "text-teal-700 dark:text-teal-400",             bg: "bg-teal-100 dark:bg-teal-900/30 bg-teal-500" },
  { name: "Ciano",          border: "border border-cyan-700 dark:border-cyan-400",             text: "text-cyan-700 dark:text-cyan-400",             bg: "bg-cyan-100 dark:bg-cyan-900/30 bg-cyan-500" },
  // { name: "Céu",            border: "border border-sky-700 dark:border-sky-400",             text: "text-sky-700 dark:text-sky-400",               bg: "bg-sky-100 dark:bg-sky-900/30 bg-sky-500" },
  { name: "Azul",           border: "border border-blue-700 dark:border-blue-400",             text: "text-blue-700 dark:text-blue-400",             bg: "dabg-blue-100 dark:bg-blue-900/30 rk:bg-blue-900/30" },
  { name: "Índigo",         border: "border border-indigo-700 dark:border-indigo-400",             text: "text-indigo-700 dark:text-indigo-400",         bg: "bg-indigo-100 dark:bg-indigo-900/30 bg-indigo-500" },
  { name: "Violeta",        border: "border border-violet-700 dark:border-violet-400",             text: "text-violet-700 dark:text-violet-400",         bg: "bg-violet-100 dark:bg-violet-900/30 bg-violet-500" },
  { name: "Roxo",           border: "border border-purple-700 dark:border-purple-400",             text: "text-purple-700 dark:text-purple-400",         bg: "bg-purple-100 dark:bg-purple-900/30 bg-purple-500" },
  { name: "Fúcsia",         border: "border border-fuchsia-700 dark:border-fuchsia-400",             text: "text-fuchsia-700 dark:text-fuchsia-400",       bg: "bg-fuchsia-100 dark:bg-fuchsia-900/30 bg-fuchsia-500" },
  { name: "Rosa",           border: "border border-pink-700 dark:border-pink-400",             text: "text-pink-700 dark:text-pink-400",             bg: "bg-pink-100 dark:bg-pink-900/30 bg-pink-500" },
  // { name: "Pêssego",        border: "border border-rose-700 dark:border-rose-400",             text: "text-rose-700 dark:text-rose-400",             bg: "bg-rose-100 dark:bg-rose-900/30 bg-rose-400" },
  { name: "Cinza",          border: "border border-gray-700 dark:border-gray-400",             text: "text-gray-700 dark:text-gray-400",             bg: "bg-gray-100 dark:bg-gray-900/30 bg-gray-500" },
  // { name: "Ardósia",        border: "border border-slate-700 dark:border-slate-400",             text: "text-slate-700 dark:text-slate-400",           bg: "bg-slate-100 dark:bg-slate-900/30 bg-slate-500" },
  // { name: "Zinco",          border: "border border-zinc-700 dark:border-zinc-400",             text: "text-zinc-700 dark:text-zinc-400",             bg: "bg-zinc-100 dark:bg-zinc-900/30 bg-zinc-500" },
  // { name: "Pedra",          border: "border border-stone-700 dark:border-stone-400",             text: "text-stone-700 dark:text-stone-400",           bg: "bg-stone-100 dark:bg-stone-900/30 bg-stone-500" },
  // { name: "Neutro",         border: "border border-neutral-700 dark:border-neutral-400",             text: "text-neutral-700 dark:text-neutral-400",       bg: "bg-neutral-100 dark:bg-neutral-900/30 bg-neutral-500" },
  // { name: "Preto",          border: "border border-gray-700 dark:border-gray-400",             text: "text-gray-700 dark:text-gray-400",             bg: "bg-gray-100 dark:bg-gray-900/30 bg-gray-900" },
];

export default function SituationModalCreate() {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [modalCreate, setModalCreate] = useAtom(situationModalAtom);
  const [situationId, setSituationId] = useAtom(situationIdAtom);

  const { getValues, setValue, register, reset, watch, control } = useForm<TSituation>({
    defaultValues: ResetSituation
  });

  const create = async () => {
    try {
      setIsLoading(true);
      const {data} = await api.post(`/situations`, {...getValues()}, configApi());
      const result = data.result;
      resolveResponse({status: 201, message: result.message});
      close();
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const update = async () => {
    try {
      setIsLoading(true);
      const {data} = await api.put(`/situations`, {...getValues()}, configApi());
      const result = data.result;
      resolveResponse({status: 200, message: result.message});
      close();
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getById = async (id: string) => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/situations/${id}`, configApi());
      const result = data.result.data;
      reset(result);
      const style = COLORS.find(x => x.bg == result.style.bg);
      if(style) {
        setValue("currentColor", style.bg)
      }
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const close = () => {
    setModalCreate(false);
    setSituationId("");
    reset(ResetPaymentMethod);
  };

  const normalizeColor = (value: string) => {
    return value.split("-")[1];
  }
  
  useEffect(() => {
    const intial = async () => {
      reset(ResetSituation);
      if(situationId) {
        await getById(situationId);
      };
    };
    intial();
  }, [modalCreate]);

  return (
    <Modal isOpen={modalCreate} onClose={close} className={`m-4 w-[80dvw] max-w-220 bg-red-400`}>
      <div className={`no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11`}>
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Situação O.S.</h4>
        </div>

        <form className="flex flex-col">
          <div className={`max-h-[70dvh] custom-scrollbar overflow-y-auto px-2 pb-3`}>
            <div className="grid grid-cols-12">

              <div className="col-span-12 lg:col-span-5 mb-4 mr-4">
                <Label title="Nome" />
                <input maxLength={50} placeholder="Nome" {...register("name")} type="text" className="input-erp-primary input-erp-default"/>
              </div>
              <div className="col-span-6 lg:col-span-3 mr-4">
                <Label title="Cor"/>
                <select {...register("currentColor")} onChange={(e: any) => {
                  const style = COLORS.find(x => x.bg == e.target.value);
                  if(style) {
                    setValue("style.bg", style.bg);
                    setValue("style.text", style.text);
                    setValue("style.border", style.border);
                  }
                }} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                  <option value="">Nenhuma</option>
                  {COLORS.map((x, index) => (
                    <option 
                      key={index} 
                      value={x.bg} 
                      className="dark:bg-gray-900"
                      style={{ color: normalizeColor(x.text) }}>
                      ● {x.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-12 lg:col-span-2">
                <Label title="Gera financeiro?" required={false}/>
                <Checkbox checked={watch("generateFinancial")} onChange={(e) => {setValue("generateFinancial", e)}} />
              </div>
              
              <div className="col-span-12 lg:col-span-2">
                <Label title="Filtro no Painel?" required={false}/>
                <Checkbox checked={watch("appearsOnPanel")} onChange={(e) => {setValue("appearsOnPanel", e)}} />
              </div>

              <div className="col-span-12 lg:col-span-2 mb-2">
                <Label title="Sequencia do Filtro" required={false}/>
                <select {...register("sequence")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 text-gray-800">
                  <option value={0}>Selecionar</option>
                  <option value={1}>1º filtro</option>
                  <option value={2}>2º filtro</option>
                  <option value={3}>3º filtro</option>
                  <option value={4}>4º filtro</option>
                </select>
              </div>

              <div className="col-span-12 mb-0">
                <Label title="Momentos em que a situação deve aparecer na Ordem de Serviço:" required={false}/>
              </div>
              <div className="col-span-12 lg:col-span-4">
                <Label title="Abertura?" required={false}/>
                <Checkbox checked={watch("start")} onChange={(e) => {setValue("start", e)}} />
              </div>
              <div className="col-span-12 lg:col-span-4">
                <Label title="Intermédio?" required={false}/>
                <Checkbox checked={watch("quite")} onChange={(e) => {setValue("quite", e)}} />
              </div>
              <div className="col-span-12 lg:col-span-4">
                <Label title="Encerramento?" required={false}/>
                <Checkbox checked={watch("end")} onChange={(e) => {setValue("end", e)}} />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={close}>Cancelar</Button>
            {
              situationId ? 
              <Button size="sm" variant="primary" onClick={() => update()}>Salvar</Button>
              :
              <Button size="sm" variant="primary" onClick={() => create()}>Adicionar</Button>
            }
          </div>
        </form>
      </div>
    </Modal> 
  );
}