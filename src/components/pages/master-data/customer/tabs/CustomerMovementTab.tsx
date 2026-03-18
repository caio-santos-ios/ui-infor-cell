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
import { customerCashbackModalCreateAtom } from "@/jotai/masterData/customerCashback.jotai";
import { customerAtom, customerIdModalAtom } from "@/jotai/masterData/customer.jotai";
import { statusLabel } from "@/types/financial/accounts-receivable/accounts-receivable.type";

type TProp = {
  id?: string;
};

export default function CustomerMovementTab({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [movements, setMovements] = useState<any[]>([]);
  const [modalCreate, setModalCreate] = useAtom(customerCashbackModalCreateAtom);
  const [customer, setCustomer] = useAtom(customerAtom);
  const router = useRouter();

  const { register, reset, watch, getValues, formState: { errors }} = useForm<TCustomer>({
    defaultValues: ResetCustomer
  });

  const getById = async (id: string) => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/customers/movement?id=${id}`, configApi());
      const result = data?.result?.data || [];

      if(result.length > 0) {
        const customer = result[0];
        const situatuions = customer.situations;
        
        const list1: any[] = customer.salesOrder.map((x: any) => ({
          id: x.id,
          title: `Pedido de Venda - ${x.code}`,
          date: normalizeDate(x.createdAt.split("T")[0]),
          subtitle: `Valor: ${formattedMoney(x.total)} - Quantidade de itens: ${x.quantity}`,
          description: `Status: ${x.status}`,
          tags: [],
          author: { image: "", name: "" },
          accentColor: "",
        }));
        
        const list2: any[] = customer.accountsReceivable.map((x: any) => ({
          id: x.id,
          title: `Contas a Receber - ${x.code}`,
          date: normalizeDate(x.createdAt.split("T")[0]),
          subtitle: `Valor a receber: ${formattedMoney(x.amount)} - Valor recebido: ${formattedMoney(x.amountPaid)}`,
          description: `Status: ${statusLabel[x.status].label}`,
          tags: [],
          author: { image: "", name: "" },
          accentColor: "",
        }));
        
        const list3: any[] = customer.serviceOrders.map((x: any) => ({
          id: x.id,
          title: `Ordem de Serviço - ${x.code}`,
          date: normalizeDate(x.createdAt.split("T")[0]),
          subtitle: `Valor: ${formattedMoney(x.totalAmount)} - Equipamento: ${x.device.type}`,
          description: `Status: ${situatuions.find((s: any) => s._id == x.situationId)?.name || "Sem status"}`,
          tags: [],
          author: { image: "", name: "" },
          accentColor: "",
        }));

        setMovements([...list1, ...list2, ...list3]);
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
        <div className="max-h-[calc(100dvh-21rem)] overflow-y-auto">
          {
            movements.length == 0 ?
            (
              <NotData />
            ) : (
              <ScreenChangelog cards={movements} title="Histórico de Movimentação"/>
            )
          }
        </div>  
      </ComponentCard>
    </>
  );
}