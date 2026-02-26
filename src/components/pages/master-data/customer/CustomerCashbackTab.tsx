"use client";

import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { formattedMoney, maskCNPJ, maskCPF, maskMoney, maskPhone } from "@/utils/mask.util";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { TStore } from "@/types/master-data/store/store.type";
import { ResetCustomer, TCustomer } from "@/types/master-data/customer/customer.type";
import ScreenChangelog from "@/components/timeline/Timeline";
import { NotData } from "@/components/not-data/NotData";
import { CustomerCashbackButtonCreate } from "./button/CustomerCashbackButtonCreate";
import CustomerCashbackModalCreate from "./modals/CustomerCashbackModalCreate";
import { customerCashbackModalCreateAtom } from "@/jotai/masterData/customerCashback.jotai";
import { customerAtom, customerIdModalAtom } from "@/jotai/masterData/customer.jotai";

type TProp = {
  id?: string;
};

export default function CustomerCashbackTab({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [cashbacks, setCashbacks] = useState([]);
  const [modalCreate, setModalCreate] = useAtom(customerCashbackModalCreateAtom);
  const [customer, setCustomer] = useAtom(customerAtom);
  const router = useRouter();

  const { register, reset, watch, getValues, formState: { errors }} = useForm<TCustomer>({
    defaultValues: ResetCustomer
  });

  const save = async (body: TCustomer) => {
    if(!body.id) {
      await create(body);
    } else {
      await update(body);
    };
  } 
    
  const create: SubmitHandler<TCustomer> = async (body: TCustomer) => {
    try {
      setIsLoading(true);
      const {data} = await api.post(`/customers`, body, configApi());
      const result = data.result;
      resolveResponse({status: 201, message: result.message});
      router.push(`/master-data/customers/${result.data.id}`)
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const update: SubmitHandler<TCustomer> = async (body: TCustomer) => {
    try {
      setIsLoading(true);
      const {data} = await api.put(`/customers`, body, configApi());
      const result = data.result;
      resolveResponse({status: 200, message: result.message});
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getById = async (id: string) => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/customers/${id}`, configApi());
      const result = data.result.data;
      reset(result);
      
      if(result["cashbacks"]) {
        setCustomer(result);
        const list = result.cashbacks.map((x: any, index: number) => ({
          id: index.toString(),
          title: x.originDescription,
          date: normalizeDate(x.date.split("T")[0]),
          subtitle: `Valor: ${formattedMoney(x.value)} - Saldo disponível: ${formattedMoney(x.currentValue)}`,
          description: x.description,
          tags: [],
          author: { image: "", name: x.responsible },
          accentColor: "",
        }));
        setCashbacks(list.reverse());
      } else {
        setCustomer({...result, cashbacks: []});
      }
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeDate = (dateStr: string) => {
    const meses = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];
    const date = dateStr.split("-");

    return {
      day: String(parseInt(date[2])).padStart(2, '0'),
      month: meses[parseInt(date[1]) - 1],
      year: date[0]
    };
  };
  
  useEffect(() => {
    if(id != "create") {
      getById(id!);
    };
  }, [modalCreate]);

  return (
    <>
      <ComponentCard title="Dados Gerais" hasHeader={false}>
        <CustomerCashbackModalCreate />
        <div className="flex justify-end">
          <CustomerCashbackButtonCreate />
        </div>
        <div className="max-h-[calc(100dvh-25rem)] overflow-y-auto">
          {
            cashbacks.length == 0 ?
            (
              <NotData />
            ) : (
              <ScreenChangelog cards={cashbacks} title="Histórico de Cashback"/>
            )
          }
        </div>  
      </ComponentCard>
    </>
  );
}