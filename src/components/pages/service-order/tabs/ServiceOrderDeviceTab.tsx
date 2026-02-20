"use client";

import ComponentCard from "@/components/common/ComponentCard";
import AutocompletePlus from "@/components/form/AutocompletePlus";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { customerAtom, customerModalCreateAtom } from "@/jotai/masterData/customer.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

type TProp = {
  register: any;
  watch: any;
  setValue: any;
  onSave: () => void;
  onWarrantyCheck: (customerId: string, serialImei: string) => void;
  isEdit: boolean;
  isClosed: boolean;
};

export default function ServiceOrderDeviceTab({ register, watch, setValue, onSave, onWarrantyCheck, isEdit, isClosed }: TProp) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [__, setCustomerModalCreate] = useAtom(customerModalCreateAtom);
  const [customer, setCustomer] = useAtom(customerAtom);

  const customerId = watch("customerId");
  const brandId = watch("device.brandId");

  const searchCustomers = async (q: string) => {
    if (!q || q.length < 2) return;
    try {
      setLoadingCustomers(true);
      const { data } = await api.get(`/customers?deleted=false&search=${encodeURIComponent(q)}&pageSize=10&pageNumber=1`, configApi());
      setCustomers(data.result.data || []);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const { data } = await api.get("/brands?deleted=false&pageSize=100&pageNumber=1", configApi());
      setBrands(data.result.data || []);
    } catch { /* skip */ }
  };

  const fetchModels = async (brandId: string) => {
    if (!brandId) return;
    try {
      const { data } = await api.get(`/groups?deleted=false&pageSize=100&pageNumber=1&brandId=${brandId}`, configApi());
      setModels(data.result.data || []);
    } catch { /* skip */ }
  };

  const getAutocompleCustomer = async (value: string) => {
    try {
      if(!value) return setCustomers([]);
      const {data} = await api.get(`/customers?deleted=false&orderBy=tradeName&sort=desc&pageSize=10&pageNumber=1&regex$or$tradeName=${value}&regex$or$corporateName=${value}&regex$or$document=${value}`, configApi());
      const result = data.result;
      setCustomers(result.data);
    } catch (error) {
      resolveResponse(error);
    }
  };

  useEffect(() => { fetchBrands(); }, []);
  useEffect(() => { if (brandId) fetchModels(brandId); }, [brandId]);

  const handleSerialBlur = () => {
    const serialImei = watch("device.serialImei");
    if (serialImei || customerId) {
      onWarrantyCheck(customerId, serialImei);
    }
  };

  const selectCustomer = (customer: any) => {
    setValue("customerId", customer.id);
    setCustomerSearch(customer.corporateName);
    setCustomers([]);
  };

  const selectBrand = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brand = brands.find((b) => b.id === e.target.value);
    setValue("device.brandId", e.target.value);
    setValue("device.brandName", brand?.name || "");
  };

  const selectModel = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = models.find((m) => m.id === e.target.value);
    setValue("device.modelId", e.target.value);
    setValue("device.modelName", model?.name || "");
  };

  useEffect(() => {
    if (customer) {
      setValue("customerId", customer.id);
      setValue("customerName", customer.corporateName);
    };
  }, [customer]);

  return (
    <ComponentCard title="Dados do Equipamento" hasHeader={false}>
      <div className="grid grid-cols-12 gap-3 container-form">

        <div className="col-span-12 xl:col-span-6 relative">
          <Label title="Cliente" />
          <AutocompletePlus disabled={isClosed} onAddClick={() => {
              setCustomerModalCreate(true);
            }} placeholder="Buscar cliente..." defaultValue={watch("customerName")} objKey="id" objValue="tradeName" onSearch={(value: string) => getAutocompleCustomer(value)} onSelect={(opt) => {
            setValue("customerId", opt.id);
          }} options={customers}/>
          {customers.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 shadow-lg max-h-48 overflow-y-auto">
              {customers.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => selectCustomer(c)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex flex-col"
                >
                  <span className="font-medium">{c.corporateName}</span>
                  {c.phone && <span className="text-xs text-gray-400">{c.phone}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-12 xl:col-span-3">
          <Label title="Tipo de Equipamento" />
          <select {...register("device.type")} disabled={isClosed} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 text-gray-800">
            <option value="">Selecione</option>
            <option value="celular">Celular</option>
            <option value="computador">Computador</option>
            <option value="notebook">Notebook</option>
            <option value="tablet">Tablet</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        <div className="col-span-12 xl:col-span-3">
          <Label title="Marca" />
          <select value={watch("device.brandId")} onChange={selectBrand} disabled={isClosed} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 text-gray-800">
            <option value="">Selecione</option>
            {brands.map((b: any) => <option key={b.id} value={b.id} className="dark:bg-gray-900">{b.name}</option>)}
          </select>
        </div>

        <div className="col-span-12 xl:col-span-3">
          <Label title="Nº de Série / IMEI" />
          <input
            {...register("device.serialImei")}
            onBlur={handleSerialBlur}
            placeholder="Número de série ou IMEI"
            disabled={isClosed}
            type="text"
            className="input-erp-primary input-erp-default"
          />
        </div>

        <div className="col-span-12 xl:col-span-3">
          <Label title="Senha de Desbloqueio" required={false} />
          <input {...register("device.unlockPassword")} placeholder="Senha de desbloqueio (opcional)" disabled={isClosed} type="text" className="input-erp-primary input-erp-default" />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <Label title="Acessórios Entregues" required={false} />
          <input {...register("device.accessories")} placeholder="Ex: carregador, capa, cabo..." disabled={isClosed} type="text" className="input-erp-primary input-erp-default" />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <Label title="Estado Físico" required={false} />
          <input {...register("device.physicalCondition")} placeholder="Ex: arranhado, tela trincada..." disabled={isClosed} type="text" className="input-erp-primary input-erp-default" />
        </div>

        <div className="col-span-12">
          <Label title="Defeito Informado pelo Cliente" required={false}/>
          <TextArea disabled={isClosed} rows={5} value={watch("device.customerReportedIssue")} onChange={(v) => setValue("device.customerReportedIssue", v)} placeholder="Descreva o defeito informado pelo cliente..."/>
        </div>

        <div className="col-span-12">
          <Label title="Observações Internas" required={false} />
          <TextArea disabled={isClosed} rows={5} value={watch("notes")} onChange={(v) => setValue("notes", v)} placeholder="Anotações internas sobre esta OS..."/>
        </div>
      </div>

      {!isClosed && (
        <div className="mt-4">
          <Button onClick={onSave} type="submit" className="w-full xl:max-w-24" size="sm">
            {isEdit ? "Salvar" : "Criar OS"}
          </Button>
        </div>
      )}
    </ComponentCard>
  );
}
