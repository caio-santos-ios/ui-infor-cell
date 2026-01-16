"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { ResetPurchaseOrderItem, TPurchaseOrderItem } from "@/types/purchase/purchase-order/purchase-order.type";
import Label from "@/components/form/Label";
import { NumericFormat } from "react-number-format";
import { TProduct } from "@/types/product/product/product.type";
import { TSupplier } from "@/types/master-data/supplier/supplier.type";
import MultiSelect from "@/components/form/MuiltSelect";
import { MultSelectCustom } from "@/components/form/MultSelectCustom";
import { formattedMoney } from "@/utils/mask.util";
import { permissionDelete, permissionUpdate } from "@/utils/permission.util";
import { IconEdit } from "@/components/iconEdit/IconEdit";
import { IconDelete } from "@/components/iconDelete/IconDelete";
import { ModalDelete } from "@/components/modalDelete/ModalDelete";
import { useModal } from "@/hooks/useModal";

type TProp = {
  id?: string;
};

export default function PurchaseOrderIemsForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [products, setProduct] = useState<TProduct[]>([]);
  const [suppliers, setSupplier] = useState<TSupplier[]>([]);
  const [variations, setVariation] = useState<any[]>([]);
  const [selectedValues, setSelectedValues] = useState<any[]>([]);
  const [items, setItem] = useState<TPurchaseOrderItem[]>([]);
  const { isOpen, openModal, closeModal } = useModal();
  const router = useRouter();  

  const { control, getValues, reset, register, setValue, watch } = useForm<TPurchaseOrderItem>({
    defaultValues: ResetPurchaseOrderItem
  });

  const save = async (body: TPurchaseOrderItem) => {
    body.purchaseOrderId = id!;
    const newVariations: any[] = [];
    body.variations.forEach(x => {
      const op = variations.find(v => v.key == x);
      if(op) {
        newVariations.push(op.value);
      };
    });
    body.variations = newVariations;

    if(!body.id) {
      await create(body);
    } else {
      await update(body);
    };
  };
      
  const create: SubmitHandler<TPurchaseOrderItem> = async (body: TPurchaseOrderItem) => {
    try {
      setIsLoading(true);
      const {data} = await api.post(`/purchase-order-items`, body, configApi());
      const result = data.result;
      resolveResponse({status: 201, message: result.message});
      reset(ResetPurchaseOrderItem);
      setSelectedValues([]);
      setVariation([]);
      await getByPurchaseOrderId(id!);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };
    
  const update: SubmitHandler<TPurchaseOrderItem> = async (body: TPurchaseOrderItem) => {
    try {
      setIsLoading(true);
      const {data} = await api.put(`/purchase-order-items`, body, configApi());
      const result = data.result;
      resolveResponse({status: 200, message: result.message});
      reset(ResetPurchaseOrderItem);
      setSelectedValues([]);
      setVariation([]);
      await getByPurchaseOrderId(id!);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getByPurchaseOrderId = async (id: string) => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/purchase-order-items?deleted=false&purchaseOrderId=${id}&orderBy=createdAt&sort=desc&pageSize=100&pageNumber=1`, configApi());
      const result = data.result.data;
      setItem(result);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getById = async (id: string) => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/purchase-order-items/${id}`, configApi());
      const result = data.result.data;
      reset(result);
      const list: any = result?.variations.map((v: any) => ({sequence: v.sequence, text: `${v.key}: ${v.value}`, value: v, selected: true, key: v.sequence}));
      setSelectedValues(list);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const destroy = async () => {
    try {
      setIsLoading(true);
      await api.delete(`/purchase-order-items/${watch("id")}`, configApi());
      resolveResponse({status: 204, message: "Excluído com sucesso"});
      closeModal();
      await getByPurchaseOrderId(id!);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getObj = async (obj: any, action: string) => {
    // setStore(obj);
    setValue("id", obj.id);

    if(action == "edit") {
      await getById(obj.id);
    };

    if(action == "delete") {
      openModal();
    };
  };
  
  const getSelectProduct = async () => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/products/select?deleted=false`, configApi());
      const result = data.result.data;
      setProduct(result);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getSelectSupplier = async () => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/suppliers?deleted=false`, configApi());
      const result = data.result.data;
      setSupplier(result);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(watch("productId")) {
      const product = products.find(x => x.id == watch("productId"));
      const list: any = product?.variations.filter(v => v.key).map(v => ({sequence: v.sequence, text: `${v.key}: ${v.value}`, value: v, selected: false, key: v.sequence}));
      setVariation(list)
    };
  }, [watch("productId")]);

  useEffect(() => {
    getSelectProduct();
    getSelectSupplier();

    if(id != "create") {
      getByPurchaseOrderId(id!);
    };
  }, []);

  return (
    <>
      <ComponentCard className="mb-3" title="Dados Gerais" hasHeader={false}>
        <div className="grid grid-cols-6 gap-2">  
          <div className="col-span-6 xl:col-span-2">
            <Label title="Produto"/>
            <select {...register("productId")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
              <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Selecione</option>
              {
                products.map((x: TProduct) => {
                  return <option key={x.id} value={x.id} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{x.code} - {x.name}</option>
                })
              }
            </select>
          </div>  
          <div className="col-span-6 xl:col-span-2">
            <Label title="Fornecedor"/>
            <select {...register("supplierId")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
              <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Selecione</option>
              {
                suppliers.map((x: TSupplier) => {
                  return <option key={x.id} value={x.id} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{x.tradeName}</option>
                })
              }
            </select>
          </div>
          <div className="col-span-6 xl:col-span-1">
            <Label title="Valor Unitário"/>
            <Controller
              name="cost"
              control={control}
              defaultValue={0}
              render={({ field: { onChange, value } }) => (
                <NumericFormat
                  className="input-erp-primary input-erp-default" 
                  value={value}
                  onValueChange={(values) => {
                    setValue("cost", values.floatValue ? values.floatValue : 0);
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                  placeholder="Valor Unitário"
                />
              )}
            />
          </div>
          <div className="col-span-6 xl:col-span-1">
            <Label title="Quantidade" />
            <input placeholder="Quantidade" {...register("quantity")} type="number" className="input-erp-primary input-erp-default"/>
          </div>
          <div className="col-span-6 xl:col-span-1">
            <Label title="Movimenta Estoque"/>
            <select {...register("moveStock")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
              <option value="yes" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Sim</option>
              <option value="no" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Não</option>
            </select>
          </div>  
          <div className="col-span-6 xl:col-span-1">
            <Label title="Preço de Venda" required={false}/>
            <Controller
              name="price"
              control={control}
              defaultValue={0}
              render={({ field: { onChange, value } }) => (
                <NumericFormat
                  className="input-erp-primary input-erp-default" 
                  value={value}
                  onValueChange={(values) => {
                    setValue("price", values.floatValue ? values.floatValue : 0);
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                  placeholder="Preço de Venda"
                />
              )}
            />
          </div>          
          <div className="col-span-6 xl:col-span-1">
            <Label title="Desconto de Venda" required={false}/>
            <Controller
              name="priceDiscount"
              control={control}
              defaultValue={0}
              render={({ field: { onChange, value } }) => (
                <NumericFormat
                  className="input-erp-primary input-erp-default" 
                  value={value}
                  onValueChange={(values) => {
                    setValue("priceDiscount", values.floatValue ? values.floatValue : 0);
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                  placeholder="Desconto de Venda"
                />
              )}
            />
          </div>          
          <div className="col-span-6 xl:col-span-3">
            <Label title="Variações" required={false}/>
            <MultiSelect options={variations} selectedValues={selectedValues} onChange={(e: any) => {setValue("variations", e)}} />
          </div>          
          <div className="col-span-6 xl:col-span-2 self-end">
            <Button onClick={() => save({...getValues()})} type="submit" className="w-full xl:max-w-20 mt-2 mr-2" size="sm">Salvar</Button>
            {
              watch("id") &&
              <Button onClick={() => {
                reset(ResetPurchaseOrderItem);
                setSelectedValues([]);
                setVariation([]);
              }} type="button" variant="outline" size="sm">Cancelar</Button>
            }
          </div>          
        </div>
      </ComponentCard>
      
      {
        items.length > 0 &&
        <ComponentCard title="Dados Gerais" hasHeader={false}>
          <div className="grid grid-cols-6 gap-2">  
            {
              items.map((x: any) => {
                return (
                  <div key={x.id} className="flex justify-between gap-6 col-span-6 p-5 mb-4 bg-white border border-gray-200 rounded-xl shadow-theme-sm dark:border-gray-800 dark:bg-white/5">
                    <div>
                      <p className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-gray-100">Produto</p>
                      <p className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">{x.productName}</p>
                    </div>
                    <div>
                      <p className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-gray-100">Fornecedor</p>
                      <p className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">{x.supplierName}</p>
                    </div>
                    <div>
                      <p className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-gray-100">Valor Unitário</p>
                      <p className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">{formattedMoney(x.cost)}</p>
                    </div>
                    <div>
                      <p className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-gray-100">Quantidade</p>
                      <p className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">{x.quantity}</p>
                    </div>
                    <div>
                      <p className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-gray-100">Movimenta Estoque</p>
                      <p className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">{x.moveStock == 'yes' ? 'Sim' : 'Não'}</p>
                    </div>
                    <div>
                      <p className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-gray-100">Preço de Venda</p>
                      <p className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">{formattedMoney(x.price)}</p>
                    </div>
                    <div>
                      <p className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-gray-100">Desconto de Venda</p>
                      <p className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">{formattedMoney(x.priceDiscount)}</p>
                    </div>
                    <div className="flex self-center gap-3">
                      {
                        permissionUpdate("A", "A2") &&
                        <IconEdit action="edit" obj={x} getObj={getObj}/>
                      }   
                      {
                        permissionDelete("A", "A2") &&
                        <IconDelete action="delete" obj={x} getObj={getObj}/>                                                   
                      }      
                    </div>
                  </div>
                )
              })
            }
          </div>

          <ModalDelete confirm={destroy} isOpen={isOpen} closeModal={closeModal} title="Excluir Item Pedido de Venda" /> 
        </ComponentCard>
      }
    </>
  );
}