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
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { IconEdit } from "@/components/iconEdit/IconEdit";
import { IconDelete } from "@/components/iconDelete/IconDelete";
import { useModal } from "@/hooks/useModal";
import { ModalDelete } from "@/components/modalDelete/ModalDelete";
import { NotData } from "@/components/not-data/NotData";
import { ResetPurchaseOrder, TPurchaseOrder } from "@/types/purchase/purchase-order/purchase-order.type";
import { FaCheck } from "react-icons/fa";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { GoAlert } from "react-icons/go";

export default function PurchaseOrderTable() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
  const { isOpen, openModal, closeModal } = useModal();
  const [purchaseOrder, setPurchaseOrder] = useState<TPurchaseOrder>(ResetPurchaseOrder);
  const [modalApproval, setModalApproval] = useState<boolean>(false);
  const router = useRouter();

  const getAll = async (page: number) => {
    try {
      setLoading(true);
      const {data} = await api.get(`/purchase-orders?deleted=false&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=${page}`, configApi());
      const result = data.result;

      setPagination({
        currentPage: result.currentPage,
        data: result.data,
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
  
  const destroy = async () => {
    try {
      setLoading(true);
      await api.delete(`/purchase-orders/${purchaseOrder.id}`, configApi());
      resolveResponse({status: 204, message: "Excluído com sucesso"});
      closeModal();
      await getAll(pagination.currentPage);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
  };
  
  const approval = async () => {
    try {
      setLoading(true);
      await api.put(`/purchase-orders/approval`, {id: purchaseOrder.id}, configApi());
      resolveResponse({status: 200, message: "Aprovado com sucesso"});
      setModalApproval(false);
      await getAll(pagination.currentPage);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
  };

  const getObj = (obj: any, action: string) => {
    setPurchaseOrder(obj);

    if(action == "edit") {
      router.push(`/purchase/purchase-order/${obj.id}`);
    };

    if(action == "delete") {
      openModal();
    };

    if(action == "approval") {
      setModalApproval(true);
    }
  };

  const changePage = async (page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));

    await getAll(page);
  };

  const normalize = (item: any) => {
    if(item["items"]) {
      console.log(item.items)
      return item.items.length > 0;
    };
    return false;
  }

  useEffect(() => {
    if(permissionRead("G", "G1")) {
      getAll(1);
    };
  }, []);

  return (
    pagination.data.length > 0 ?
    <>
      <div className="erp-container-table rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 mb-3">
        <div className="max-w-full overflow-x-auto tele-container-table">
          <div className="min-w-[1102px] divide-y">
            <Table className="divide-y">
              <TableHeader className="border-b border-gray-100 dark:border-white/5 tele-table-thead">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Número</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Data da Compra</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Total</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Desconto</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Data de Criação</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ações</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                {pagination.data.map((x: any) => (
                  <TableRow key={x.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.code}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{maskDate(x.date)}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.status}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{formattedMoney(x.total)}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{formattedMoney(x.discount)}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{maskDate(x.createdAt)}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">
                      <div className="flex gap-3">       
                        {
                          permissionUpdate("G", "G1") &&
                          <IconEdit action="edit" obj={x} getObj={getObj}/>
                        }   
                        {
                          permissionUpdate("G", "G1") && normalize(x) &&
                          <div onClick={() => getObj(x, "approval")} className="cursor-pointer text-green-400 hover:text-green-500" >
                            <FaCheck />
                          </div>
                        }   
                        {
                          permissionDelete("G", "G1") &&
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

      <ModalDelete confirm={destroy} isOpen={isOpen} closeModal={closeModal} title="Excluir Pedido de Venda" /> 
      <Modal isOpen={modalApproval} onClose={() => setModalApproval(false)} className="max-w-[500px] m-4">
        <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
                <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Aprovar Pedido de Compra</h4>
            </div>

            <form className="flex flex-col">
                <div className="custom-scrollbar h-[150px] overflow-y-auto px-2 pb-3">
                    <div className="mt-7">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                            <div className="h-full flex col-span-1 justify-center items-center flex-col">
                              <GoAlert className="text-red-600" size={80} />
                              <h1 className="font-semibold text-lg text-gray-800 dark:text-white/90">Deseja aprovar o pedido de compra Nº {purchaseOrder.code}?</h1>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                    <Button size="sm" variant="outline" onClick={() => setModalApproval(false)}>Cancelar</Button>
                    <Button size="sm" variant="primary" onClick={approval}>Confirmar</Button>
                </div>
            </form>
        </div>
      </Modal>          
    </>
    :
    <NotData />
  );
}