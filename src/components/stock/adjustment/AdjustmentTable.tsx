"use client";

import Pagination from "@/components/tables/Pagination";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { maskDate } from "@/utils/mask.util";
import { permissionDelete, permissionRead, permissionUpdate } from "@/utils/permission.util";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { NotData } from "@/components/not-data/NotData";
import { storeLoggedAtom } from "@/jotai/global/store.jotai";
import { AdjustmentModal } from "./AdjustmentModal";
import { IconEdit } from "@/components/iconEdit/IconEdit";
import { IconDelete } from "@/components/iconDelete/IconDelete";
import { adjustmentIdAtom, adjustmentModalAtom } from "@/jotai/stock/adjustment";

export default function AdjustmentTable() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
  const [storeLogged] = useAtom(storeLoggedAtom);
  const [__, setAdjuntmentId] = useAtom(adjustmentIdAtom);
  const [modal, setModal] = useAtom(adjustmentModalAtom);
  
  const getAll = async (page: number) => {
    try {
      setLoading(true);
      const {data} = await api.get(`/adjustments?deleted=false&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=${page}`, configApi());
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

  const getObj = (obj: any, action: string) => {
    setAdjuntmentId(obj.id);

    if(action == "edit") {
      setModal(true);
    };

    if(action == "delete") {
      // openModal();
    };
  };

  const changePage = async (page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));

    await getAll(page);
  };

  useEffect(() => {
    if(permissionRead("F", "F1")) {
      getAll(1);
    };
  }, [storeLogged, modal]);

  return (
    <>
      {
        pagination.data.length > 0 ?
        <>
          <div className="erp-container-table rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 mb-3">
            <div className="max-w-full overflow-x-auto tele-container-table">
              <div className="min-w-[1102px] divide-y">
                <Table className="divide-y">
                  <TableHeader className="border-b border-gray-100 dark:border-white/5 tele-table-thead">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Produto</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Movimentação</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Quantidade</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Responsável</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Data do Ajuste</TableCell>
                      {/* <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ações</TableCell> */}
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                    {pagination.data.map((x: any) => (
                      <TableRow key={x.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.productName}</TableCell>
                        <TableCell className={`"px-5 py-4 sm:px-6 text-start`}>
                          <span className={`py-1 px-2 font-bold rounded-2xl ${x.type == 'Saída' ? 'text-red-800 bg-red-200' : 'text-green-800 bg-green-200'}`}>
                          {x.type}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.quantity}</TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.user}</TableCell>
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{maskDate(x.createdAt)}</TableCell>
                        {/* <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">
                          <div className="flex gap-3">       
                            {
                              permissionUpdate("G", "G1") &&
                              <IconEdit action="edit" obj={x} getObj={getObj}/>
                            }   
                            {
                              permissionDelete("G", "G1") &&
                              <IconDelete action="delete" obj={x} getObj={getObj}/>                                                   
                            }                                          
                          </div>
                        </TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <Pagination currentPage={pagination.currentPage} totalCount={pagination.totalCount} totalData={pagination.data.length} totalPages={pagination.totalPages} onPageChange={changePage} />        
        </>
        :
        <NotData />
      }
      <AdjustmentModal />
    </>
  );
}