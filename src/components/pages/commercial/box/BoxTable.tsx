"use client";

import Pagination from "@/components/tables/Pagination";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { formattedMoney, maskDate } from "@/utils/mask.util";
import { permissionRead } from "@/utils/permission.util";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { NotData } from "@/components/not-data/NotData";
import { storeLoggedAtom } from "@/jotai/global/store.jotai";
import { salesOrderModalAtom } from "@/jotai/commercial/sales-order/salesOrder.jotai";
import { useModal } from "@/hooks/useModal";
import { ResetSalesOrder, TSalesOrder } from "@/types/commercial/sales-orders/sales-order.type";

export default function BoxTable() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
  const [storeLogged] = useAtom(storeLoggedAtom);
  const [modalCreate] = useAtom(salesOrderModalAtom); 

  const getAll = async (page: number) => {
    try {
      setLoading(true);
      const {data} = await api.get(`/boxes?deleted=false&status=opened&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=${page}`, configApi());
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

  useEffect(() => {
    if(permissionRead("F", "F1")) {
      getAll(1);
    };
  }, [storeLogged, modalCreate]);

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
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Operador</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Valor Abertura</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Valor atual</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Data da abertura</TableCell>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                      {pagination.data.map((x: any) => (
                        <TableRow key={x.id}>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.user}</TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{formattedMoney(x.openingValue)}</TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{formattedMoney(x.value)}</TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{maskDate(x.createdAt)}</TableCell>
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
    </>
  );
}