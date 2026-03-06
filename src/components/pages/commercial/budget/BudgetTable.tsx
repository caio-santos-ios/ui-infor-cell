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
import { budgetIdAtom, budgetModalAtom, budgetStatusAtom } from "@/jotai/commercial/budget/budget.jotai";
import { IconEdit } from "@/components/iconEdit/IconEdit";
import { IconDelete } from "@/components/iconDelete/IconDelete";
import { ModalDelete } from "@/components/modalDelete/ModalDelete";
import { useModal } from "@/hooks/useModal";
import { ResetBudget, TBudget } from "@/types/commercial/budgets/budget.type";
import { IconView } from "@/components/iconView/IconView";
import { BudgetModal } from "./modal/BudgetModal";
import CustomerModalCreate from "../../master-data/customer/CustomerModalCreate";

export default function BudgetTable() {
    const [_, setLoading] = useAtom(loadingAtom);
    const [pagination, setPagination] = useAtom(paginationAtom);
    const [storeLogged] = useAtom(storeLoggedAtom);
    const { isOpen, openModal, closeModal } = useModal();
    const [budget, setBudget] = useState<TBudget>(ResetBudget);
    const [modalCreate, setModalCreate] = useAtom(budgetModalAtom);
    const [__, setBudgetId] = useAtom(budgetIdAtom);
    const [___, setBudgetStatus] = useAtom(budgetStatusAtom);

    const getAll = async (page: number) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/budgets?deleted=false&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=${page}`, configApi());
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
            await api.delete(`/budgets/${budget.id}`, configApi());
            resolveResponse({ status: 204, message: "Excluído com sucesso" });
            closeModal();
            await getAll(pagination.currentPage);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const getObj = (obj: any, action: string) => {
        setBudget(obj);
        setBudgetId(obj.id);
        setBudgetStatus(obj.status);

        if (action === "edit" || action === "view") {
            setModalCreate(true);
        }

        if (action === "delete") {
            openModal();
        }
    };

    useEffect(() => {
        if (permissionRead("F", "F1")) {
            getAll(1);
        }
    }, [storeLogged, modalCreate]);

    return (
        <>
            <BudgetModal />
            <CustomerModalCreate />

            {pagination.data.length > 0 ? (
                <>
                    <div className="erp-container-table rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 mb-3">
                        <div className="max-w-full overflow-x-auto tele-container-table">
                            <div className="min-w-[1102px] divide-y">
                                <Table className="divide-y">
                                    <TableHeader className="border-b border-gray-100 dark:border-white/5 tele-table-thead">
                                        <TableRow>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Número</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Cliente</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Vendedor</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Quantidade</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Total</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Criação</TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ações</TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {pagination.data.map((x: any) => (
                                            <TableRow key={x.id}>
                                                <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.code}</TableCell>
                                                <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{!x.customerName ? 'Ao Consumidor' : x.customerName}</TableCell>
                                                <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{!x.employeeName ? x.userName : x.employeeName}</TableCell>
                                                <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${x.status === "Convertido" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                                                        {x.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.quantity}</TableCell>
                                                <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{formattedMoney(x.total)}</TableCell>
                                                <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{maskDate(x.createdAt)}</TableCell>
                                                <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">
                                                    <div className="flex gap-3">
                                                        {permissionUpdate("A", "A3") && x.status === "Convertido" && (
                                                            <IconView action="view" obj={x} getObj={getObj} />
                                                        )}
                                                        {permissionUpdate("A", "A3") && x.status === "Em Aberto" && (
                                                            <IconEdit action="edit" obj={x} getObj={getObj} />
                                                        )}
                                                        {permissionDelete("A", "A3") && x.status === "Em Aberto" && (
                                                            <IconDelete action="delete" obj={x} getObj={getObj} />
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
                    <Pagination currentPage={pagination.currentPage} totalCount={pagination.totalCount} totalData={pagination.data.length} totalPages={pagination.totalPages} onPageChange={changePage} />
                    <ModalDelete confirm={destroy} isOpen={isOpen} closeModal={closeModal} title="Excluir Orçamento" />
                </>
            ) : (
                <NotData />
            )}
        </>
    );
}
