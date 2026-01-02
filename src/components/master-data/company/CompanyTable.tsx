"use client";

import Pagination from "@/components/tables/Pagination";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/global/table";
import { NotData } from "@/components/global/notData";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { maskDate } from "@/utils/mask.util";
import { permissionDelete, permissionUpdate } from "@/utils/permission.util";
import { IconEdit } from "@/components/global/iconEdit";
import { IconDelete } from "@/components/global/iconDelete";
import { TCompany } from "@/jotai/masterData/company.type";
import { useRouter } from "next/navigation";

export default function CompanyTable() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
  const [company, setCompany] = useState<TCompany[]>([]);
  const router = useRouter();

  const getAll = async () => {
    try {
      setLoading(true);
      const {data} = await api.get(`/companies?deleted=false&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=${pagination.currentPage}`, configApi());
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

  const getObj = (obj: any, action: string) => {
    setCompany(obj);

    if(action == "edit") {
      router.push(`/master-data/companies/${obj.id}`);
    };
  };

  useEffect(() => {
    getAll();
  }, []);

  return (
    pagination.data.length > 0 ?
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 mb-3">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/5">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Razão Social</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nome Fantasia</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">CNPJ</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Data de Criação</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ações</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                {pagination.data.map((x: TCompany) => (
                  <TableRow key={x.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">{x.corporateName}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">{x.tradeName}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">{x.document}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">{maskDate(x.createdAt)}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex gap-3">       
                        {
                          permissionUpdate("A", "A1") &&
                          <IconEdit action="edit" obj={x} getObj={getObj}/>
                        }   
                        {
                          permissionDelete("A", "A1") &&
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
      <Pagination currentPage={pagination.currentPage} totalCount={pagination.totalCount} totalData={pagination.data.length} totalPages={pagination.totalPages} onPageChange={() => {}} />
    </>
    :
    <NotData />
  );
}