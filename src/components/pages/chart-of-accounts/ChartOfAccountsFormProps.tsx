"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { TChartOfAccounts } from "@/types/financial/chartofaccounts.type";

interface ChartOfAccountsFormProps {
  id?: string;
}

export default function ChartOfAccountsForm({ id }: ChartOfAccountsFormProps) {
  const router = useRouter();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [parentAccounts, setParentAccounts] = useState<TChartOfAccounts[]>([]);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    parentId: "",
    type: "despesa" as "receita" | "despesa" | "custo",
    dreCategory: "",
    showInDre: true,
    description: "",
    level: 1,
    isAnalytical: false,
  });

  useEffect(() => {
    loadParentAccounts();
    if (isEditing) {
      loadAccount();
    }
  }, [id]);

  const loadParentAccounts = () => {
    api
      .get("/chart-of-accounts?pageSize=1000", configApi())
      .then((res) => {
        setParentAccounts(res.data?.result?.data?.data ?? []);
      })
      .catch(() => setParentAccounts([]));
  };

  const loadAccount = () => {
    setLoadingData(true);
    api
      .get(`/chart-of-accounts/${id}`, configApi())
      .then((res) => {
        const data = res.data?.result?.data;
        if (data) {
          setFormData({
            code: data.code || "",
            name: data.name || "",
            parentId: data.parentId || "",
            type: data.type || "despesa",
            dreCategory: data.dreCategory || "",
            showInDre: data.showInDre ?? true,
            description: data.description || "",
            level: data.level || 1,
            isAnalytical: data.isAnalytical ?? false,
          });
        }
      })
      .catch((error) => {
        resolveResponse(error);
        router.push("/financial/chart-of-accounts");
      })
      .finally(() => setLoadingData(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name || !formData.type) {
      resolveResponse({
        status: 400,
        response: { data: { result: { message: "Preencha todos os campos obrigatórios" } } }
      });
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      plan: localStorage.getItem("plan") || "",
      company: localStorage.getItem("company") || "",
      store: localStorage.getItem("store") || "",
    };

    try {
      if (isEditing) {
        await api.put(`/chart-of-accounts/${id}`, payload, configApi());
      } else {
        await api.post("/chart-of-accounts", payload, configApi());
      }
      
      resolveResponse({
        status: 200,
        message: isEditing ? "Conta atualizada com sucesso" : "Conta criada com sucesso"
      });

      router.push("/financial/chart-of-accounts");
    } catch (error: any) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loadingData) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Código */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Código <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleChange("code", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400"
              placeholder="Ex: 3.1.1"
              required
            />
          </div>

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400"
              placeholder="Ex: Vendas de Produtos"
              required
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400"
              required
            >
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
              <option value="custo">Custo</option>
            </select>
          </div>

          {/* Conta Pai */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Conta Pai (opcional)
            </label>
            <select
              value={formData.parentId}
              onChange={(e) => handleChange("parentId", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400"
            >
              <option value="">Nenhuma (Conta Raiz)</option>
              {parentAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.code} - {account.name}
                </option>
              ))}
            </select>
          </div>

          {/* Categoria DRE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoria DRE
            </label>
            <select
              value={formData.dreCategory}
              onChange={(e) => handleChange("dreCategory", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400"
            >
              <option value="">Nenhuma</option>
              <option value="receita_bruta">Receita Bruta</option>
              <option value="deducoes">Deduções e Impostos</option>
              <option value="cmv">CMV - Custo da Mercadoria Vendida</option>
              <option value="despesas_administrativas">Despesas Administrativas</option>
              <option value="despesas_comerciais">Despesas Comerciais</option>
              <option value="despesas_financeiras">Despesas Financeiras</option>
              <option value="impostos">Impostos (IRPJ/CSLL)</option>
            </select>
          </div>

          {/* Nível */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nível
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.level}
              onChange={(e) => handleChange("level", parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>

        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400"
            placeholder="Descrição detalhada da conta (opcional)"
          />
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showInDre"
              checked={formData.showInDre}
              onChange={(e) => handleChange("showInDre", e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="showInDre" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Exibir no DRE
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAnalytical"
              checked={formData.isAnalytical}
              onChange={(e) => handleChange("isAnalytical", e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isAnalytical" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Conta Analítica (aceita lançamentos)
            </label>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={() => router.push("/financial/chart-of-accounts")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {loading ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
          </button>
        </div>

      </form>
    </div>
  );
}