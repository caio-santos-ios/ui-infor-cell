"use client";

import Label from "@/components/form/Label";
import { selectedStoreAtom } from "@/jotai/dashboard/dashboard.jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { TStore } from "@/types/master-data/store/store.type";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

export const Filter = () => {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [stores, setStore] = useState<TStore[]>([]);
    const [__, setSelectedStore] = useAtom(selectedStoreAtom);

    const getSelectStore = async () => {
        try {
            setIsLoading(true);
            const {data} = await api.get(`/stores/select?deleted=false`, configApi());
            const result = data.result.data;
            setStore(result);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    
    useEffect(() => {
        getSelectStore();
    }, []);

    return (
        <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-3">
                <Label title="Loja" required={false}/>
                <select onChange={(e: any) => setSelectedStore(e.target.value)} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                    <option value="all" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Todas</option>
                    {
                        stores.map((x: TStore) => {
                            return <option key={x.id} value={x.id} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{x.tradeName}</option>
                        })
                    }
                </select>
            </div>  
        </div>
    )
}