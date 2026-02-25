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
import ServiceOrderModalSearch from "./modals/ServiceOrderModalSearch";
import ServiceOrderModalView from "./modals/ServiceOrderModalView";
import { serviceOrderIdAtom, serviceOrderModalViewAtom } from "@/jotai/serviceOrder/manege.jotai";
import { FaEye } from "react-icons/fa";
import { TSituation } from "@/types/order-service/situation.type";

export default function ServiceOrderTable() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [pagination, setPagination] = useAtom(paginationAtom);
  const { isOpen, openModal, closeModal } = useModal();
  const [selected, setSelected] = useState<TServiceOrder>(ResetServiceOrder);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [__, setModalView] = useAtom(serviceOrderModalViewAtom);
  const [___, setServiceOrderId] = useAtom(serviceOrderIdAtom);
  const [situations, setSituations] = useState<TSituation[]>([]);
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

      const { data } = await api.get(`/serviceOrders?${strSearch}&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=${page}`, configApi());
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

  const modalDetails = (id: string) => {
    setModalView(true);
    setServiceOrderId(id);
  };

  const getSelectSituations = async () => {
    try {
      const { data } = await api.get(`/situations/select?deleted=false&appearsOnPanel=true&orderBy=sequence&sort=asc`, configApi());
      const result = data.result.data;
      setSituations(result);
    } catch (error) {
      resolveResponse(error);
    }
  };

  useEffect(() => {
    if (permissionRead("A", "A4")) getAll(1);
  }, [search, statusFilter]);

  useEffect(() => {
    setLoading(true);
    getSelectSituations();
    if (permissionRead("A", "A4")) getAll(1);
    setLoading(false);
  }, []);

  return (
    <div className="">
      <div className="grid grid-cols-4 md:grid-cols-4 gap-3 mb-4">
        {
          situations.map((card) => {
          const count = pagination.data.filter((x: any) => x.status === card.id).length;
          return (
            <button
              key={card.id}
              onClick={() => { setStatusFilter(card.id!); getAll(1); }}
              className={`rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 p-2 lg:p-4 text-left transition-colors cursor-pointer`}>
              <p className={`text-xs ${card.style.text} mb-1`}>{card.name}</p>
              <p className={`text-2xl font-bold ${card.style.text}`}>{count}</p>
            </button>
          );
        })}
      </div>

      {pagination.data.length > 0 ? (
        <>
          <div className="max-h-[calc(100dvh-30rem)] lg:max-h-[calc(100dvh-24rem)] overflow-y-auto rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 mb-3">
            <div className="max-w-full overflow-x-auto tele-container-table">
              <div className="min-w-[1100px] divide-y">
                <Table className="divide-y">
                  <TableHeader className="border-b border-gray-100 dark:border-white/5 tele-table-thead">
                    <TableRow>
                      {["Situação", "Nº OS", "Abertura", "Cliente", "Equipamento", "Últ. Atualização", "Ações"].map((h) => (
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
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${x?.situationStyle?.bg} ${x?.situationStyle?.text} ${x?.situationStyle?.border}`}>
                              {x.situationName}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-4 sm:px-6 text-start">
                            <div className="flex items-center gap-2">
                              <span onClick={() => modalDetails(x.id)} className="font-medium text-gray-800 dark:text-white/90 text-sm cursor-pointer">
                                <span className="flex items-center gap-2">
                                  <p>{x.code}</p>
                                  <FaEye className="text-blue-500 hover:text-blue-700" />
                                </span>
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
        <NotData h="3rem" />
      )}
      <ServiceOrderModalSearch />
      <ServiceOrderModalView />
    </div>
  );
}
