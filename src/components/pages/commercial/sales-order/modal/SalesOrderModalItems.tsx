import Autocomplete from "@/components/form/Autocomplete";
import AutocompletePlus from "@/components/form/AutocompletePlus";
import Label from "@/components/form/Label";
import { IconDelete } from "@/components/iconDelete/IconDelete";
import { IconEdit } from "@/components/iconEdit/IconEdit";
import { ModalDelete } from "@/components/modalDelete/ModalDelete";
import { ExchangeModal } from "@/components/stock/exchanges/ExchangeModal";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useModal } from "@/hooks/useModal";
import { salesOrderCodeAtom, salesOrderIdAtom, salesOrderModalAtom, salesOrderModalStepAtom, salesOrderStatusAtom } from "@/jotai/commercial/sales-order/salesOrder.jotai";
import { salesOrderItemIdAtom } from "@/jotai/commercial/sales-order/salesOrderItem.jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { customerAtom, customerModalCreateAtom } from "@/jotai/masterData/customer.jotai";
import { productAtom } from "@/jotai/product/product.jotai";
import { exchangeModalAtom } from "@/jotai/stock/exchange.jotai";
import { api, uriBase } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { ResetSalesOrder, TSalesOrder } from "@/types/commercial/sales-orders/sales-order.type";
import { ResetCustomer } from "@/types/master-data/customer/customer.type";
import { TSerial } from "@/types/product/serial/serial.type";
import { formattedMoney } from "@/utils/mask.util";
import { permissionDelete, permissionUpdate } from "@/utils/permission.util";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { MdAutorenew } from "react-icons/md";
import { NumericFormat } from "react-number-format";
import BoxModalSettings from "../../box/BoxModalSettings";

