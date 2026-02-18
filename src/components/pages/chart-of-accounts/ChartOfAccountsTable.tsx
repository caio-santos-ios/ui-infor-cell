"use client";
import { useEffect, useState } from "react";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { TChartOfAccounts } from "@/types/financial/chartofaccounts.type";
import { useAtom } from "jotai";
import { paginationAtom } from "@/jotai/global/pagination.jotai";

export default function ChartOfAccountsTable() {
    const [pagination, setPagination] = useAtom(paginationAtom);
    const [data, setData] = useState<TChartOfAccounts[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [count, setCount] = useState(0);

    useEffect(() => {
        loadData();
    }, [page]);

    const loadData = () => {
        // setLoading(true);
        // api
        // .get(`/chart-of-accounts?pageNumber=${page}&pageSize=${pageSize}`, configApi())
        // .then((res) => {
        //     setData(res.data?.result?.data?.data ?? []);
        //     setCount(res.data?.result?.data?.count ?? 0);
        // })
        // .catch(() => setData([]))
        // .finally(() => setLoading(false));
    };

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

  const handleDelete = (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta conta?")) return;

    api
      .delete(`/chart-of-accounts/${id}`, configApi())
      .then(() => {
        loadData();
      })
      .catch((error) => {
        alert("Erro ao excluir conta");
      });
  };

  const getTypeBadge = (type: string) => {
    if (type === "receita") return <Badge color="success" size="sm">Receita</Badge>;
    if (type === "despesa") return <Badge color="error" size="sm">Despesa</Badge>;
    if (type === "custo") return <Badge color="warning" size="sm">Custo</Badge>;
    return <Badge size="sm">{type}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-3 py-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse dark:bg-gray-800" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-500 dark:text-gray-400">
          Nenhuma conta cadastrada. Clique em "Adicionar Conta" para criar.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                Código
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                Nome
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                Conta Pai
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                Tipo
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                Nível
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                Exibir DRE
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                Analítica
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                Ações
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.map((account) => (
              <TableRow key={account.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                <TableCell className="py-3 font-mono text-theme-sm text-gray-800 dark:text-white/90">
                  {account.code}
                </TableCell>
                <TableCell className="py-3 text-theme-sm text-gray-800 dark:text-white/90">
                  {account.name}
                </TableCell>
                <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                  {account.parentName || "—"}
                </TableCell>
                <TableCell className="py-3">
                  {getTypeBadge(account.type)}
                </TableCell>
                <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                  Nível {account.level}
                </TableCell>
                <TableCell className="py-3 text-theme-sm">
                  {account.showInDre ? (
                    <span className="text-green-600 dark:text-green-400">Sim</span>
                  ) : (
                    <span className="text-gray-400">Não</span>
                  )}
                </TableCell>
                <TableCell className="py-3 text-theme-sm">
                  {account.isAnalytical ? (
                    <span className="text-blue-600 dark:text-blue-400">Sim</span>
                  ) : (
                    <span className="text-gray-400">Não</span>
                  )}
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.location.href = `/financial/chart-of-accounts/${account.id}`}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Editar"
                    >
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      title="Excluir"
                    >
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2l2-2h4l2 2m-8 2h12M8 6v8m4-8v8m-7-8h10v12H5V6z" />
                      </svg>
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {count > pageSize && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Exibindo {((page - 1) * pageSize) + 1} a {Math.min(page * pageSize, count)} de {count} registros
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * pageSize >= count}
              className="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-700 disabled:opacity-50"
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}