"use client";

import Pagination from "@/components/tables/Pagination";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { formattedMoney, maskDate } from "@/utils/mask.util";
import { permissionDelete, permissionRead, permissionUpdate } from "@/utils/permission.util";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { NotData } from "@/components/not-data/NotData";
import { storeLoggedAtom } from "@/jotai/global/store.jotai";
import { IconEdit } from "@/components/iconEdit/IconEdit";
import { IconDelete } from "@/components/iconDelete/IconDelete";
import { ModalDelete } from "@/components/modalDelete/ModalDelete";
import { useModal } from "@/hooks/useModal";
import { ResetPaymentMethod, TPaymentMethod } from "@/types/payment-method/payment-method.type";
import PaymentMethodModalCreate from "./PaymentMethodModalCreate";
import { paymentMethodIdAtom, paymentMethodModalAtom } from "@/jotai/financial/payment-methods/paymentMethod.jotai";

export default function PaymentMethodTable() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
  const [storeLogged] = useAtom(storeLoggedAtom);
  const [paymentMethodId, setPaymentMethodId] = useAtom(paymentMethodIdAtom);  
  const { isOpen, openModal, closeModal } = useModal();
  const [paymentMethod, setPaymentMethod] = useState<TPaymentMethod>(ResetPaymentMethod);
  const [modalCreate, setModalCreate] = useAtom(paymentMethodModalAtom);

  const getAll = async (page: number) => {
    try {
      setLoading(true);
      const {data} = await api.get(`/payment-methods?deleted=false&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=${page}`, configApi());
      const result = data.result;
      
      setPagination({
        currentPage: result.currentPage,
        data: result.data ?? [],
        sizePage: result.pageSize,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      });
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
  };

  const changePage = async (page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));

    await getAll(page);
  };

  const destroy = async () => {
    try {
      setLoading(true);
      await api.delete(`/payment-methods/${paymentMethod.id}`, configApi());
      resolveResponse({status: 204, message: "Excluído com sucesso"});
      closeModal();
      setPaymentMethodId("");
      setPaymentMethod(ResetPaymentMethod);
      await getAll(pagination.currentPage);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
  };

  const getObj = (obj: any, action: string) => {
    setPaymentMethod(obj);
    setPaymentMethodId(obj.id);

    if(action == "edit") {
      setModalCreate(true);
    };

    if(action == "delete") {
      openModal();
    };
  };
  
  useEffect(() => {
    if(permissionRead("F", "F1")) {
      getAll(1);
    };
  }, [storeLogged, modalCreate]);

  return (
    <>
      <PaymentMethodModalCreate />
      {

          pagination.data.length > 0 ?
          <>
            <div className="erp-container-table rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 mb-3">
              <div className="max-w-full overflow-x-auto tele-container-table">
                <div className="min-w-[1102px] divide-y">
                  <Table className="divide-y">
                    <TableHeader className="border-b border-gray-100 dark:border-white/5 tele-table-thead">
                      <TableRow>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Código</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nome</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Parcelas</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Data da Criação</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ações</TableCell>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                      {pagination.data.map((x: any) => (
                        <TableRow key={x.id}>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.code}</TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.name}</TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.numberOfInstallments}</TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{maskDate(x.createdAt)}</TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">
                            <div className="flex gap-3">       
                              {
                                permissionUpdate("F", "F1") &&
                                <IconEdit action="edit" obj={x} getObj={getObj}/>
                              }   
                              {
                                permissionDelete("F", "F1") &&
                                <IconDelete action="delete" obj={x} getObj={getObj}/>                                                   
                              }                                          
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
            <Pagination currentPage={pagination.currentPage} totalCount={pagination.totalCount} totalData={pagination.data.length} totalPages={pagination.totalPages} onPageChange={changePage} />        
            <ModalDelete confirm={destroy} isOpen={isOpen} closeModal={closeModal} title="Excluir Forma de Pagamento" />          
          </>
          :
          <NotData />
        }
    </>
  );
}