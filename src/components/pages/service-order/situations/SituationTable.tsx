"use client";

import Pagination from "@/components/tables/Pagination";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { maskDate } from "@/utils/mask.util";
import { permissionDelete, permissionRead, permissionUpdate } from "@/utils/permission.util";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { IconEdit } from "@/components/iconEdit/IconEdit";
import { IconDelete } from "@/components/iconDelete/IconDelete";
import { useModal } from "@/hooks/useModal";
import { ModalDelete } from "@/components/modalDelete/ModalDelete";
import { NotData } from "@/components/not-data/NotData";
import { ResetServiceOrder, STATUS_LABELS, TServiceOrder } from "@/types/order-service/order-service.type";
import { IconView } from "@/components/iconView/IconView";
import { serviceOrderIdAtom, serviceOrderModalViewAtom } from "@/jotai/serviceOrder/manege.jotai";
import { FaEye } from "react-icons/fa";
import SituationModalCreate from "./SituationModalCreate";
import { situationIdAtom, situationModalAtom } from "@/jotai/serviceOrder/situation.jotai";

export default function SituationTable() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [pagination, setPagination] = useAtom(paginationAtom);
  const { isOpen, openModal, closeModal } = useModal();
  const [selected, setSelected] = useState<TServiceOrder>(ResetServiceOrder);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [__, setModalView] = useAtom(serviceOrderModalViewAtom);
  const [___, setServiceOrderId] = useAtom(serviceOrderIdAtom);
  const [modal, setModal] = useAtom(situationModalAtom);
  const [_____, setSituationId] = useAtom(situationIdAtom);
  const router = useRouter();

  const getAll = async (page: number) => {
    try {
      let strSearch = "deleted=false";
      if(search) {
        strSearch += `&regex$or$code=${search}&regex$or$customerName=${search}&regex$or$device.serialImei`;
      };

      if(statusFilter) {
        strSearch += `&status=${statusFilter}`;
      };

      const { data } = await api.get(`/situations?${strSearch}&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=${page}`, configApi());
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
      await api.delete(`/situations/${selected.id}`, configApi());
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
    setSelected(obj);
    if (action === "edit") {
      setModal(true);
      setSituationId(obj.id);
    };

    if (action === "delete") openModal();
  };

  const changePage = async (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    await getAll(page);
  };

  const modalDetails = (id: string) => {
    console.log(id)
    setModalView(true);
    setServiceOrderId(id);
  };

  useEffect(() => {
    if (permissionRead("A", "A4")) getAll(1);
  }, [search, statusFilter]);

  useEffect(() => {
    setLoading(true);
    if (permissionRead("A", "A4")) getAll(1);
    setLoading(false);
  }, [modal]);

  return (
    <div className="">
      {pagination.data.length > 0 ? (
        <>
          <div className="max-h-[calc(100dvh-30rem)] lg:max-h-[calc(100dvh-24rem)] overflow-y-auto rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 mb-3">
            <div className="max-w-full overflow-x-auto tele-container-table">
              <div className="min-w-[1100px] divide-y">
                <Table className="divide-y">
                  <TableHeader className="border-b border-gray-100 dark:border-white/5 tele-table-thead">
                    <TableRow>
                      {["Nome", "Aparece na abertura?", "Aparece no intermédio?", "Aparece no encerramento?", "Gera Financeiro?", "Filtro no Painel?", "Ações"].map((h) => (
                        <TableCell key={h} isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                    {pagination.data.map((x: any) => {
                      return (
                        <TableRow key={x.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition-colors">
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${x.style.bg} ${x.style.text} ${x.style.border}`}>
                              {x.name}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">{x.start ? "Sim" : "Não"}</TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">{x.quite ? "Sim" : "Não"}</TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">{x.end ? "Sim" : "Não"}</TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">{x.generateFinancial ? "Sim" : "Não"}</TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">{x.appearsOnPanel ? "Sim" : "Não"}</TableCell>
                          
                          <TableCell className="px-5 py-4 sm:px-6 text-start">
                            <div className="flex gap-3">
                              {permissionUpdate("A", "A4") && <IconEdit action="edit" obj={x} getObj={getObj} />}
                              {permissionDelete("A", "A4") && <IconDelete action="delete" obj={x} getObj={getObj} />}
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
          <ModalDelete confirm={destroy} isOpen={isOpen} closeModal={closeModal} title="Excluir Situação" />
        </>
      ) : (
        <NotData h="3rem" />
      )}
      <SituationModalCreate />
    </div>
  );
}
