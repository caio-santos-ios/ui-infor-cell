"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { Modal } from "@/components/ui/modal";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { ResetBoxSettings, TBoxSettings } from "@/types/commercial/box/box.type";
import { MdAccountBalanceWallet, MdArrowForward, MdRepeat, MdTrendingDown, MdTrendingUp } from "react-icons/md";
import { boxIdAtom, boxSettingModalAtom } from "@/jotai/commercial/box/box.jotai";
import { NumericFormat } from "react-number-format";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { salesOrderModalAtom } from "@/jotai/commercial/sales-order/salesOrder.jotai";

const list = [
  {
    title: "Sangria",
    subTitle: "Informe o valor que deseja retirar",
    name: "Sangrar Caixa",
    uri: "sangria",
    description: "A sangria caracteriza-se pela retirada de valor do caixa, ou seja, você retira um determinado valor da gaveta do operador para guardar em outro local mais seguro.",
    color: "bg-[#ef6a5a]",
    hover: "hover:bg-[#d95d4e]",
    icon: <MdTrendingUp className="opacity-20 absolute right-4 top-4 text-8xl rotate-45" />
  },
  {
    title: "Reforço",
    subTitle: "Informe o valor que deseja adicionar",
    name: "Reforçar Caixa",
    uri: "reinforce",
    description: "O reforço consiste em incluir valor no seu caixa, sempre que necessário. Esta transação ocorre normalmente quando é adicionado troco na gaveta do operador.",
    color: "bg-[#00a65a]",
    hover: "hover:bg-[#008d4c]",
    icon: <MdTrendingDown className="opacity-20 absolute right-4 top-4 text-8xl -rotate-45" />
  },
  {
    title: "Troca/Devolução",
    subTitle: "",
    name: "",
    uri: "sangria",
    description: "A troca ou devolução ocorre quando o cliente desistir de uma compra ou o produto apresenta algum defeito. O produto é trocado ou volta para o estoque.",
    color: "bg-[#f39c12]",
    hover: "hover:bg-[#db8b0b]",
    icon: <MdRepeat className="opacity-20 absolute right-4 top-4 text-8xl" />
  },
  {
    title: "Fechamento",
    subTitle: "Deseja realmente fechar este caixa?",
    name: "Fechar caixa",
    uri: "closing",
    description: "O fechamento de caixa envolve um trabalho cuidadoso de conferência e checagem dos valores que estão no caixa com o saldo dos registros de entradas e saídas.",
    color: "bg-[#00c0ef]",
    hover: "hover:bg-[#00add8]",
    icon: <MdAccountBalanceWallet className="opacity-20 absolute right-4 top-4 text-8xl" />
  }
];

export default function BoxModalSettings() {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [modalSettings, setModalSettings] = useAtom(boxSettingModalAtom);
  const [__, setModalCreate] = useAtom(salesOrderModalAtom);
  const [title, setTitle] = useState("Operações do PDV");
  const [subTitle, setSubTitle] = useState("");
  const [uri, setUri] = useState("");
  const [operations] = useState(list);
  const [boxId] = useAtom(boxIdAtom);

  const { getValues, register, control, reset, setValue } = useForm<TBoxSettings>({
    defaultValues: ResetBoxSettings
  });
  

  const update = async () => {
    try {
      setIsLoading(true);
      const {data} = await api.put(`/boxes/${uri}`, {...getValues(), id: boxId}, configApi());
      const result = data.result;
      resolveResponse({status: 200, message: result.message});
      console.log(result)
      reset(ResetBoxSettings);
      if(uri == "closing") {
        setModalSettings(false);
        setModalCreate(false);
      };
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const close = () => {
    setModalSettings(false);
  };

  useEffect(() => {
    const initial = async () => {
      setTitle("Operações do PDV");
    };
    initial();
  }, [modalSettings]);

  return (
    <Modal isOpen={modalSettings} onClose={close} className={`m-4 w-[90dvw] max-w-240`}>
      <div className={`no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11`}>
        <div className="px-2 pr-14 mb-4">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">{title}</h4>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4">
          {title == "Operações do PDV" && operations.map((op, index) => (
            <div onClick={() => {
              setTitle(op.name);
              setSubTitle(op.subTitle);
              setUri(op.uri);
              console.log(op)
            }} key={index} className={`${op.color} ${op.hover} text-white rounded shadow-md flex flex-col justify-between overflow-hidden relative transition-all cursor-pointer group`}>
              {op.icon}

              <div className="p-5 z-10">
                <h2 className="text-3xl font-bold mb-3 tracking-tight">{op.title}</h2>
                <p className="text-sm leading-relaxed opacity-95 h-20 overflow-hidden">
                  {op.description}
                </p>
              </div>

              <div className="bg-black/10 py-2 px-5 flex justify-center items-center gap-2 group-hover:bg-black/20 transition-colors z-10">
                <span className="text-sm font-light">Clique aqui</span>
                <MdArrowForward />
              </div>
            </div>
          ))}

          {
            title != "Operações do PDV" &&
            <>
              <h1 className="col-span-2 mb-1.5 block text-xl text-center font-medium text-gray-700 dark:text-gray-400">{subTitle}</h1>
              {
                uri != "closing" &&
                <div className="col-span-2">
                  <Label title="Valor" />
                  <Controller
                    name="valueSettings"
                    control={control}
                    defaultValue={0}
                    render={({ field: { onChange, value } }) => (
                      <NumericFormat
                        className="input-erp-primary input-erp-default" 
                        value={value}
                        onValueChange={(values) => {
                          const val = values.floatValue ?? 0;
                          onChange(val);
                        }}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="R$ "
                        decimalScale={2}
                        fixedDecimalScale
                        allowNegative={false}
                        placeholder="Valor"
                      />
                    )}
                  />
                </div> 
              }
              <Button className="w-full" size="sm" variant="outline" onClick={close}>Cancelar</Button>
              <Button className="w-full" size="sm" variant="primary" onClick={() => update()}>Confirmar</Button>
            </>
          }
        </div>
      </div>
    </Modal> 
  );
}