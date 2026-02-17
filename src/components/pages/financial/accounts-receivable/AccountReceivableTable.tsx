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
import { ResetAccountReceivable, statusLabel, TAccountReceivable } from "@/types/financial/accounts-receivable/accounts-receivable.type";
import AccountReceivableModalCreate from "./AccountReceivableModalCreate";
import AccountReceivableModalPay from "./AccountReceivableModalPay";
import { accountReceivableIdAtom, accountReceivableModalAtom, accountReceivablePayModalAtom } from "@/jotai/financial/accounts-receivable/accountsReceivable.jotai";
import { MdPayment } from "react-icons/md";
import { IconView } from "@/components/iconView/IconView";

export default function AccountReceivableTable() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [pagination, setPagination] = useAtom(paginationAtom);
  const [storeLogged] = useAtom(storeLoggedAtom);
  const [accountReceivableId, setAccountReceivableId] = useAtom(accountReceivableIdAtom);
  const { isOpen, openModal, closeModal } = useModal();
  const [selected, setSelected] = useState<TAccountReceivable>(ResetAccountReceivable);
  const [modalCreate, setModalCreate] = useAtom(accountReceivableModalAtom);
  const [payModal, setPayModal] = useAtom(accountReceivablePayModalAtom);

  const getAll = async (page: number) => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `/accounts-receivable?deleted=false&orderBy=dueDate&sort=asc&pageSize=10&pageNumber=${page}`,
        configApi()
      );
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
    setPagination(prev => ({ ...prev, currentPage: page }));
    await getAll(page);
  };

  const destroy = async () => {
    try {
      setLoading(true);
      await api.delete(`/accounts-receivable/${selected.id}`, configApi());
      resolveResponse({ status: 204, message: "Excluído com sucesso" });
      closeModal();
      setAccountReceivableId("");
      setSelected(ResetAccountReceivable);
      await getAll(pagination.currentPage);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
  };

  const getObj = (obj: any, action: string) => {
    setSelected(obj);
    setAccountReceivableId(obj.id);

    if (action === "edit") setModalCreate(true);
    if (action === "view") setModalCreate(true);
    if (action === "delete") openModal();
    if (action === "pay") setPayModal(true);
  };

  useEffect(() => {
    if (permissionRead("H", "H1")) {
      getAll(1);
    }
  }, [storeLogged, modalCreate, payModal]);

  const getStatusBadge = (status: string) => {
    const s = statusLabel[status] ?? { label: status, color: "bg-gray-100 text-gray-700" };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
        {s.label}
      </span>
    );
  };

  return (
    <>
      <AccountReceivableModalCreate />
      <AccountReceivableModalPay />
      {pagination.data.length > 0 ? (
        <>
          <div className="erp-container-table rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 mb-3">
            <div className="max-w-full overflow-x-auto tele-container-table">
              <div className="min-w-[1102px] divide-y">
                <Table className="divide-y">
                  <TableHeader className="border-b border-gray-100 dark:border-white/5 tele-table-thead">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Cliente</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Descrição</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Forma Pgto</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Valor</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Parcela</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Vencimento</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ações</TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                    {pagination.data.map((x: any) => (
                      <TableRow key={x.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-700 dark:text-gray-200 font-medium">{x.customerName || "—"}</TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.description}</TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.paymentMethodName || "—"}</TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-700 dark:text-gray-200 font-medium">{formattedMoney(x.amount)}</TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.installmentNumber}/{x.totalInstallments}</TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{maskDate(x.dueDate)}</TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">{getStatusBadge(x.status)}</TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">
                          <div className="flex gap-3 items-center">
                            {x.status !== "paid" && x.status !== "cancelled" && (
                              <button
                                title="Baixar título"
                                onClick={() => getObj(x, "pay")}
                                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 transition-colors"
                              >
                                <MdPayment size={18} />
                              </button>
                            )}
                            {permissionUpdate("H", "H1") && x.status !== "paid" && x.status !== "cancelled" && (
                              <IconEdit action="edit" obj={x} getObj={getObj} />
                            )}
                            {permissionDelete("H", "H1") && x.status !== "paid" && x.status !== "cancelled" && (
                              <IconDelete action="delete" obj={x} getObj={getObj} />
                            )}
                            {permissionDelete("H", "H1") && (x.status == "paid" || x.status == "cancelled") && (
                              <IconView action="view" obj={x} getObj={getObj} />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <Pagination
            currentPage={pagination.currentPage}
            totalCount={pagination.totalCount}
            totalData={pagination.data.length}
            totalPages={pagination.totalPages}
            onPageChange={changePage}
          />
          <ModalDelete confirm={destroy} isOpen={isOpen} closeModal={closeModal} title="Excluir Conta a Receber" />
        </>
      ) : (
        <NotData />
      )}
    </>
  );
}
