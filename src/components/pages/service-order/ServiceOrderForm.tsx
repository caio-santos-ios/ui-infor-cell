"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ResetServiceOrder, TServiceOrder, STATUS_LABELS } from "@/types/order-service/order-service.type";
import ServiceOrderDeviceTab from "./tabs/ServiceOrderDeviceTab";
import ServiceOrderItemsTab from "./tabs/ServiceOrderItemsTab";
import ServiceOrderLaudoTab from "./tabs/ServiceOrderLaudoTab";
import ServiceOrderCloseModal from "./modals/ServiceOrderCloseModal";
import { useRouter } from "next/navigation";
import CustomerModalCreate from "@/components/master-data/customer/CustomerModalCreate";
import Link from "next/link";
import Button from "@/components/ui/button/Button";

type TProp = { id?: string };

const TABS = [
  { key: "device", title: "Equipamento" },
  { key: "items", title: "Peças e Serviços" },
  { key: "laudo", title: "Laudo" },
];

export default function ServiceOrderForm({ id }: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [currentTab, setCurrentTab] = useState("device");
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [warrantyInfo, setWarrantyInfo] = useState<any>(null);
  const router = useRouter();

  const { reset, watch, getValues, setValue, register } = useForm<TServiceOrder>({
    defaultValues: ResetServiceOrder,
  });

  const isEdit = id && id !== "create";
  const isWarranty = watch("isWarrantyInternal");
  const status = watch("status");
  const isClosed = status === "closed" || status === "cancelled";

  const getById = async (id: string) => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/serviceOrders/${id}`, configApi());
      const result = data.result.data;
      reset(result);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkWarranty = async (customerId: string, serialImei: string) => {
    try {
      if (!customerId && !serialImei) return;
      const params = new URLSearchParams();
      if (serialImei) params.set("serialImei", serialImei);
      else if (customerId) params.set("customerId", customerId);
      const { data } = await api.get(`/serviceOrders/warranty-check?${params.toString()}`, configApi());
      if (data.result?.data) {
        setWarrantyInfo(data.result.data);
        setValue("isWarrantyInternal", true);
      }
    } catch {
      // no warranty found
    }
  };

  const saveEquipment = async () => {
    const body = getValues();
    try {
      setIsLoading(true);
      if (!isEdit) {
        const userId = localStorage.getItem("userId") || "";
        const payload = {
          customerId: body.customerId,
          openedByUserId: userId,
          deviceType: body.device?.type,
          brandId: body.device?.brandId,
          brandName: body.device?.brandName,
          modelId: body.device?.modelId,
          modelName: body.device?.modelName,
          color: body.device?.color,
          serialImei: body.device?.serialImei,
          customerReportedIssue: body.device?.customerReportedIssue,
          unlockPassword: body.device?.unlockPassword,
          accessories: body.device?.accessories,
          physicalCondition: body.device?.physicalCondition,
          notes: body.notes,
          createdBy: userId,
        };
        const { data } = await api.post("/serviceOrders", payload, configApi());
        const result = data.result;
        resolveResponse({ status: 201, message: result.message });
        router.push(`/order-services/manages/${result.data.id}`);
      } else {
        const userId = localStorage.getItem("userId") || "";
        const payload = {
          id: body.id,
          customerId: body.customerId,
          status: body.status,
          deviceType: body.device?.type,
          brandId: body.device?.brandId,
          brandName: body.device?.brandName,
          modelId: body.device?.modelId,
          modelName: body.device?.modelName,
          color: body.device?.color,
          serialImei: body.device?.serialImei,
          customerReportedIssue: body.device?.customerReportedIssue,
          unlockPassword: body.device?.unlockPassword,
          accessories: body.device?.accessories,
          physicalCondition: body.device?.physicalCondition,
          notes: body.notes,
          technicalReport: body.laudo?.technicalReport,
          testsPerformed: body.laudo?.testsPerformed,
          repairStatus: body.laudo?.repairStatus,
          discountValue: body.discountValue,
          discountType: body.discountType,
          updatedBy: userId,
        };
        const { data } = await api.put("/serviceOrders", payload, configApi());
        const result = data.result;
        resolveResponse({ status: 200, message: result.message });
      }
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!isEdit) return;
    setValue("status", newStatus);
    await saveEquipment();
  };

  useEffect(() => {
    if (isEdit) getById(id!);
  }, []);

  const statusInfo = STATUS_LABELS[status] ?? STATUS_LABELS["open"];

  return (
    <>
      {
        !isEdit && (
          <div className="flex justify-end mb-3">
            <Link href="/order-services/manages">
              <Button type="submit" variant="outline" size="sm">Voltar</Button>
            </Link>
          </div>
        )
      }
      {isEdit && (
        <div className="flex flex-wrap items-center gap-3 mb-4 p-4 rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
          <div className="flex items-center gap-3 flex-1">
            <span className="font-semibold text-gray-800 dark:text-white/90">
              OS #{watch("code")}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            {isWarranty && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                ⚠ GARANTIA INTERNA — financeiro bloqueado
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isClosed && (
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 text-gray-800"
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k} className="dark:bg-gray-900">{v.label}</option>
                ))}
              </select>
            )}
            {!isClosed && (
              <Button onClick={() => setShowCloseModal(true)} type="submit" variant="primary" size="sm">Fechar OS</Button>
            )}
            <Link href="/order-services/manages">
              <Button type="submit" variant="outline" size="sm">Voltar</Button>
            </Link>
          </div>
        </div>
      )}

      {warrantyInfo && (
        <div className="mb-4 p-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/20 text-sm text-amber-800 dark:text-amber-300">
          ⚠ <strong>OS em Garantia!</strong> Encontrada OS anterior dentro do período de garantia (até {warrantyInfo.warrantyUntil ? new Date(warrantyInfo.warrantyUntil).toLocaleDateString("pt-BR") : "—"}). Financeiro bloqueado automaticamente.
        </div>
      )}

      <div className="flex items-center font-medium gap-2 rounded-lg transition px-2 py-2 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 w-full mb-3">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCurrentTab(tab.key)}
            className={`${currentTab === tab.key ? "bg-brand-500 text-white" : ""} px-3 py-1 rounded-md transition-colors`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      <div className="mb-2">
        {currentTab === "device" && (
          <ServiceOrderDeviceTab
            register={register}
            watch={watch}
            setValue={setValue}
            onSave={saveEquipment}
            onWarrantyCheck={checkWarranty}
            isEdit={!!isEdit}
            isClosed={isClosed}
          />
        )}
        {currentTab === "items" && isEdit && (
          <ServiceOrderItemsTab
            serviceOrderId={id!}
            isWarranty={isWarranty}
            isClosed={isClosed}
          />
        )}
        {currentTab === "items" && !isEdit && (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
            Salve o equipamento primeiro para adicionar peças e serviços.
          </div>
        )}
        {currentTab === "laudo" && isEdit && (
          <ServiceOrderLaudoTab
            register={register}
            watch={watch}
            onSave={saveEquipment}
            isClosed={isClosed}
          />
        )}
        {currentTab === "laudo" && !isEdit && (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
            Salve o equipamento primeiro para preencher o laudo.
          </div>
        )}
      </div>

      {showCloseModal && isEdit && (
        <ServiceOrderCloseModal
          serviceOrderId={id!}
          isWarranty={isWarranty}
          onClose={() => setShowCloseModal(false)}
          onSuccess={() => { setShowCloseModal(false); getById(id!); }}
        />
      )}

      <CustomerModalCreate />
    </>
  );
}
