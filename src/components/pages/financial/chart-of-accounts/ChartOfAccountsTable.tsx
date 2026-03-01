"use client";
import { useEffect, useState } from "react";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { useAtom } from "jotai";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { NotData } from "@/components/not-data/NotData";
import { ModalDelete } from "@/components/modalDelete/ModalDelete";
import Pagination from "@/components/tables/Pagination";
import { useModal } from "@/hooks/useModal";
import { permissionDelete, permissionUpdate } from "@/utils/permission.util";
import { IconEdit } from "@/components/iconEdit/IconEdit";
import { IconDelete } from "@/components/global/iconDelete";
import { useRouter } from "next/navigation";

export default function ChartOfAccountsTable() {
  const [pagination, setPagination] = useAtom(paginationAtom);
  const [_, setLoading] = useState(true);
  const [chartOfAccount, setChartOfAccount] = useState<any>({});
  const { isOpen, openModal, closeModal } = useModal();
  const router = useRouter();

  const getAll = async (page: number) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/chart-of-accounts?deleted=false&orderBy=dueDate&sort=asc&pageSize=10&pageNumber=${page}`, configApi());
      const result = data.result.data;
      
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

  const destroy = async () => {
    try {
      setLoading(true);
      await api.delete(`/chart-of-accounts/${chartOfAccount.id}`, configApi());
      resolveResponse({ status: 204, message: "Excluído com sucesso" });
      await getAll(pagination.currentPage);
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

  const getObj = (obj: any, action: string) => {
    setChartOfAccount(obj);

    if (action === "edit") router.push(`/financial/chart-of-accounts/${obj.id}`);;
    // if (action === "view") setModalCreate(true);
    // if (action === "pay") setModalPay(true);
    if (action === "delete") openModal();
  };

  const getTypeBadge = (type: string) => {
    if (type === "receita") return <Badge color="success" size="sm">Receita</Badge>;
    if (type === "despesa") return <Badge color="error" size="sm">Despesa</Badge>;
    if (type === "custo") return <Badge color="warning" size="sm">Custo</Badge>;
    return <Badge size="sm">{type}</Badge>;
  };
  
  useEffect(() => {
    getAll(1);
  }, []);

  return (
    // <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/3 sm:px-6">
    //   <div className="max-w-full overflow-x-auto">
    //     <Table>
    //       <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
    //         <TableRow>
    //           <TableCell isHeader className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Código</TableCell>
    //           <TableCell isHeader className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Nome</TableCell>
    //           <TableCell isHeader className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Conta Pai</TableCell>
    //           <TableCell isHeader className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Tipo</TableCell>
    //           <TableCell isHeader className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Nível</TableCell>
    //           <TableCell isHeader className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Exibir DRE</TableCell>
    //           <TableCell isHeader className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Analítica</TableCell>
    //           <TableCell isHeader className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">Ações</TableCell>
    //         </TableRow>
    //       </TableHeader>

    //       <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
    //         {data.map((account) => (
    //           <TableRow key={account.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
    //             <TableCell className="py-3 font-mono text-theme-sm text-gray-800 dark:text-white/90">
    //               {account.code}
    //             </TableCell>
    //             <TableCell className="py-3 text-theme-sm text-gray-800 dark:text-white/90">
    //               {account.name}
    //             </TableCell>
    //             <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
    //               {account.parentName || "—"}
    //             </TableCell>
    //             <TableCell className="py-3">
    //               {getTypeBadge(account.type)}
    //             </TableCell>
    //             <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
    //               Nível {account.level}
    //             </TableCell>
    //             <TableCell className="py-3 text-theme-sm">
    //               {account.showInDre ? (
    //                 <span className="text-green-600 dark:text-green-400">Sim</span>
    //               ) : (
    //                 <span className="text-gray-400">Não</span>
    //               )}
    //             </TableCell>
    //             <TableCell className="py-3 text-theme-sm">
    //               {account.isAnalytical ? (
    //                 <span className="text-blue-600 dark:text-blue-400">Sim</span>
    //               ) : (
    //                 <span className="text-gray-400">Não</span>
    //               )}
    //             </TableCell>
    //             <TableCell className="py-3">
    //               <div className="flex gap-2">
    //                 <button
    //                   onClick={() => window.location.href = `/financial/chart-of-accounts/${account.id}`}
    //                   className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
    //                   title="Editar"
    //                 >
    //                   <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
    //                     <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    //                   </svg>
    //                 </button>
    //                 <button
    //                   onClick={() => handleDelete(account.id)}
    //                   className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
    //                   title="Excluir"
    //                 >
    //                   <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
    //                     <path d="M6 2l2-2h4l2 2m-8 2h12M8 6v8m4-8v8m-7-8h10v12H5V6z" />
    //                   </svg>
    //                 </button>
    //               </div>
    //             </TableCell>
    //           </TableRow>
    //         ))}
    //       </TableBody>
    //     </Table>
    //   </div>
    // </div>
    <>
      {pagination.data.length > 0 ? (
      <>
        <div className="erp-container-table rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 mb-3">
          <div className="max-w-full overflow-x-auto tele-container-table">
            <div className="min-w-[1102px] divide-y">
              <Table className="divide-y">
                <TableHeader className="border-b border-gray-100 dark:border-white/5 tele-table-thead">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Código</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nome</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Conta Pai</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tipo</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nível</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Exibir DRE</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Analítica</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ações</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                    {pagination.data.map((x: any) => {
                      return (
                        <TableRow key={x.id}>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">
                            {x.code}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">
                            {x.name}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">
                            {x.parentName || "—"}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">
                            {getTypeBadge(x.type)}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">
                            Nível {x.level}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">
                            {x.showInDre ? (
                              <span className="text-green-600 dark:text-green-400">Sim</span>
                            ) : (
                              <span className="text-gray-400">Não</span>
                            )}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">
                            {x.isAnalytical ? (
                              <span className="text-blue-600 dark:text-blue-400">Sim</span>
                            ) : (
                              <span className="text-gray-400">Não</span>
                            )}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">
                            <div className="flex gap-3 items-center">
                              {permissionUpdate("H", "H2") && x.status !== "paid" && x.status !== "cancelled" && (
                                <IconEdit action="edit" obj={x} getObj={getObj} />
                              )}
                              {permissionDelete("H", "H2") && x.status !== "paid" && x.status !== "cancelled" && (
                                <IconDelete action="delete" obj={x} getObj={getObj} />
                              )}
                              {/* <button
                                onClick={() => window.location.href = `/financial/chart-of-accounts/${x.id}`}
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Editar"
                              >
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button> */}
                              {/* <button
                                onClick={() => handleDelete(account.id)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                title="Excluir"
                              >
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M6 2l2-2h4l2 2m-8 2h12M8 6v8m4-8v8m-7-8h10v12H5V6z" />
                                </svg>
                              </button> */}
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