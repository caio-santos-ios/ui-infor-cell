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

export default function ServiceOrderTable() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [pagination, setPagination] = useAtom(paginationAtom);
  const { isOpen, openModal, closeModal } = useModal();
  const [selected, setSelected] = useState<TServiceOrder>(ResetServiceOrder);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const router = useRouter();

  const getAll = async (page: number) => {
    try {
      setLoading(true);
      // const params = new URLSearchParams({
      //   deleted: "false",
      //   orderBy: "openedAt",
      //   sort: "desc",
      //   pageSize: "10",
      //   pageNumber: String(page),
      // });
      // if (search) params.set("search", search);
      // if (statusFilter) params.set("status", statusFilter);

      const { data } = await api.get(`/serviceOrders?deleted=false&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=${page}`, configApi());
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
      await api.delete(`/serviceOrders/${selected.id}`, configApi());
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
    if (action === "edit" || action === "view") router.push(`/order-services/manages/${obj.id}`);
    if (action === "delete") openModal();
  };

  const changePage = async (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    await getAll(page);
  };

  useEffect(() => {
    if (permissionRead("A", "A4")) getAll(1);
  }, []);

  const statusOptions = [
    { value: "", label: "Todos os status" },
    { value: "open", label: "Aberta" },
    { value: "analysis", label: "Em Análise" },
    { value: "waiting_approval", label: "Aguardando Aprovação" },
    { value: "waiting_part", label: "Aguardando Peça" },
    { value: "in_repair", label: "Em Reparo" },
    { value: "ready", label: "Pronta p/ Retirada" },
    { value: "closed", label: "Encerrada" },
    { value: "cancelled", label: "Cancelada" },
  ];

  return (
    <div className="">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Abertas", status: "open", color: "text-blue-600 dark:text-blue-400" },
          { label: "Em Reparo", status: "in_repair", color: "text-indigo-600 dark:text-indigo-400" },
          { label: "Prontas", status: "ready", color: "text-green-600 dark:text-green-400" },
          { label: "Aguardando Peça", status: "waiting_part", color: "text-purple-600 dark:text-purple-400" },
        ].map((card) => {
          const count = pagination.data.filter((x: any) => x.status === card.status).length;
          return (
            <button
              key={card.status}
              onClick={() => { setStatusFilter(card.status); getAll(1); }}
              className={`rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 p-4 text-left hover:border-brand-300 transition-colors cursor-pointer`}
            >
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
              <p className={`text-2xl font-bold ${card.color}`}>{count}</p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <input
          type="text"
          placeholder="Buscar por Nº OS, cliente, serial, telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && getAll(1)}
          className="input-erp-primary input-erp-default flex-1"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); getAll(1); }}
          className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 text-gray-800 min-w-[200px]"
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value} className="dark:bg-gray-900">
              {o.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => getAll(1)}
          className="h-11 px-5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          Buscar
        </button>
        {(search || statusFilter) && (
          <button
            onClick={() => { setSearch(""); setStatusFilter(""); getAll(1); }}
            className="h-11 px-4 rounded-lg border border-gray-300 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Limpar
          </button>
        )}
      </div>

      {pagination.data.length > 0 ? (
        <>
          <div className="erp-container-table rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 mb-3">
            <div className="max-w-full overflow-x-auto tele-container-table">
              <div className="min-w-[1100px] divide-y">
                <Table className="divide-y">
                  <TableHeader className="border-b border-gray-100 dark:border-white/5 tele-table-thead">
                    <TableRow>
                      {["Nº OS", "Abertura", "Cliente", "Equipamento", "Status", "Últ. Atualização", "Ações"].map((h) => (
                        <TableCell key={h} isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                    {pagination.data.map((x: any) => {
                      const statusInfo = STATUS_LABELS[x.status] ?? { label: x.status, color: "bg-gray-100 text-gray-600" };
                      return (
                        <TableRow key={x.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition-colors">
                          <TableCell className="px-5 py-4 sm:px-6 text-start">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-800 dark:text-white/90 text-sm">
                                {x.code}
                              </span>
                              {x.isWarrantyInternal && (
                                <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                                  Garantia
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">
                            {maskDate(x.openedAt)}
                          </TableCell>
                          {/* <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">
                            {x.store || "—"}
                          </TableCell> */}
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">
                            {x.customerName}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">
                            <div>
                              <span>{x.device?.brandName} {x.device?.modelName}</span>
                              {x.device?.serialImei && (
                                <p className="text-xs text-gray-400 dark:text-gray-500">IMEI: {x.device.serialImei}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400 text-sm">
                            {maskDate(x.updatedAt)}
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start">
                            <div className="flex gap-3">
                              {permissionUpdate("A", "A4") && x.status != 'closed' && <IconEdit action="edit" obj={x} getObj={getObj} />}
                              {permissionDelete("A", "A4") && x.status != 'closed' && <IconDelete action="delete" obj={x} getObj={getObj} />}
                              {permissionDelete("A", "A4") && x.status == 'closed' && <IconView action="view" obj={x} getObj={getObj} />}
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
          <ModalDelete confirm={destroy} isOpen={isOpen} closeModal={closeModal} title="Excluir Ordem de Serviço" />
        </>
      ) : (
        <NotData />
      )}
    </div>
  );
}
