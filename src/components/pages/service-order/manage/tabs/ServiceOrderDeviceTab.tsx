"use client";

import ComponentCard from "@/components/common/ComponentCard";
import Autocomplete from "@/components/form/Autocomplete";
import AutocompletePlus from "@/components/form/AutocompletePlus";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import { SelectPlus } from "@/components/form/SelectPlus";
import Button from "@/components/ui/button/Button";
import { customerAtom, customerIdModalAtom, customerModalCreateAtom } from "@/jotai/masterData/customer.jotai";
import { genericTableModalCreateAtom } from "@/jotai/masterData/genericTable.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { TGenericTable } from "@/types/master-data/generic-table/generic-table.type";
import { useAtom } from "jotai";
import { use, useEffect, useState } from "react";

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
  const [brands, setBrands] = useState<any[]>([]);
  const [_, setCustomerModalCreate] = useAtom(customerModalCreateAtom);
  const [___, setCustomerIdModal] = useAtom(customerIdModalAtom);
  const [customer, setCustomer] = useAtom(customerAtom);
  const [typeDevice, setTypeDevice] = useState<TGenericTable[]>([]);
  const [physicalCondition, setPhysicalCondition] = useState<TGenericTable[]>([]);
  const [typeModal] = useAtom(genericTableModalCreateAtom);

  const customerId = watch("customerId");

  const fetchBrands = async () => {
    try {
      const { data } = await api.get("/brands?deleted=false&pageSize=100&pageNumber=1", configApi());
      setBrands(data.result.data || []);
    } catch (error) {
      resolveResponse(error);
    }
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

  const fetchType = async () => {
    try {
      const { data } = await api.get(`/generic-tables/table/tipo-equipamentos-ordem-servico`, configApi());
      setTypeDevice(data?.result?.data || []);
    } catch (error) {
      resolveResponse(error);
    } finally {}
  };

  const fetchPhysicalCondition = async () => {
    try {
      const { data } = await api.get(`/generic-tables/table/estado-fisico-ordem-servico`, configApi());
      setPhysicalCondition(data?.result?.data || []);
    } catch (error) {
      resolveResponse(error);
    } finally {}
  };

  useEffect(() => { 
    fetchBrands(); 
    fetchType();
    fetchPhysicalCondition(); 
  }, []);

  const handleSerialBlur = () => {
    const serialImei = watch("device.serialImei");
    if (serialImei || customerId) {
      onWarrantyCheck(customerId, serialImei);
    }
  };

  const selectBrand = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brand = brands.find((b) => b.id === e.target.value);
    setValue("device.brandId", e.target.value);
    setValue("device.brandName", brand?.name || "");
  };

  useEffect(() => {
    fetchType();
    fetchPhysicalCondition();
  }, [typeModal]);

  useEffect(() => {
    if (customer.corporateName) {
      setValue("customerId", customer.id);
      setValue("customerName", customer.tradeName);
    };
  }, [customer]);

  return (
    <ComponentCard title="Dados do Equipamento" hasHeader={false}>
      <div className="grid grid-cols-12 gap-3 container-form">

        <div className="col-span-12 xl:col-span-6 relative">
          <Label title="Cliente" />
          {
            isClosed ?
            (
              <Autocomplete disabled={isClosed} 
                placeholder="Buscar cliente..." defaultValue={watch("customerName")} objKey="id" objValue="tradeName" onSearch={(value: string) => getAutocompleCustomer(value)} onSelect={(opt) => {
                setValue("customerId", opt.id);
                setCustomers([]);
              }} options={customers}/>
            ) : 
            (
              <AutocompletePlus disabled={isClosed} onEditClick={() => {
                setCustomerModalCreate(true);
                setCustomerIdModal(watch("customerId"));
                setCustomer((e: any) => ({...e, id: watch("customerId")}));
              }} onAddClick={() => {setCustomerModalCreate(true)}} 
                placeholder="Buscar cliente..." defaultValue={watch("customerName")} objKey="id" objValue="tradeName" onSearch={(value: string) => getAutocompleCustomer(value)} onSelect={(opt) => {
                setValue("customerId", opt.id);
                setCustomers([]);
              }} options={customers}/>
            )
          }
        </div>

        <div className="col-span-12 xl:col-span-3">
          <Label title="Tipo de Equipamento" />
          <SelectPlus genericTable="tipo-equipamentos-ordem-servico" code="code" label="description" disabled={isClosed} options={typeDevice} {...register("device.type")}/>
        </div>

        <div className="col-span-12 xl:col-span-3">
          <Label title="Marca" required={false}/>
          <select value={watch("device.brandId")} onChange={selectBrand} disabled={isClosed} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 text-gray-800">
            <option value="">Selecione</option>
            {brands.map((b: any) => <option key={b.id} value={b.id} className="dark:bg-gray-900">{b.name}</option>)}
          </select>
        </div>

        <div className="col-span-12 xl:col-span-3">
          <Label title="Modelo" required={false}/>
          <input {...register("device.modelName")} placeholder="Modelo (opcional)" disabled={isClosed} type="text" className="input-erp-primary input-erp-default" />
        </div>

        <div className="col-span-12 xl:col-span-3">
          <Label title="Nº de Série / IMEI"/>
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
          <Label title="Senha de Desbloqueio"/>
          <input {...register("device.unlockPassword")} placeholder="Senha de desbloqueio (opcional)" disabled={isClosed} type="text" className="input-erp-primary input-erp-default" />
        </div>
        
        <div className="col-span-12 xl:col-span-3">
          <Label title="Prioridade" />
          <select {...register("priority")} disabled={isClosed} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 text-gray-800">
            <option value="baixa">Baixa</option>
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
            <option value="crítica">Crítica</option>
          </select>
        </div>

        <div className="col-span-12 xl:col-span-6">
          <Label title="Acessórios Entregues" required={false} />
          <input {...register("device.accessories")} placeholder="Ex: carregador, capa, cabo..." disabled={isClosed} type="text" className="input-erp-primary input-erp-default" />
        </div>

        {/* <div className="col-span-12 xl:col-span-6">
          <select {...register("device.physicalCondition")} disabled={isClosed} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 text-gray-800">
            <option value="000001">Novo</option>
            <option value="000002">Tela com Riscos</option>
            <option value="000003">Carcaça Amassada</option>
            <option value="000004">Outros</option>
          </select>
        </div> */}

        <div className="col-span-12 xl:col-span-3">
          <Label title="Estado Físico" required={false} />
          <SelectPlus genericTable="estado-fisico-ordem-servico" code="code" label="description" disabled={isClosed} options={physicalCondition} {...register("device.physicalCondition")}/>
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
