import Autocomplete from "@/components/form/Autocomplete";
import AutocompletePlus from "@/components/form/AutocompletePlus";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal"
import { salesOrderIdAtom, salesOrderModalAtom, salesOrderModalStepAtom, salesOrderStatusAtom } from "@/jotai/commercial/sales-order/salesOrder.jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { customerAtom, customerModalCreateAtom } from "@/jotai/masterData/customer.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { ResetSalesOrder, TSalesOrder } from "@/types/commercial/sales-orders/sales-order.type";
import { ResetCustomer } from "@/types/master-data/customer/customer.type";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export const SalesOrderModalSeller = () => {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [____, setModalCreate] = useAtom(salesOrderModalAtom);
    const [_____, setModalStep] = useAtom(salesOrderModalStepAtom);
    const [salesOrderStatus] = useAtom(salesOrderStatusAtom);
    const [___, setSalesOrderId] = useAtom(salesOrderIdAtom);
    const [customers, setCustomers] = useState<any[]>([{id: 'Ao consumidor', tradeName: 'Ao consumidor'}]);
    const [customer, setCustomer] = useAtom(customerAtom);
    const [sellers, setSeller] = useState<any[]>([]);
    const [sellerDefault, setSellerDefault] = useState<string>("");
    const [__, setCustomerModalCreate] = useAtom(customerModalCreateAtom);

    const { getValues, register, setValue, watch, reset } = useForm<TSalesOrder>({
        defaultValues: ResetSalesOrder
    });

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
    
    const create = async () => {
        try {
            setIsLoading(true);
            const {data} = await api.post(`/sales-orders`, {...getValues()}, configApi());
            const result = data.result;
            setSalesOrderId(result.id);
            setModalStep("items");
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if(customer.id && customer.tradeName) {
            setValue("customerId", customer.id);
            setValue("customerName", customer.tradeName);
        };
    }, [customer])

    useEffect(() => {
        const initial = async () => {
            await getUserLogged();
            await getSelectSellers();
        };
        initial();
    }, []);

    return (
        <div className={`grid grid-cols-1 gap-3`}>
            <div className="col-span-1">
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
            <div className="col-span-1">
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
                        }} options={customers}/>
                    )
                }
            </div>
            <div className="col-span-1">
                <Button className="w-full" size="sm" variant="primary" onClick={create}>Avançar</Button>
            </div>
        </div>
    )
}