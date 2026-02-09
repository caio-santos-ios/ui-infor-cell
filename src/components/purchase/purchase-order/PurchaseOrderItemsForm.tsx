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
import { ResetPurchaseOrderItem, TPurchaseOrderItem, TVariationPurchaseOrderItem } from "@/types/purchase/purchase-order/purchase-order.type";
import Label from "@/components/form/Label";
import { NumericFormat } from "react-number-format";
import { ResetProduct, TProduct } from "@/types/product/product/product.type";
import { TSupplier } from "@/types/master-data/supplier/supplier.type";
import MultiSelect from "@/components/form/MuiltSelect";
import { MultSelectCustom } from "@/components/form/MultSelectCustom";
import { formattedMoney } from "@/utils/mask.util";
import { permissionDelete, permissionRead, permissionUpdate } from "@/utils/permission.util";
import { IconEdit } from "@/components/iconEdit/IconEdit";
import { IconDelete } from "@/components/iconDelete/IconDelete";
import { ModalDelete } from "@/components/modalDelete/ModalDelete";
import { useModal } from "@/hooks/useModal";
import { toast } from "react-toastify";
import VariationForm from "@/components/product/product/VariationForm";
import PurchaseOrderItemVariationForm from "./PurchaseOrderItemVariationForm";
import { TSerial } from "@/types/product/serial/serial.type";
import { purchaseOrderStatusAtom } from "@/jotai/purchaseOrder/purchaseOrder.jotai";
import { IconView } from "@/components/iconView/IconView";
import { serialModalViewStockAtom } from "@/jotai/product/serial.jotai";
import SerialModalViewStock from "@/components/product/serial/SerialModalViewStock";
import { IconViewStock } from "@/components/iconViewStock/IconViewStock";
import Autocomplete from "@/components/form/Autocomplete";
import VariationsForm from "@/components/product/product/VariationsForm";
import { MdOutlineQrCodeScanner } from "react-icons/md";
import { productAtom } from "@/jotai/product/product.jotai";

type TProp = {
  id?: string;
};

