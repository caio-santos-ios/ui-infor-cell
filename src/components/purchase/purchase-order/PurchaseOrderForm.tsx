"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ResetEmployee, TEmployee } from "@/types/master-data/employee/employee.type";
import ProductDataForm from "./PurchaseOrderDataForm";
import PurchaseOrderDataForm from "./PurchaseOrderDataForm";
import PurchaseOrderIemsForm from "./PurchaseOrderItemsForm";
import { TPurchaseOrder } from "@/types/purchase/purchase-order/purchase-order.type";
import { PurchaseOrderModalApprove } from "./PurchaseOrderModalApprove";
import { purchaseOrderIdAtom, purchaseOrderModalAtom } from "@/jotai/purchaseOrder/purchaseOrder.jotai";

type TProp = {
  id?: string;
};

export default function PurchaseOrderForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [modalApproval] = useAtom(purchaseOrderModalAtom);
  const [__, setApprovalId] = useAtom(purchaseOrderIdAtom);
  const [tabs] = useState<{key: string; title: string;}[]>([
    // {key: 'data', title: 'Dados Gerais'},
    {key: 'items', title: 'Itens'},
  ]);
  const [currentTab, setCurrentTab] = useState<any>({key: 'items', title: 'Itens'});

  const { reset } = useForm<TPurchaseOrder>({
    defaultValues: ResetEmployee
  });

  useEffect(() => {
    if(id && id != "create") {
      setApprovalId(id)
    };
  }, []);

  return (
    <>    
      <div className="flex items-center font-medium gap-2 rounded-lg transition  px-2 py-2 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 w-full mb-3">
        {
          tabs.map((x: any) => {
            return <button onClick={() => setCurrentTab(x)} className={`${currentTab.key == x.key ? 'bg-brand-500 text-white' : ''} px-3 py-1 rounded-md`} key={x.key}>{x.title}</button>
          })
        }
      </div>

      <div className="mb-2">
        {
          modalApproval &&
          <PurchaseOrderModalApprove />
        }
        {/* {currentTab.key == "data" && <PurchaseOrderDataForm id={id} />} */}
        {currentTab.key == "items" && <PurchaseOrderIemsForm id={id} />}
      </div>     
    </>
  );
}