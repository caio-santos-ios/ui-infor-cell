"use client";

import React, { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useAtom } from "jotai";
import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse, saveLocalStorage } from "@/service/config.service";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { TStore } from "@/types/master-data/store/store.type";

export default function CompanyDropdown() {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [userLogger, setUserLogger] = useAtom(userLoggerAtom);
  const [isOpen, setIsOpen] = useState(false);
  const [stores, setStore] = useState<TStore[]>([]);

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  function closeDropdown() {
    setIsOpen(false);
  };

  const updateCompany = async (id: string) => {
    try {
      setIsLoading(true);
      setIsOpen(false);

      await api.put(`/users/alter-store`, {store: id}, configApi());
      await handlerSync();
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlerSync = async () => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/users/logged`, configApi());
      const result = data.result.data;
      
      setUserLogger({
        name: result.name,
        email: result.email,
        photo: result.photo,
        nameCompany: result.nameCompany,
        nameStore: result.nameStore,
        typeUser: ""
      });
  
      saveLocalStorage(result);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="relative">
      <button onClick={toggleDropdown} className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle">
        <div className="flex flex-col">
          <p className="block mr-1 font-medium text-theme-sm text-start">{userLogger.nameCompany}</p>
          <p className="block mr-1 font-normal text-theme-sm text-gray-500 text-start">Loja: {userLogger.nameStore ? userLogger.nameStore : 'Matriz'}</p>
        </div>

        <svg className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${ isOpen ? "rotate-180" : "" }`} width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg" >
          <path d="M4.3125 8.65625L9 13.3437L13.6875 8.65625" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <Dropdown isOpen={isOpen} onClose={closeDropdown} className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark">
        <div className="flex items-center gap-3 px-3 py-2 font-bold text-gray-700 rounded-lg group text-theme-md dark:text-gray-400">
          Lojas ({stores.length})
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          {
            stores.map((x: TStore) => {
              return (
                <li key={x.id} onClick={() => updateCompany(x.id!)}>
                  <div className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 cursor-pointer">
                    {x.tradeName}
                  </div>
                </li>
              )
            })
          }
        </ul>        
      </Dropdown>
    </div>
  );
}
