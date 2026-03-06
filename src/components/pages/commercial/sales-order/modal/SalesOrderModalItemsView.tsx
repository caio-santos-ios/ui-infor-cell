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
import { MdAutorenew, MdPhoneIphone } from "react-icons/md";
import { NumericFormat } from "react-number-format";
import BoxModalSettings from "../../box/BoxModalSettings";
import { SalesOrderTradeInModal, tradeInModalAtom, tradeInRefreshAtom } from "./SalesOrderTradeInModal";

export const SalesOrderModalItemsView = () => {
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
    const [modalCreateFinish] = useState(false);
    const [_______, setSalesOrderItemId] = useAtom(salesOrderItemIdAtom);
    const [______, setTradeInModal] = useAtom(tradeInModalAtom);
    const [tradeInRefresh] = useAtom(tradeInRefreshAtom);

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
            setSalesOrderStatus(result.status);

            if(result.status == "Finalizado") {
                setModalStep("itemsView");
            };
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
        if (tradeInRefresh > 0) getSalesOrderItems(salesOrderId);
    }, [tradeInRefresh]);

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
                                                
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}