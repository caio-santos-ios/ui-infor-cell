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
import { useRouter } from "next/navigation";
import ChartOfAccountsModalCreate from "./ChartOfAccountsModalCreate";
import { chartOfAccountIdAtom, chartOfAccountModalAtom } from "@/jotai/financial/chart-of-account.jotai";
import { IconDelete } from "@/components/iconDelete/IconDelete";

export default function ChartOfAccountsTable() {
  const [pagination, setPagination] = useAtom(paginationAtom);
  const [_, setLoading] = useState(true);
  const [chartOfAccount, setChartOfAccount] = useState<any>({});
  const { isOpen, openModal, closeModal } = useModal();
  const [modalCreate, setModalCreate] = useAtom(chartOfAccountModalAtom);
  const [___, setChartOfAccountId] = useAtom(chartOfAccountIdAtom);
  const [groupsDespesaDRE] = useState<any[]>([
    { value: "none", level: 1, label: "Não mostrar no DRE" },    
    { value: "deducoes", level: 1, label: "Deduções" },
    { value: "imp_vendas", level: 2, label: "Impostos sobre vendas" },
    { value: "com_vendas", level: 2, label: "Comissões sobre vendas" },
    { value: "dev_vendas", level: 2, label: "Devolução de vendas" },    
    { value: "custos", level: 1, label: "Custos operacionais" },
    { value: "cpv", level: 2, label: "Custo dos produtos vendidos" },    
    { value: "desp_op", level: 1, label: "Despesas operacionais" },
    { value: "desp_adm", level: 2, label: "Despesas administrativas" },
    { value: "desp_ger", level: 2, label: "Despesas operacionais" },
    { value: "desp_com", level: 2, label: "Despesas comerciais" },    
    { value: "desp_fin", level: 1, label: "Despesas financeiras" },
    { value: "emp_div", level: 2, label: "Empréstimos e dívidas" },
    { value: "jur_mul", level: 2, label: "Juros/multas pagos" },
    { value: "desc_conc", level: 2, label: "Descontos concedidos" },
    { value: "tax_ban", level: 2, label: "Taxas/tarifas bancárias" },    
    { value: "outras", level: 1, label: "Outras despesas" },
    { value: "outras_esp", level: 2, label: "Outras despesas" },
  ]);
  const [groupsReceitaDRE] = useState<any[]>([
    { type: "dre", value: "rec_bruta", level: 1, label: "Receita bruta" },
    { type: "dre", value: "rec_vendas", level: 2, label: "Receitas de vendas" },    
    { type: "dre", value: "rec_fin", level: 1, label: "Receitas financeiras" },
    { type: "dre", value: "rend_fin", level: 2, label: "Rendimentos financeiros" },
    { type: "dre", value: "jur_rec", level: 2, label: "Juros/multas recebidos" },
    { type: "dre", value: "desc_rec", level: 2, label: "Descontos recebidos" },
    { type: "dre", value: "rec_outras", level: 1, label: "Outras receitas" },
    { type: "dre", value: "outras_rec_item", level: 2, label: "Outras receitas" },
  ]);

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

    if (action === "edit") {
      setChartOfAccountId(obj.id);
      setModalCreate(true);
    };
    if (action === "delete") openModal();
  };

  const getTypeBadge = (type: string) => {
    if (type === "receita") return <Badge color="success" size="sm">Recebimento</Badge>;
    if (type === "despesa") return <Badge color="error" size="sm">Pagamento</Badge>;
    if (type === "custo") return <Badge color="warning" size="sm">Custo</Badge>;
    return <Badge size="sm">{type}</Badge>;
  };

  const getDescriptionGroupDRE = (group: string, type: string) => {
    if (type === "despesa") {
      return groupsDespesaDRE.find(g => g.value === group)?.label || group;
    }
    if (type === "receita") {
      return groupsReceitaDRE.find(g => g.value === group)?.label || group;
    }
  }
  
  useEffect(() => {
    getAll(1);
  }, [modalCreate]);

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
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Tipo</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Grupo DRE</TableCell>
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
                            {getTypeBadge(x.type)}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">
                            {getDescriptionGroupDRE(x.groupDRE, x.type)}
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
          title="Excluir Plano de Contas"
        />
      </>
      ) : (
        <NotData />
      )}

      <ChartOfAccountsModalCreate />
    </>
  );
}