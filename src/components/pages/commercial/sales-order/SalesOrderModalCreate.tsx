"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api, uriBase } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { Controller, useForm } from "react-hook-form";
import Label from "@/components/form/Label";
import { salesOrderCodeAtom, salesOrderIdAtom, salesOrderModalAtom, salesOrderStatusAtom } from "@/jotai/commercial/sales-order/salesOrder.jotai";
import { ResetSalesOrder, ResetSalesOrderFinish, TSalesOrder, TSalesOrderFinish } from "@/types/commercial/sales-orders/sales-order.type";
import { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import { ResetBox, TBox } from "@/types/commercial/box/box.type";
import Autocomplete from "@/components/form/Autocomplete";
import { TVariation } from "@/types/product/variation/variation.type";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { formattedMoney } from "@/utils/mask.util";
import { permissionDelete, permissionUpdate } from "@/utils/permission.util";
import { IconEdit } from "@/components/iconEdit/IconEdit";
import { IconDelete } from "@/components/iconDelete/IconDelete";
import { useModal } from "@/hooks/useModal";
import { ModalDelete } from "@/components/modalDelete/ModalDelete";
import { MdAutorenew, MdOutlineScreenSearchDesktop } from "react-icons/md";
import { TSerial } from "@/types/product/serial/serial.type";
import { exchangeModalAtom } from "@/jotai/stock/exchange/exchange.jotai";
import { ExchangeModal } from "@/components/stock/exchanges/ExchangeModal";
import { productAtom } from "@/jotai/product/product.jotai";
import { salesOrderItemIdAtom } from "@/jotai/commercial/sales-order/salesOrderItem.jotai";

export default function SalesOrderModalCreate() {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [modalCreate, setModalCreate] = useAtom(salesOrderModalAtom);
  const [modalCreateFinish, setModalCreateFinish] = useState(false);
  const [modalBoxCreate, setModalBoxCreate] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomer] = useState<any[]>([{id: 'Ao consumidor', tradeName: 'Ao consumidor'}]);
  const [sellers, setSeller] = useState<any[]>([]);
  const [sellerDefault, setSellerDefault] = useState<string>("");
  const [variations, setVariation] = useState<any[]>([]);
  const [serials, setSerial] = useState<TSerial[]>([]);
  const [quantityVariation, setQuantityVariation] = useState<number>(0);
  const [salesOrderId, setSalesOrderId] = useAtom(salesOrderIdAtom);
  const [salesOrderItems, setSalesOrderItems] = useState<any[]>([]);
  const { isOpen, openModal, closeModal } = useModal();
  const [salesOrderItem, setSalesOrderItem] = useState<any>();
  const [totalSalesOrder, setTotalSalesOrder] = useState<string>('0');
  const [paymentMethods, setPaymentMethod] = useState<any[]>([]);
  const [quantityOfInstallments, setQuantityOfInstallments] = useState<number>(0);
  const [__, setModal] = useAtom(exchangeModalAtom);
  const [___, setProduct] = useAtom(productAtom);
  const [____, setSalesOrderCode] = useAtom(salesOrderCodeAtom);
  const [_____, setSalesOrderItemId] = useAtom(salesOrderItemIdAtom);
  const [salesOrderStatus] = useAtom(salesOrderStatusAtom);
  
  const { getValues: getValuesBox, register: RegisterBox, control: controlBox } = useForm<TBox>({
    defaultValues: ResetBox
  });
  
  const { getValues: getValuesSalesOrder, register: registerSalesOrder, control: controlSalesOrder, setValue: setValueSalesOrder, watch: watchSalesOrder, reset: resetSalesOrder } = useForm<TSalesOrder>({
    defaultValues: ResetSalesOrder
  });

  const { getValues: getValuesSalesOrderFinish, register: registerSalesOrderFinish, control: controlSalesOrderFinish, setValue: setValueSalesOrderFinish, watch: watchSalesOrderFinish, reset: resetSalesOrderFinish } = useForm<TSalesOrderFinish>({
    defaultValues: ResetSalesOrderFinish
  });

  const createItem = async () => {
    try {
      const body = {
        id: "",
        salesOrderId,
        productId: watchSalesOrder("productId"),
        sellerId: watchSalesOrder("sellerId"),
        variationId: watchSalesOrder("variationId"),
        barcode: watchSalesOrder("barcode"),
        total: watchSalesOrder("total"),
        value: watchSalesOrder("value"),
        quantity: watchSalesOrder("quantity"),
        discountType: watchSalesOrder("discountType"),
        discountValue: watchSalesOrder("discountValue"),
        stockId: watchSalesOrder("stockId"),
        serial: watchSalesOrder("serial")
      };

      setIsLoading(true);
      const {data} = await api.post(`/sales-orders-items`, body, configApi());
      const result = data.result;
      resolveResponse({status: 201, message: result.message});
      cleanItem();

      await getSalesOrderItems(salesOrderId);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateItem = async () => {
    try {
      const body = {
        ...salesOrderItem,
        id: watchSalesOrder("itemId"),
        salesOrderId,
        productId: watchSalesOrder("productId"),
        sellerId: watchSalesOrder("sellerId"),
        variationId: watchSalesOrder("variationId"),
        total: watchSalesOrder("total"),
        value: watchSalesOrder("value"),
        quantity: watchSalesOrder("quantity"),
        discountType: watchSalesOrder("discountType"),
        discountValue: watchSalesOrder("discountValue"),
        barcode: watchSalesOrder("barcode"),
        stockId: watchSalesOrder("stockId"),
        serial: watchSalesOrder("serial")
      };

      setIsLoading(true);
      const {data} = await api.put(`/sales-orders-items`, body, configApi());
      const result = data.result;
      resolveResponse({status: 200, message: result.message});
      cleanItem();

      await getSalesOrderItems(salesOrderId);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const create = async () => {
    try {
      setIsLoading(true);
      const {data} = await api.post(`/sales-orders`, {...getValuesSalesOrder()}, configApi());
      const result = data.result;
      resolveResponse({status: 201, message: result.message});
      setValueSalesOrder("id", result.data.id);
      setSalesOrderId(result.data.id);
      cleanItem();

      await getSalesOrderItems(result.data.id);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const finish = async () => {
    try {
      setIsLoading(true);
      const {data} = await api.put(`/sales-orders/finish`, {...getValuesSalesOrderFinish(), id: salesOrderId}, configApi());
      const result = data.result;
      resolveResponse({status: 201, message: result.message});
      cleanItem();
      setModal(false);
      setModalCreate(false);
      setModalBoxCreate(false);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getById = async (id: string) => {
    try {
      const {data} = await api.get(`/sales-orders/${id}`, configApi());
      const result = data.result.data;
      const sellerName = result.userName ? result.userName : result.sellerName;
      
      if(result.customerId) {
        setValueSalesOrder("customerName", result.customerName);
        setValueSalesOrder("customerId", result.customerId);
      };
      setValueSalesOrder("sellerId", result.sellerId);
      setValueSalesOrder("sellerName", sellerName);
      setSalesOrderCode(result.code);
    } catch (error) {
      resolveResponse(error);
    }
  };

  const createBox = async () => {
    try {
      setIsLoading(true);
      const {data} = await api.post(`/boxes`, {...getValuesBox()}, configApi());
      const result = data.result;
      resolveResponse({status: 201, message: result.message});
      setModalBoxCreate(false);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBoxByCreatedBy = async () => {
    try {
      const {data} = await api.get(`/boxes/verify`, configApi());
      const result = data.result;
      if(result.data == null) {
        setModalBoxCreate(true);
      };
    } catch (error) {
      resolveResponse(error);
    }
  };

  const getSalesOrderItems = async (id: string) => {
    try {
      const {data} = await api.get(`/sales-orders-items?deleted=false&salesOrderId=${id}&orderBy=name&sort=desc&pageSize=1000&pageNumber=1`, configApi());
      const result = data.result;
      const total = result.data.reduce((value: number, item: any) => value + parseFloat(item.total), 0);
      setTotalSalesOrder(total)
      setSalesOrderItems(result.data);
    } catch (error) {
      resolveResponse(error);
    }
  };
  
  const getAutocompleProduct = async (value: string) => {
    try {
      if(!value) return setProducts([]);
      
      const {data} = await api.get(`/products/autocomplete?deleted=false&orderBy=name&sort=desc&pageSize=10&pageNumber=1&regex$or$name=${value}&regex$or$code=${value}`, configApi());
      const result = data.result;
      const list = result.data.map((x: any) => ({...x, isOutOfStock: x.stock.length == 0}));
      setProducts(list);
    } catch (error) {
      resolveResponse(error);
    }
  };

  const getAutocompleCustomer = async (value: string) => {
    try {
      if(!value) return setCustomer([]);
      
      const {data} = await api.get(`/customers?deleted=false&orderBy=corporateName&sort=desc&pageSize=10&pageNumber=1&regex$or$corporateName=${value}&regex$or$document=${value}&regex$or$code=${value}`, configApi());
      const result = data.result;
      setCustomer(result.data);
    } catch (error) {
      resolveResponse(error);
    }
  };
  
  const getSelectSellers = async () => {
    try {
      const {data} = await api.get(`/employees/select/sellers?deleted=false&orderBy=name&sort=desc&pageSize=10&pageNumber=1`, configApi());
      const result = data.result;
      setSeller(result.data);
    } catch (error) {
      resolveResponse(error);
    }
  };

  const getUserLogged = async () => {
    try {
      const {data} = await api.get(`/users/logged`, configApi());
      const result = data.result.data;
      setValueSalesOrder("sellerId", result.id); 
      setSellerDefault(result.id);
    } catch (error) {
      resolveResponse(error);
    }
  };

  const getSelectPaymentMethod = async () => {
    try {
      const {data} = await api.get(`/payment-methods?deleted=false&ne$type=payable&orderBy=createdAt&sort=desc&pageSize=1000&pageNumber=1`, configApi());
      const result = data.result;
      setPaymentMethod(result.data);
    } catch (error) {
      resolveResponse(error);
    }
  };

  const getObj = (obj: any, action: string) => {
    setSalesOrderItem(obj);

    if(action == "edit") {
      setVariation(obj.productVariations);
      
      setTimeout(() => {
        setQuantityVariation(parseFloat(obj.quantity));
        setValueSalesOrder("productHasSerial", obj.productHasSerial);
        setValueSalesOrder("barcode", obj.barcode);
        setValueSalesOrder("quantity", parseFloat(obj.quantity));
        setValueSalesOrder("productId", obj.productId);
        setValueSalesOrder("productName", obj.productName);
        setValueSalesOrder("itemId", obj.id);
        setValueSalesOrder("value", obj.value);
        setValueSalesOrder("discountType", obj.discountType);
        setValueSalesOrder("discountValue", obj.discountValue);
        setValueSalesOrder("image", obj.image);
        calculated();
      }, 50);
    };

    if(action == "delete") {
      openModal();
    };
  };

  const destroy = async () => {
    try {
      setIsLoading(true);
      await api.delete(`/sales-orders-items/${salesOrderItem.id}`, configApi());
      resolveResponse({status: 204, message: "Excluído com sucesso"});
      closeModal();
      await getSalesOrderItems(salesOrderId);
      cleanItem();
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanItem = () => {
    setValueSalesOrder("productId", "");
    setValueSalesOrder("productName", "");
    setValueSalesOrder("itemId", "");
    setValueSalesOrder("barcode", "");
    setValueSalesOrder("value", 0);
    setValueSalesOrder("quantity", 0);
    setValueSalesOrder("discountType", "money");
    setValueSalesOrder("discountValue", 0);
    setValueSalesOrder("total", 0);
    setValueSalesOrder("image", "");
    setValueSalesOrder("serial", "");
    
    setQuantityVariation(0);
    setValueSalesOrder("productName", "");
    setVariation([]);
    setProducts([]);
    setSerial([]);
  };
  
  const close = () => {
    cleanItem();
    
    setSalesOrderItems([]);
    setSalesOrderId("");
    resetSalesOrder(ResetSalesOrder);
    resetSalesOrderFinish(ResetSalesOrderFinish);
    setModalBoxCreate(false);
    setModalCreate(false);
    setModalCreateFinish(false);
  };
  
  const calculated = () => {
    setTimeout(() => {
      const discountValue = watchSalesOrder("discountValue") || 0;
      const discountType = watchSalesOrder("discountType");
      const value = watchSalesOrder("value");

      if(watchSalesOrder("quantity") == 0) {
        setValueSalesOrder("quantity", 1);
      };
      const quantity = watchSalesOrder("quantity");
      const subTotal = parseFloat(value.toString()) * parseFloat(quantity.toString());
      
      if (discountType === "percentage") {
        return subTotal - (subTotal * (discountValue / 100));
      };
  
      const total = subTotal - discountValue;
      setValueSalesOrder("total", total < 0 ? 0 : total);
      setValueSalesOrder("value", value);
    }, 10)
  };

  const normalizeValueSelect = (variation: any) => {
    const variationStr = variation.attributes.map((a: any) => (a.value));
    return variationStr.join(" / ");
  };

  const normalizeCost = (exchanges: any[], total: any) => {
    const exchangeTotal = exchanges.reduce((value: number, item: any) => value + parseFloat(item.cost), 0);
    console.log(total - exchangeTotal < 0 ? 0 : total - exchangeTotal);
    console.log(total)
    console.log(exchanges)
    return parseFloat(total) - exchangeTotal < 0 ? 0 : formattedMoney(parseFloat(total) - exchangeTotal);
  };

  useEffect(() => {
    const payment = paymentMethods.find(p => p.id == watchSalesOrderFinish("paymentMethodId"));
    if(payment) {
      setQuantityOfInstallments(payment.numberOfInstallments);
    };
  }, [watchSalesOrderFinish("paymentMethodId")]);

  useEffect(() => {
    if(watchSalesOrder("serial")) {
      const serial = serials.find(s => s.code == watchSalesOrder("serial"));
      if(serial) {
        setValueSalesOrder("value", serial.price);
        setValueSalesOrder("quantity", 1);

        calculated();
      };
    };
  }, [watchSalesOrder("serial")]);

  useEffect(() => {
    if(watchSalesOrder("barcode")) {
      const variation = variations.find(x => x.barcode == watchSalesOrder("barcode"));

      if(variation) {
        setQuantityVariation(variation.stock);
        setValueSalesOrder("variationId", variation.variationId);
        if(watchSalesOrder("productHasSerial") == "yes") {
          const newSerials = variation.serials.filter((s: TSerial) => s.hasAvailable);
          setSerial(newSerials);
        };
      };
    };

    calculated();
  }, [watchSalesOrder("barcode"), watchSalesOrder("quantity"), watchSalesOrder("value"), watchSalesOrder("discountValue"), watchSalesOrder("discountType")]);

  useEffect(() => {
    const intial = async () => {
      resetSalesOrder(ResetSalesOrder);
      setValueSalesOrder("id", salesOrderId);
      setIsLoading(true);
      await getSelectSellers();
      await getUserLogged();
      await getSelectPaymentMethod();
      
      if(modalCreate && salesOrderStatus == "Rascunho") {
        await getBoxByCreatedBy();
      };

      if(salesOrderId) {
        await getSalesOrderItems(salesOrderId);
        await getById(salesOrderId);
      };
      setIsLoading(false);
    };
    intial();
  }, [modalCreate]);

  return (
    <Modal isOpen={modalCreate} onClose={close} className={`m-4  ${modalBoxCreate ? 'w-[90dvw] max-w-180' : salesOrderStatus == "Finalizado" && 'max-w-[95dvw] lg:max-w-[45dvw]'}`}>
      <div className={`${modalBoxCreate ? 'h-[50dvh]' : 'h-[95dvh]'} ${modalBoxCreate ? 'w-full max-w-180' : salesOrderStatus == "Finalizado" && 'max-w-[95dvw] lg:max-w-[45dvw]'} no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11`}>
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">{modalBoxCreate ? 'Abertura de Caixa' : 'Pedido de Venda'}</h4>
        </div>

        <form className="flex flex-col">
          {
            modalBoxCreate ?
            <div className={`min-h-[25dvh] w-full max-w-180 custom-scrollbar overflow-y-auto px-2`}>
              <div className="grid grid-cols-6 gap-4">
                <div className="col-span-6 md:col-span-3">
                  <Label title="Valor da Abertura" />
                  <Controller
                    name="openingValue"
                    control={controlBox}
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
                        placeholder="Valor da Abertura"
                      />
                    )}
                  />
                </div>
                <div className="col-span-6 md:col-span-3">
                  <Label title="Venda por 2 etapas?" required={false}/>
                  <select {...RegisterBox("twoSteps")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                    <option value="yes" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Sim</option>
                    <option value="no" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Não</option>
                  </select>
                </div>  
              </div>
            </div>
            :
            <div className={`min-h-[60dvh] max-h-[70dvh] ${salesOrderStatus == "Rascunho" ? 'min-w-[30dvw]': 'w-full'} custom-scrollbar overflow-y-auto px-2 pb-3`}>
              <div className="grid grid-cols-12 gap-4 mt-7">
                {
                  salesOrderStatus == "Rascunho" &&
                  <div className="col-span-12 lg:col-span-6">
                    <div className="grid grid-cols-6 gap-4">
                      {
                        modalCreateFinish ?
                        <div className="col-span-6">
                          <div className="grid grid-cols-6 gap-4">                        
                            <div className="col-span-6 xl:col-span-3">
                              <Label title="Forma de Pagamento" />
                              <select {...registerSalesOrderFinish("paymentMethodId")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                                <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Selecione</option>
                                {
                                  paymentMethods.map((x: any) => {
                                    return (
                                      <option key={x.id} value={x.id} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{x.name}</option>
                                    ) 
                                  })
                                }
                              </select>
                            </div>
                            <div className="col-span-6 xl:col-span-3">
                              <Label title="Desconto" required={false}/>
                              <div className="relative flex items-stretch w-full">
                                <Controller
                                  name="discountValue"
                                  control={controlSalesOrder}
                                  defaultValue={0}
                                  render={({ field: { onChange, value } }) => (
                                    <NumericFormat
                                      className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:border-(--erp-primary-color) dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-(--erp-primary-color) bg-transparent text-gray-800 border-gray-300 focus:ring-brand-500/10 dark:border-gray-700 rounded-r-none border-r-0 text-right"
                                      value={value}
                                      onValueChange={(values) => onChange(values.floatValue || 0)}
                                      thousandSeparator="."
                                      decimalSeparator=","
                                      prefix={watchSalesOrderFinish("discountType") === "money" ? "R$ " : ""}
                                      suffix={watchSalesOrderFinish("discountType") === "percentage" ? " %" : ""}
                                      decimalScale={2}
                                      fixedDecimalScale
                                      allowNegative={false}
                                    />
                                  )}
                                />

                                <div className="flex items-center">
                                  <select {...registerSalesOrderFinish("discountType")} className="h-full border border-gray-300 bg-gray-50 px-2 py-1 text-sm font-medium text-gray-700 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-r-lg outline-none cursor-pointer">
                                    <option value="money">R$</option>
                                    <option value="percentage">%</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <div className="col-span-6 xl:col-span-3">
                              <Label title={`Quantidade de Parcelas`} required={false}/>
                              <select {...registerSalesOrderFinish("numberOfInstallments")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                                {
                                  Array.from({length: quantityOfInstallments}, (_, index) => {
                                    return <option key={index + 1} value={index + 1} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{index + 1}</option>
                                  })
                                }
                              </select>
                            </div>
                            <div className="col-span-6 xl:col-span-3">
                              <Label title="Frete" required={false}/>
                              <Controller
                                name="freight"
                                control={controlSalesOrderFinish}
                                defaultValue={0}
                                render={({ field: { onChange, value } }) => (
                                  <NumericFormat
                                    className="input-erp-primary input-erp-default" 
                                    value={value}
                                    onValueChange={(values) => onChange(values.floatValue ? values.floatValue : 0)}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    prefix="R$ "
                                    decimalScale={2}
                                    fixedDecimalScale
                                    allowNegative={false}
                                    placeholder="Frete"
                                  />
                                )}
                              />
                            </div>
                            <div className="col-span-6">
                              <Label title="Transportadora" required={false}/>
                              <input maxLength={50} placeholder="Transportadora" {...registerSalesOrderFinish("currier")} type="text" className="input-erp-primary input-erp-default"/>
                            </div>
                          </div>
                        </div>
                        :
                        <>
                          <div className="col-span-6">
                            <Label title="Produto" />
                            <Autocomplete defaultValue={watchSalesOrder("productName")} objKey="id" objValue="productName" onSearch={(value: string) => getAutocompleProduct(value)} onSelect={(opt) => {
                              setValueSalesOrder("productId", opt.id);
                              setValueSalesOrder("productName", opt.productName);
                              setValueSalesOrder("image", opt.image ?? "");
                              setValueSalesOrder("value", opt.price);
                              setValueSalesOrder("productHasSerial", opt.hasSerial);
                              setValueSalesOrder("productHasVariations", opt.hasVariations);
                              
                              if(opt.hasVariations == "no") {
                                setValueSalesOrder("value", opt.price);
                              };
                              
                              const stock = opt.stock.find((s: any) => s.quantity > 0);
                              if(stock) {
                                setValueSalesOrder("stockId", stock.id);
                                setVariation(stock.variations);
                                setQuantityVariation(stock.quantity);
                              };

                              calculated();
                            }} options={products}/>
                          </div>
                          <div className="col-span-6 xl:col-span-2 hidden lg:flex">
                            {
                              watchSalesOrder("image") != "" ?
                              <div className="lg:h-10 xl:h-52">
                                <img className="w-auto h-auto object-cover rounded-lg" src={`${uriBase}/${watchSalesOrder("image")}`} alt="foto do usuário" />
                              </div>
                              :
                              <div className="h-52">
                                <img className="w-full h-full object-cover rounded-lg" src="/assets/images/produto-sem-foto.png" alt="foto do usuário" />
                              </div>
                            }
                          </div>
                          <div className="col-span-6 xl:col-span-4">
                            <div className="grid grid-cols-4 gap-4">
                              {
                                watchSalesOrder("productHasVariations") == "yes" &&
                                <div className="col-span-6 xl:col-span-4">
                                  <Label title="Variação" />
                                  <select {...registerSalesOrder("barcode")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                                    <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Selecione</option>
                                    {
                                      variations.map((x: any, index: number) => {
                                        return (
                                          normalizeValueSelect(x).length > 0 &&
                                          <option key={x.barcode} value={x.barcode} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{normalizeValueSelect(x)}</option>
                                        ) 
                                      })
                                    }
                                  </select>
                                </div>
                              }
                              {
                                watchSalesOrder("productHasSerial") == "yes" ?
                                <div className="col-span-6 xl:col-span-4">
                                  <Label title="Serial" />
                                  <select {...registerSalesOrder("serial")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                                  <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Selecione</option>
                                    {
                                      serials.map((x: any, index: number) => {
                                        return (
                                          <option key={index} value={x.code} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{x.code}</option>
                                        ) 
                                      })
                                    }
                                  </select>
                                </div>
                                :
                                <>
                                  <div className="col-span-6 xl:col-span-2">
                                    <Label title="Valor Unitário" required={false}/>
                                    <Controller
                                      name="value"
                                      control={controlSalesOrder}
                                      defaultValue={0}
                                      render={({ field: { onChange, value } }) => (
                                        <NumericFormat
                                          className="input-erp-primary input-erp-default" 
                                          value={value}
                                          onValueChange={(values) => onChange(values.floatValue ? values.floatValue : 0)}
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
                                  <div className="col-span-6 xl:col-span-2">
                                    <Label title={`Quantidade`} required={false}/>
                                    <select {...registerSalesOrder("quantity")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                                      {
                                        Array.from({length: quantityVariation}, (_, index) => {
                                          return <option key={index + 1} value={index + 1} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{index + 1}</option>
                                        })
                                      }
                                    </select>
                                  </div>
                                </>
                              }
                              <div className="col-span-6 xl:col-span-2">
                                <Label title="Desconto" required={false}/>
                                <div className="relative flex items-stretch w-full">
                                  <Controller
                                    name="discountValue" 
                                    control={controlSalesOrder}
                                    defaultValue={0}
                                    render={({ field: { onChange, value } }) => (
                                      <NumericFormat
                                        className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:border-(--erp-primary-color) dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-(--erp-primary-color) bg-transparent text-gray-800 border-gray-300 focus:ring-brand-500/10 dark:border-gray-700 rounded-r-none border-r-0 text-right"
                                        value={value}
                                        onValueChange={(values) => onChange(values.floatValue || 0)}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        prefix={watchSalesOrder("discountType") === "money" ? "R$ " : ""}
                                        suffix={watchSalesOrder("discountType") === "percentage" ? " %" : ""}
                                        decimalScale={2}
                                        fixedDecimalScale
                                        allowNegative={false}
                                      />
                                    )}
                                  />

                                  <div className="flex items-center">
                                    <select {...registerSalesOrder("discountType")} className="h-full border border-gray-300 bg-gray-50 px-2 py-1 text-sm font-medium text-gray-700 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-r-lg outline-none cursor-pointer">
                                      <option value="money">R$</option>
                                      <option value="percentage">%</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                              <div className="col-span-6 xl:col-span-2">
                                <Label title="Valor total" required={false}/>
                                <Controller
                                  name="total"
                                  control={controlSalesOrder}
                                  defaultValue={0}
                                  render={({ field: { onChange, value } }) => (
                                    <NumericFormat
                                      className="input-erp-primary input-erp-default" 
                                      value={value}
                                      onValueChange={(values) => onChange(values.floatValue ? values.floatValue : 0)}
                                      thousandSeparator="."
                                      decimalSeparator=","
                                      prefix="R$ "
                                      decimalScale={2}
                                      fixedDecimalScale
                                      allowNegative={false}
                                      placeholder="Valor Total"
                                      disabled
                                    />
                                  )}
                                />
                              </div>
                              <div className="col-span-6 lg:col-span-4 items-end gap-4">
                                {
                                  !watchSalesOrder("id")  ?
                                  <Button className="w-full" size="sm" variant="primary" onClick={() => create()}>Adicionar Produto</Button>
                                  :
                                  watchSalesOrder("itemId") ?
                                  <div className="flex gap-4">
                                    <Button className="w-6/12" size="sm" variant="outline" onClick={() => cleanItem()}>Cancelar Alteração</Button>
                                    <Button className="w-6/12" size="sm" variant="primary" onClick={() => updateItem()}>Salvar Alteração</Button>
                                  </div>
                                  :
                                  <div className="flex gap-4">
                                    <Button className="w-6/12" size="sm" variant="outline" onClick={() => cleanItem()}>Cancelar</Button>
                                    <Button className="w-6/12" size="sm" variant="primary" onClick={() => createItem()}>Adicionar Produto</Button>
                                  </div>
                                }
                              </div>
                            </div>                          
                          </div>
                        </>
                      }
                    </div>
                  </div>
                }

                <div className={`col-span-12 ${salesOrderStatus == "Rascunho" ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
                  <div className="grid grid-cols-6 gap-4">
                    <div className="col-span-6 xl:col-span-3">
                      <Label title="Vendedor" />
                      <select disabled={salesOrderStatus == "Finalizado"} {...registerSalesOrder("sellerId")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                        {/* <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Selecione</option> */}
                        {
                          sellers.map((x: any) => {
                            return (
                              <option defaultValue={sellerDefault} key={x.id} value={x.id} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{x.name}</option>
                            ) 
                          })
                        }
                      </select>
                    </div>
                    <div className="col-span-6 xl:col-span-3">
                      <Label title="Cliente" required={false}/>
                      <Autocomplete disabled={salesOrderStatus == "Finalizado"} defaultValue={getValuesSalesOrder("customerName")} placeholder="Buscar cliente..." objKey="id" objValue="tradeName" onSearch={(value: string) => getAutocompleCustomer(value)} onSelect={(opt) => setValueSalesOrder("customerId", opt.id)} options={customers}/>
                    </div>
                    <div className="col-span-6 xl:col-span-6">
                      {
                        salesOrderItems.length == 0 ?
                        <div className="text-gray-500 dark:text-gray-400 flex flex-col justify-center items-center">
                          <MdOutlineScreenSearchDesktop className="text-[25dvh]" />
                          <h1 className="text-xl">Nenhum registro foi encontrado</h1>
                        </div>
                        :
                        <div className="max-h-[calc(100dvh-25rem)] overflow-y-auto rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 mb-3">
                          <div className="max-w-full overflow-x-auto tele-container-table">
                            <div className="min-w-full divide-y">
                              <Table className="divide-y">
                                <TableHeader className="border-b border-gray-100 dark:border-white/5 tele-table-thead">
                                  <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Produto</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Quantidade</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Valor Unitário</TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Valor Total</TableCell>
                                    {
                                      !modalCreateFinish && salesOrderStatus == "Rascunho" &&
                                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ações</TableCell>
                                    }
                                  </TableRow>
                                </TableHeader>

                                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                                  {salesOrderItems.map((x: any) => (
                                    <TableRow key={x.id}>
                                      <TableCell className="text-sm px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.productName}</TableCell>
                                      <TableCell className="text-sm px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.quantity}</TableCell>
                                      <TableCell className="text-sm px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{formattedMoney(x.value)}</TableCell>
                                      <TableCell className="text-sm px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{normalizeCost(x.exchanges, x.total)}</TableCell>
                                      {
                                        !modalCreateFinish &&
                                        <TableCell className="text-sm px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">
                                          <div className="flex gap-3">       
                                            {
                                              permissionUpdate("A", "A3") && salesOrderStatus == "Rascunho" &&
                                              <IconEdit action="edit" obj={x} getObj={getObj}/>
                                            }   
                                            {
                                              permissionUpdate("A", "A3") && salesOrderStatus == "Rascunho" &&
                                              <div onClick={() => {
                                                setSalesOrderItemId(x.id);
                                                setProduct({...x, hasSerial: x.productHasSerial});
                                                setModal(true);
                                              }} className="cursor-pointer text-blue-400 hover:text-blue-500">
                                                <MdAutorenew />
                                              </div>
                                            }   
                                            {
                                              permissionDelete("A", "A3") && salesOrderStatus == "Rascunho" &&
                                              <IconDelete action="delete" obj={x} getObj={getObj}/>                                                   
                                            }                                          
                                          </div>
                                        </TableCell>
                                      }
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>                
              </div>
            </div>
          }
          {
            !modalBoxCreate &&
            <div className="col-span-12 lg:col-span-3 gap-3 px-2 lg:justify-end">
              <h1 className={`${salesOrderStatus == "Rascunho" ? "w-6/12" : "w-12/12"} px-5 py-4 sm:px-6 text-start bg-green-600 text-white rounded-lg`}>TOTAL DO PEDIDO: <strong>{formattedMoney(totalSalesOrder)}</strong></h1>
            </div>
          }

          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            {
              modalCreateFinish &&
              <Button size="sm" variant="outline" onClick={() => setModalCreateFinish(false)}>Voltar</Button>
            }
            <Button size="sm" variant="outline" onClick={() => {
              close();
            }}>Cancelar</Button>

            {
              modalBoxCreate ?
              <Button size="sm" variant="primary" onClick={() => createBox()}>Confirmar</Button>
              :
              <>
                {
                  !modalCreateFinish && salesOrderStatus == "Rascunho" &&
                  <Button size="sm" variant="outline" onClick={() => {
                    close();
                  }}>Salvar Venda</Button>
                }

                {
                  salesOrderStatus == "Rascunho" ?
                  modalCreateFinish ?
                  <Button size="sm" variant="primary" onClick={() => finish()}>Finalizar Venda</Button>
                  :
                  <Button size="sm" variant="primary" onClick={() => {
                    setModalCreateFinish(true);
                  }}>Finalizar Venda</Button>
                  :
                  <></>
                }
              </>
            }
          </div>
        </form>
      </div>
      
      <ModalDelete confirm={destroy} isOpen={isOpen} closeModal={closeModal} title="Excluir Item Pedido de Venda" />  
      <ExchangeModal />        
    </Modal> 
  );
}