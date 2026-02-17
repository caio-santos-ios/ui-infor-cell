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
import { MdPayment } from "react-icons/md";
import {
    accountPayableIdAtom,
    accountPayableModalAtom,
    accountPayablePayModalAtom,
} from "@/jotai/financial/account-payable/accountPayable.jotai";
import {
    ResetAccountPayable,
    TAccountPayable,
    statusLabelPayable,
} from "@/types/financial/account-payable/account-payable.type";
import AccountPayableModalCreate from "./AccountPayableModalCreate";
import AccountPayableModalPay from "./AccountPayableModalPay";

export default function AccountPayableTable() {
    const [_, setLoading] = useAtom(loadingAtom);
    const [pagination, setPagination] = useAtom(paginationAtom);
    const [storeLogged] = useAtom(storeLoggedAtom);
    const [accountPayableId, setAccountPayableId] = useAtom(accountPayableIdAtom);
    const [modalCreate, setModalCreate] = useAtom(accountPayableModalAtom);
    const [, setModalPay] = useAtom(accountPayablePayModalAtom);
    const { isOpen, openModal, closeModal } = useModal();
    const [accountPayable, setAccountPayable] = useState<TAccountPayable>(ResetAccountPayable);

    // ─── API ──────────────────────────────────────────────────────────────────
    const getAll = async (page: number) => {
        try {
            setLoading(true);
            const { data } = await api.get(
                `/accounts-payable?deleted=false&orderBy=dueDate&sort=asc&pageSize=10&pageNumber=${page}`,
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
        setPagination((prev) => ({ ...prev, currentPage: page }));
        await getAll(page);
    };

    const destroy = async () => {
        try {
            setLoading(true);
            await api.delete(`/accounts-payable/${accountPayable.id}`, configApi());
            resolveResponse({ status: 204, message: "Excluído com sucesso" });
            closeModal();
            setAccountPayableId("");
            setAccountPayable(ResetAccountPayable);
            await getAll(pagination.currentPage);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const getObj = (obj: any, action: string) => {
        setAccountPayable(obj);
        setAccountPayableId(obj.id);

        if (action === "edit") setModalCreate(true);
        if (action === "pay") setModalPay(true);
        if (action === "delete") openModal();
    };

    useEffect(() => {
        if (permissionRead("H", "H2")) {
            getAll(1);
        }
    }, [storeLogged, modalCreate]);

    // ─── render ───────────────────────────────────────────────────────────────
    return (
        <>
            <AccountPayableModalCreate />
            <AccountPayableModalPay />

            {pagination.data.length > 0 ? (
                <>
                    <div className="erp-container-table rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 mb-3">
                        <div className="max-w-full overflow-x-auto tele-container-table">
                            <div className="min-w-[1102px] divide-y">
                                <Table className="divide-y">
                                    <TableHeader className="border-b border-gray-100 dark:border-white/5 tele-table-thead">
                                        <TableRow>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Cód.</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Fornecedor</TableCell>
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
                                        {pagination.data.map((x: any) => {
                                            const badge = statusLabelPayable[x.status] ?? statusLabelPayable["open"];
                                            const canPay = x.status === "open" || x.status === "partial" || x.status === "overdue";

                                            return (
                                                <TableRow key={x.id}>
                                                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">{x.code}</TableCell>
                                                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">{x.supplierName || "—"}</TableCell>
                                                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">{x.description}</TableCell>
                                                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">{x.paymentMethodName || "—"}</TableCell>
                                                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">{formattedMoney(x.amount)}</TableCell>
                                                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">
                                                        {x.installmentNumber}/{x.totalInstallments}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">{maskDate(x.dueDate)}</TableCell>
                                                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                        <span className={`py-1 px-2 text-xs font-semibold rounded-2xl ${badge.color}`}>
                                                            {badge.label}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">
                                                        <div className="flex gap-3 items-center">
                                                            {permissionUpdate("H", "H2") && canPay && (
                                                                <button
                                                                    title="Baixar título"
                                                                    onClick={() => getObj(x, "pay")}
                                                                    className="cursor-pointer text-green-500 hover:text-green-600 transition-colors"
                                                                >
                                                                    <MdPayment size={18} />
                                                                </button>
                                                            )}
                                                            {permissionUpdate("H", "H2") && (
                                                                <IconEdit action="edit" obj={x} getObj={getObj} />
                                                            )}
                                                            {permissionDelete("H", "H2") && (
                                                                <IconDelete action="delete" obj={x} getObj={getObj} />
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
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

                    <ModalDelete
                        confirm={destroy}
                        isOpen={isOpen}
                        closeModal={closeModal}
                        title="Excluir Conta a Pagar"
                    />
                </>
            ) : (
                <NotData />
            )}
        </>
    );
}