export default function PurchaseOrderIemsForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [products, setProducts] = useState<TProduct[]>([]);
  const [suppliers, setSupplier] = useState<TSupplier[]>([]);
  const [variations, setVariation] = useState<any[]>([]);
  const [selectedValues, setSelectedValues] = useState<any[]>([]);
  const [items, setItem] = useState<TPurchaseOrderItem[]>([]);
  const [status, setStatus] = useAtom(purchaseOrderStatusAtom);
  const { isOpen, openModal, closeModal } = useModal();
  const [__, setModalViewStock] = useAtom(serialModalViewStockAtom);
  const [___, setProduct] = useAtom(productAtom);

  const { control, getValues, reset, register, setValue, watch } = useForm<TPurchaseOrderItem>({
    defaultValues: ResetPurchaseOrderItem
  });

  const costPrice = watch("cost");
  const salePrice = watch("price");
  const priceDiscount = watch("priceDiscount");

  const save = async (body: TPurchaseOrderItem) => {
    if(id == "create") return toast.warn("É obrigatório salvar o Pedido na aba Dados Gerais.", {theme: 'colored'});
    
    body.purchaseOrderId = id!;

    if(body.hasProductVariations == "yes") {
      if(body.hasProductSerial == "yes") {
        let cost: any = 0;
        let price: any = 0;
        let quantity: number = 0;
  
        body.variations.map((v: TVariationPurchaseOrderItem) => {
          cost += v.serials.reduce((total, item: any) => total + parseFloat(item.cost), 0);
          price += v.serials.reduce((total, item: any) => total + parseFloat(item.price), 0);
          quantity += parseFloat(v.stock.toString());
        });
  
        body.cost = cost / quantity;
        body.price = price / quantity;
        body.quantity = quantity;
      } else {
        let cost: any = 0;
        let price: any = 0;
        let quantity: number = 0;
  
        body.variations.map((v: TVariationPurchaseOrderItem) => {
          cost += v.serials.reduce((total, item: any) => total + parseFloat(item.cost), 0);
          price += v.serials.reduce((total, item: any) => total + parseFloat(item.price), 0);
          quantity += parseFloat(v.stock.toString());
        });
  
        // body.cost = cost / quantity;
        // body.price = price / quantity;
        body.quantity = quantity;
      };
    };

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
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getByPurchaseId = async (id: string) => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/purchase-orders/${id}`, configApi());
      const result = data.result.data;
      setStatus(result.status)
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
    setValue("id", obj.id);

    if(action == "edit") {
      await getById(obj.id);
    };

    if(action == "delete") {
      openModal();
    };

    if(action == "viewSerial") {
      setProduct({...ResetProduct, id: obj.productId});
      setModalViewStock(true);
    };
  };
  
  // const getSelectProduct = async () => {
  //   try {
  //     setIsLoading(true);
  //     const {data} = await api.get(`/products/select?deleted=false`, configApi());
  //     const result = data.result.data;
  //     setProducts(result);
  //   } catch (error) {
  //     resolveResponse(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  
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

  const getAutocompleProduct = async (value: string) => {
    try {
      if(!value) return setProducts([]);
      
      const {data} = await api.get(`/products/autocomplete?deleted=false&orderBy=name&sort=desc&pageSize=10&pageNumber=1&regex$or$name=${value}&regex$or$code=${value}`, configApi());
      const result = data.result;
      setProducts(result.data);
    } catch (error) {
      resolveResponse(error);
    }
  };

  useEffect(() => {
    const finalSaleValue = salePrice - priceDiscount;
    const profit = finalSaleValue - costPrice;

    setValue("netProfit", profit);

    if (finalSaleValue > 0) {
      const calculatedMargin = (profit / finalSaleValue) * 100;
      setValue("margin", calculatedMargin);
    } else {
      setValue("margin", 0);
    }
  }, [costPrice, salePrice, priceDiscount, setValue]);

  useEffect(() => {
    if(watch("productId")) {
      const product = products.find(x => x.id == watch("productId"));
      if(product) {
        setValue("hasProductSerial", product.hasSerial);
      };
    };
  }, [watch("productId")]);

  useEffect(() => {
    const initial = async () => {
      await getSelectSupplier();
  
      if(id != "create") {
        await getByPurchaseOrderId(id!);
        await getByPurchaseId(id!);
      };
    };
    initial();
  }, []);

  return (
    <>
      {
        status == "Rascunho" &&
        <ComponentCard className="mb-3" title="Dados Gerais" hasHeader={false}>
          <div className="grid grid-cols-6 gap-2">  
            <div className="col-span-6 xl:col-span-2">
              <Label title="Produto"/>
              {/* <select {...register("productId")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Selecione</option>
                {
                  products.map((x: TProduct) => {
                    return <option key={x.id} value={x.id} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{x.code} - {x.name}</option>
                  })
                }
              </select> */}
              <Autocomplete defaultValue={watch("productName")} objKey="id" objValue="productName" onSearch={(value: string) => getAutocompleProduct(value)} onSelect={(opt) => {
                console.log(opt)
                setValue("hasProductVariations", opt.hasVariations);
                setValue("variationsCode", opt.variationsCode);
                setValue("hasProductSerial", opt.hasSerial);
                setValue("variations", opt.variations);
                setValue("productId", opt.id);
              }} options={products}/>
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
            {
              watch("hasProductSerial") == "no" &&
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
            }
            {
              watch("hasProductSerial") == "no" &&
              <>
                {
                  watch("hasProductVariations") == "no" &&
                  <div className="col-span-6 xl:col-span-1">
                    <Label title="Quantidade" />
                    <input placeholder="Quantidade" {...register("quantity")} type="number" className="input-erp-primary input-erp-default no-spinner"/>
                  </div>              
                }
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
              </>
            }
            {
              watch("productId") && watch("hasProductVariations") == "yes" &&
              <div className="col-span-6 xl:col-span-6">
                <VariationsForm btnAddSerial={watch("hasProductSerial") == "yes"} sendBody={(body) => {
                  setValue("variations", body.variations);
                  setValue("variationsCode", body.variationsCode);

                  save({...getValues()});
                }} sendCancel={() => {
                  reset(ResetPurchaseOrderItem);
                  setSelectedValues([]);
                  setVariation([]);
                }} variations={watch("variations")} variationsCode={watch("variationsCode")} />
                {/* <PurchaseOrderItemVariationForm sendVariations={(body) => {
                  console.log(body)
                  setValue("variations", body.variations);
                  setValue("variationsCode", body.variationsCode);
                }} id={watch("id")} productId={watch("productId")} supplierId={watch("supplierId")}/> */}
              </div>  
            }

            <div className="col-span-6 xl:col-span-2 self-end">
              {
                watch("hasProductVariations") == "no" &&
                <Button onClick={() => save({...getValues()})} type="submit" className="w-full md:max-w-20 mt-2 mr-2" size="sm">{watch("id") ? 'Salvar' : 'Adicionar'}</Button>
              }
              {/* {
                watch("id") &&
                <Button onClick={() => {
                  reset(ResetPurchaseOrderItem);
                  setSelectedValues([]);
                  setVariation([]);
                }} type="button" variant="outline" size="sm">Cancelar</Button>
              } */}
            </div>          
          </div>
        </ComponentCard>
      }
      
      {
        items.length > 0 &&
        <ComponentCard title="Dados Gerais" hasHeader={false}>
          <div className="grid grid-cols-12 gap-2">  
            {
              items.map((x: any) => {
                return (
                  <div key={x.id} className="gap-6 col-span-12 p-5 mb-4 bg-white border border-gray-200 rounded-xl shadow-theme-sm dark:border-gray-800 dark:bg-white/5">
                    <div className="grid grid-cols-12 gap-8">
                      <div className="col-span-12 lg:col-span-3">
                        <p className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-gray-100">Produto</p>
                        <p className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">{x.productName}</p>
                      </div>
                      <div className="col-span-12 lg:col-span-2">
                        <p className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-gray-100">Fornecedor</p>
                        <p className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">{x.supplierName}</p>
                      </div>
                      <div className="col-span-6 lg:col-span-1">
                        <p className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-gray-100">Unit.</p>
                        <p className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">{formattedMoney(x.cost)}</p>
                      </div>
                      <div className="col-span-6 lg:col-span-1">
                        <p className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-gray-100">Quantidade</p>
                        <p className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">{x.quantity}</p>
                      </div>
                      <div className="col-span-6 lg:col-span-2">
                        <p className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-gray-100">Mov. Estoque</p>
                        <p className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">{x.moveStock == 'yes' ? 'Sim' : 'Não'}</p>
                      </div>
                      <div className="col-span-6 lg:col-span-2">
                        <p className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-gray-100">Preço venda</p>
                        <p className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">{formattedMoney(x.price)}</p>
                      </div>
                      {
                        status == "Rascunho" &&
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
                      }
                      {
                        status == "Finalizado" &&
                        <div className="flex self-center gap-3">
                          {
                            permissionRead("A", "A2") &&
                            <IconViewStock action="viewSerial" obj={x} getObj={getObj}/>
                          }   
                        </div>
                      }
                    </div>
                  </div>
                )
              })
            }
          </div>

          <ModalDelete confirm={destroy} isOpen={isOpen} closeModal={closeModal} title="Excluir Item Pedido de Venda" />
          <SerialModalViewStock />
        </ComponentCard>
      }
    </>
  );
}