export const SalesOrderModalItems = () => {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [modalCreate, setModalCreate] = useAtom(salesOrderModalAtom);
    const [modalStep, setModalStep] = useAtom(salesOrderModalStepAtom);
    const [salesOrderStatus, setSalesOrderStatus] = useAtom(salesOrderStatusAtom);
    const [salesOrderId, setSalesOrderId] = useAtom(salesOrderIdAtom);
    const [customers, setCustomers] = useState<any[]>([{id: 'Ao consumidor', tradeName: 'Ao consumidor'}]);
    const [customer, setCustomer] = useAtom(customerAtom);
    const [sellers, setSeller] = useState<any[]>([]);
    const [sellerDefault, setSellerDefault] = useState<string>("");
    const [__, setCustomerModalCreate] = useAtom(customerModalCreateAtom);

    const [salesOrderItems, setSalesOrderItems] = useState<any[]>([]);
    const [salesOrderItem, setSalesOrderItem] = useState<any>();

    const [totalSalesOrder, setTotalSalesOrder] = useState<string>('0');
    const [variations, setVariation] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [quantityVariation, setQuantityVariation] = useState<number>(0);
    const [serials, setSerial] = useState<TSerial[]>([]);

    const [___, setSalesOrderCode] = useAtom(salesOrderCodeAtom);
    const {isOpen, openModal, closeModal } = useModal();
    const [modalCreateFinish, setModalCreateFinish] = useState(false);
    const [_____, setSalesOrderItemId] = useAtom(salesOrderItemIdAtom);
    const [____, setProduct] = useAtom(productAtom);
    const [modalCreateExchange, setModal] = useAtom(exchangeModalAtom);

    const { getValues, register, control, setValue, watch, reset } = useForm<TSalesOrder>({
        defaultValues: ResetSalesOrder
    });

    const getById = async (id: string) => {
        try {
            const {data} = await api.get(`/sales-orders/${id}`, configApi());
            const result = data.result.data;
            const sellerName = result.userName ? result.userName : result.sellerName;
            
            if(result.customerId) {
                setValue("customerName", result.customerName);
                setValue("customerId", result.customerId);
            };

            setValue("sellerId", result.sellerId);
            setValue("sellerName", sellerName);
            setSalesOrderCode(result.code);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getUserLogged = async () => {
        try {
            const {data} = await api.get(`/users/logged`, configApi());
            const result = data.result.data;
            setValue("sellerId", result.id); 
            setSellerDefault(result.id);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getAutocompleCustomer = async (value: string) => {
        try {
            if(!value) return setCustomers([]);
            
            const {data} = await api.get(`/customers?deleted=false&orderBy=corporateName&sort=desc&pageSize=10&pageNumber=1&regex$or$corporateName=${value}&regex$or$document=${value}&regex$or$code=${value}`, configApi());
            const result = data.result;
            setCustomers(result.data);
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
            const list = result.data.map((x: any) => ({...x, isOutOfStock: x.stock.filter((s: any) => s.quantity > 0).length == 0}));
            setProducts(list);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const update = async () => {
        try {
            setIsLoading(true);
            await api.put(`/sales-orders`, {...getValues(), id: salesOrderId}, configApi());
            setModalCreate(false);
            setSalesOrderId("");
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const createItem = async () => {
        try {
            const body = {
                id: "",
                salesOrderId,
                productId: watch("productId"),
                sellerId: watch("sellerId"),
                variationId: watch("variationId"),
                codeVariation: watch("codeVariation"),
                total: watch("total"),
                subTotal: watch("subTotal"),
                value: watch("value"),
                quantity: watch("quantity"),
                discountType: watch("discountType"),
                discountValue: watch("discountValue"),
                stockId: watch("stockId"),
                serial: watch("serial")
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
                id: watch("itemId"),
                salesOrderId,
                productId: watch("productId"),
                sellerId: watch("sellerId"),
                variationId: watch("variationId"),
                total: watch("total"),
                subTotal: watch("subTotal"),
                value: watch("value"),
                quantity: watch("quantity"),
                discountType: watch("discountType"),
                discountValue: watch("discountValue"),
                codeVariation: watch("codeVariation"),
                stockId: watch("stockId"),
                serial: watch("serial")
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

    const destroyItem = async () => {
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
        setValue("productId", "");
        setValue("productName", "");
        setValue("itemId", "");
        setValue("barcode", "");
        setValue("value", 0);
        setValue("quantity", 0);
        setValue("discountType", "money");
        setValue("discountValue", 0);
        setValue("total", 0);
        setValue("image", "");
        setValue("serial", "");
        
        setQuantityVariation(0);
        setValue("productName", "");
        setVariation([]);
        setProducts([]);
        setSerial([]);

        setSalesOrderItem({id: ""});
    };

    const getObj = (obj: any, action: string) => {
        setSalesOrderItem(obj);

        if(action == "edit") {
        if(obj.productHasVariations == "yes") {
            setVariation(obj.stockVariations.variations);

            const currentVariation = obj.stockVariations.variations.find((x: any) => x.barcode == obj.barcode);
            if(currentVariation) {
            setSerial(currentVariation.serials);
            };
        } else {
            setQuantityVariation(parseFloat(obj.stockVariations.quantity));
        };
        
            setTimeout(() => {
                setValue("productHasVariations", obj.productHasVariations);
                setValue("productHasSerial", obj.productHasSerial);
                setValue("codeVariation", obj.codeVariation);
                setValue("quantity", parseFloat(obj.quantity));
                setValue("productId", obj.productId);
                setValue("productName", obj.productName);
                setValue("itemId", obj.id);
                setValue("value", obj.value);
                setValue("discountType", obj.discountType);
                setValue("discountValue", obj.discountValue);
                setValue("serial", obj.serial);
                
                if(obj.image) {
                    setValue("image", obj.image);
                };
                calculated();
            }, 50);
        };

        if(action == "delete") {
            openModal();
        };
    };

    const calculated = () => {
        setTimeout(() => {
            const discountValue = watch("discountValue") || 0;
            const discountType = watch("discountType");
            const value = watch("value");

            if(watch("quantity") == 0) {
                setValue("quantity", 1);
            };
            const quantity = watch("quantity");
            const subTotal = parseFloat(value.toString()) * parseFloat(quantity.toString());
            
            if (discountType === "percentage") {
                return subTotal - (subTotal * (discountValue / 100));
            };
    
            const total = subTotal - discountValue;
            setValue("total", total < 0 ? 0 : total);
            setValue("subTotal", subTotal < 0 ? 0 : subTotal);
            setValue("value", value);
        }, 10);
    };

    const normalizeValueSelect = (variation: any) => {
        const variationStr = variation.attributes.map((a: any) => (a.value));
        return variationStr.join(" / ");
    };

    useEffect(() => {
        if(customer.id && customer.tradeName) {
            setValue("customerId", customer.id);
            setValue("customerName", customer.tradeName);
        };
    }, [customer]);

    useEffect(() => {
        const initial = async () => {
            await getUserLogged();
            await getSelectSellers();
            await getSalesOrderItems(salesOrderId);
            await getById(salesOrderId);
        };
        initial();
    }, []);

    return (
        <>
            <div className={`grid grid-cols-8 gap-4 mb-4`}>
                <div className="col-span-4">
                    <Label title="Produto" />
                    <Autocomplete placeholder="Buscar produto...." defaultValue={watch("productName")} objKey="id" objValue="productName" onSearch={(value: string) => getAutocompleProduct(value)} onSelect={(opt) => {
                        setValue("productId", opt.id);
                        setValue("productName", opt.productName);
                        setValue("image", opt.image ?? "");
                        setValue("value", opt.price);
                        setValue("productHasSerial", opt.hasSerial);
                        setValue("productHasVariations", opt.hasVariations);
                        
                        if(opt.hasVariations == "no") {
                            setValue("value", opt.price);
                        };
                        
                        const stock = opt.stock.find((s: any) => s.quantity > 0);
                        if(stock) {
                            if(opt.hasSerial == "no") {
                                setValue("value", parseFloat(stock.price));
                            };

                            setValue("stockId", stock.id);
                            setVariation(stock.variations.filter((x: any) => parseInt(x.stock) > 0));
                            if(opt.hasVariations == "no") {
                                const quantityStock = opt.stock.reduce((value: number, item: any) => value + parseFloat(item.quantity), 0);
                                setQuantityVariation(quantityStock);
                            } else {
                                setQuantityVariation(stock.quantity);
                            }
                        };

                        calculated();
                        setProducts([]);
                    }} options={products}/>
                </div>
                <div className="col-span-2">
                    <Label title="Vendedor" />
                    <select disabled={salesOrderStatus == "Finalizado"} {...register("sellerId")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                        {
                            sellers.map((x: any) => {
                                return (
                                    <option defaultValue={sellerDefault} key={x.id} value={x.id} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{x.name}</option>
                                ) 
                            })
                        }
                    </select>
                </div>
                <div className="col-span-2">
                    <Label title="Cliente" required={false}/>
                    {
                        watch("customerName") == "Ao consumidor" ?
                        (
                            <Autocomplete disabled={salesOrderStatus == "Finalizado"} defaultValue={getValues("customerName")} placeholder="Buscar cliente..." objKey="id" objValue="tradeName" onSearch={(value: string) => {
                                getAutocompleCustomer(value);
                                if(!value) {
                                    setValue("customerId", "");
                                    setValue("customerName", "");
                                }
                            }} onSelect={(opt) => {
                                setValue("customerId", opt.id);
                                setValue("customerName", opt.tradeName);
                                setCustomers([]);
                            }} options={customers}/>
                        )
                        :
                        (
                            <AutocompletePlus 
                                onEditClick={() => {setCustomerModalCreate(true); setCustomer({...ResetCustomer, id: watch("customerId")})}} 
                                onAddClick={() => {setCustomerModalCreate(true); setCustomer({...ResetCustomer})}} 
                                disabled={salesOrderStatus == "Finalizado"} defaultValue={getValues("customerName")} placeholder="Buscar cliente..." objKey="id" objValue="tradeName" onSearch={(value: string) => getAutocompleCustomer(value)} onSelect={(opt) => {
                                setValue("customerId", opt.id);
                                setValue("customerName", opt.tradeName);
                                setCustomers([]);
                            }} options={customers}/>
                        )
                    }
                </div>
            </div>
            <div className={`grid grid-cols-6 gap-4`}>
                <div className="col-span-6 xl:col-span-1 hidden lg:flex">
                    {
                        watch("image") != "" ?
                        <div className="lg:h-10 xl:h-52">
                            <img className="w-auto h-auto object-cover rounded-lg" src={`${uriBase}/${watch("image")}`} alt="foto do produto" />
                        </div>
                        :
                        <div className="h-52">
                            <img className="w-full h-full object-cover rounded-lg" src="/assets/images/produto-sem-foto.png" alt="foto do produto" />
                        </div>
                    }
                </div>

                <div className="col-span-2">
                    <div className="grid grid-cols-2 gap-4">
                        {
                            watch("productHasVariations") == "yes" &&
                            <div className="col-span-2 xl:col-span-1">
                                <Label title="Variação" />
                                <select {...register("codeVariation")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                                    <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Selecione</option>
                                    {
                                    variations.map((x: any, index: number) => {
                                        return (
                                        normalizeValueSelect(x).length > 0 &&
                                        <option key={x.code} value={x.code} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{normalizeValueSelect(x)}</option>
                                        ) 
                                    })
                                    }
                                </select>
                            </div>
                        }
                        {
                            watch("productHasSerial") == "yes" ?
                            <div className="col-span-2 xl:col-span-1">
                                <Label title="Serial" />
                                <select {...register("serial")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
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
                                <div className="col-span-2 xl:col-span-1">
                                    <Label title="Valor Unitário" required={false}/>
                                    <Controller
                                        name="value"
                                        control={control}
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
                                <div className="col-span-2 xl:col-span-1">
                                    <Label title={`Quantidade`} required={false}/>
                                    <select {...register("quantity")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                                    {
                                        Array.from({length: quantityVariation}, (_, index) => {
                                        return <option key={index + 1} value={index + 1} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{index + 1}</option>
                                        })
                                    }
                                    </select>
                                </div>
                            </>
                        }
                        <div className="col-span-2 xl:col-span-1">
                            <Label title="Desconto" required={false}/>
                            <div className="relative flex items-stretch w-full">
                                <Controller
                                    name="discountValue" 
                                    control={control}
                                    defaultValue={0}
                                    render={({ field: { onChange, value } }) => (
                                    <NumericFormat
                                        className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:border-(--erp-primary-color) dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-(--erp-primary-color) bg-transparent text-gray-800 border-gray-300 focus:ring-brand-500/10 dark:border-gray-700 rounded-r-none border-r-0 text-right"
                                        value={value}
                                        onValueChange={(values) => onChange(values.floatValue || 0)}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        prefix={watch("discountType") === "money" ? "R$ " : ""}
                                        suffix={watch("discountType") === "percentage" ? " %" : ""}
                                        decimalScale={2}
                                        fixedDecimalScale
                                        allowNegative={false}
                                    />
                                    )}
                                />

                                <div className="flex items-center">
                                    <select {...register("discountType")} className="h-full border border-gray-300 bg-gray-50 px-2 py-1 text-sm font-medium text-gray-700 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-r-lg outline-none cursor-pointer">
                                        <option value="money">R$</option>
                                        <option value="percentage">%</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-2 xl:col-span-1">
                            <Label title="Valor total" required={false}/>
                            <Controller
                                name="total"
                                control={control}
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
                        <div className="col-span-2">
                            {
                                watch("itemId") ? 
                                (
                                    <div className="flex gap-4">
                                        <Button className="w-6/12" size="sm" variant="outline" onClick={() => cleanItem()}>Cancelar Alteração</Button>
                                        <Button className="w-6/12" size="sm" variant="primary" onClick={() => updateItem()}>Salvar Alteração</Button>
                                    </div>
                                )
                                :
                                (
                                    <Button className="w-full" size="sm" variant="primary" onClick={() => createItem()}>Adicionar Produto</Button>
                                )
                            }
                        </div>
                    </div>
                </div>

                <div className="col-span-3">
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
                                                !modalCreateFinish && salesOrderStatus == "Em Aberto" &&
                                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ações</TableCell>
                                            }
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {salesOrderItems.map((x: any) => (
                                            <TableRow key={x.id}>
                                                <TableCell className="text-sm px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">
                                                    {x.productName}
                                                    {
                                                    x.status == "Produto Devolvido" &&
                                                    <span className="text-red-500"> - {x.status}</span>
                                                    }
                                                </TableCell>
                                                <TableCell className="text-sm px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.quantity}</TableCell>
                                                <TableCell className="text-sm px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{formattedMoney(x.value)}</TableCell>
                                                <TableCell className="text-sm px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{formattedMoney(x.total)}</TableCell>
                                                {
                                                    !modalCreateFinish &&
                                                    <TableCell className="text-sm px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">
                                                        <div className="flex gap-3">       
                                                            {
                                                                permissionUpdate("A", "A3") && salesOrderStatus == "Em Aberto" &&
                                                                <IconEdit action="edit" obj={x} getObj={getObj}/>
                                                            }   
                                                            {
                                                                permissionUpdate("A", "A3") && salesOrderStatus == "Em Aberto" &&
                                                                <div title="Trocar" onClick={() => {
                                                                    setSalesOrderItemId(x.id);
                                                                    setProduct({...x, hasSerial: x.productHasSerial});
                                                                    setModal(true);
                                                                }} className="cursor-pointer text-blue-400 hover:text-blue-500">
                                                                    <MdAutorenew />
                                                                </div>
                                                            }   
                                                            {
                                                                permissionDelete("A", "A3") && salesOrderStatus == "Em Aberto" &&
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
                </div>

                <div className="col-span-6 lg:col-span-3">
                    <h1 className={`${salesOrderStatus == "Em Aberto" ? "w-12/12" : "w-12/12"} py-1.5 px-4 text-start bg-green-600 text-white rounded-lg`}>TOTAL DO PEDIDO: <strong>{formattedMoney(totalSalesOrder)}</strong></h1>
                </div>
                <div className="col-span-6 lg:col-span-3">
                    <div className="flex gap-4">
                        <Button className="w-6/12" size="sm" variant="outline" onClick={update}>Salvar e Fechar</Button>
                        <Button className="w-6/12" size="sm" variant="primary" onClick={() => setModalStep("payment")}>Avançar Pagamento</Button>
                    </div>
                </div>
            </div>

            <ModalDelete confirm={destroyItem} isOpen={isOpen} closeModal={closeModal} title="Excluir Item Pedido de Venda" />  
            {/* <ExchangeModal />  -> Modal antigo de troca */}
            <BoxModalSettings />   
        </>
    )
}