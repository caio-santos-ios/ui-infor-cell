"use client";

import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import DropzoneComponent from "@/components/form/form-elements/DropZone";
import Button from "@/components/ui/button/Button";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { api, uriBase } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { maskPhone } from "@/utils/mask.util";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { ResetUserProfile, TUserProfile } from "@/types/master-data/user/user.type";
import { TSubscription, TPaymentHistory } from "@/types/setting/subscription.type";
import { MdPerson, MdInfo, MdCheckCircle, MdWarning, MdCancel, MdOpenInNew, MdCalendarToday, MdStar, MdDiamond,
} from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAYMENT_STATUS: Record<string, { label: string; cls: string }> = {
    RECEIVED:  { label: "Pago",       cls: "text-success-600 bg-success-50 border-success-200 dark:text-success-400 dark:bg-success-500/10 dark:border-success-500/20" },
    CONFIRMED: { label: "Confirmado", cls: "text-success-600 bg-success-50 border-success-200 dark:text-success-400 dark:bg-success-500/10 dark:border-success-500/20" },
    PENDING:   { label: "Pendente",   cls: "text-warning-600 bg-warning-50 border-warning-200 dark:text-warning-400 dark:bg-warning-500/10 dark:border-warning-500/20" },
    OVERDUE:   { label: "Vencido",    cls: "text-error-600 bg-error-50 border-error-200 dark:text-error-400 dark:bg-error-500/10 dark:border-error-500/20" },
    CANCELLED: { label: "Cancelado",  cls: "text-gray-500 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-700/40 dark:border-gray-600" },
};

const SUB_STATUS: Record<string, { label: string; cls: string }> = {
    ACTIVE:    { label: "Ativo",      cls: "text-success-600 bg-success-50 border-success-200 dark:text-success-400 dark:bg-success-500/10 dark:border-success-500/20" },
    PENDING:   { label: "Pendente",   cls: "text-warning-600 bg-warning-50 border-warning-200 dark:text-warning-400 dark:bg-warning-500/10 dark:border-warning-500/20" },
    OVERDUE:   { label: "Atrasado",   cls: "text-error-600 bg-error-50 border-error-200 dark:text-error-400 dark:bg-error-500/10 dark:border-error-500/20" },
    CANCELLED: { label: "Cancelado",  cls: "text-gray-500 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-700/40 dark:border-gray-600" },
};

const BILLING_LABEL: Record<string, string> = {
    PIX: "PIX", BOLETO: "Boleto bancário",
    CREDIT_CARD: "Cartão de crédito", DEBIT_CARD: "Cartão de débito",
};

const PLAN_GRADIENT: Record<string, string> = {
    Bronze:  "from-amber-600 to-amber-400",
    Prata:   "from-slate-400 to-slate-300",
    Ouro:    "from-yellow-500 to-yellow-300",
    Platina: "from-violet-600 to-violet-400",
};

function fDate(d?: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("pt-BR");
}

function fMoney(v: number) {
    return v?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "—";
}

function Badge({ status, map }: { status: string; map: Record<string, { label: string; cls: string }> }) {
    const s = map[status] ?? { label: status, cls: "text-gray-500 bg-gray-100 border-gray-200" };
    return (
        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border ${s.cls}`}>
        {s.label}
        </span>
    );
}

// ─── ABA: PERFIL ──────────────────────────────────────────────────────────────

function ProfileTab() {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [userLogger, setUserLogger] = useAtom(userLoggerAtom);

    const { register, reset, watch, getValues } = useForm<TUserProfile>({
        defaultValues: ResetUserProfile,
    });

    const getUser = async () => {
        try {
        setIsLoading(true);
        const { data } = await api.get(`/users/logged`, configApi());
        const r = data.result.data;
        reset({
            id: r.id, name: r.name, email: r.email,
            phone: r.phone, whatsapp: r.whatsapp, photo: r.photo, address: r.address,
        });
        } catch (error) { resolveResponse(error); }
        finally { setIsLoading(false); }
    };

    const save = async () => {
        try {
        setIsLoading(true);
        const { data } = await api.put(`/users`, { ...getValues() }, configApi());
        resolveResponse({ status: 200, message: data.result.message });
        } catch (error) { resolveResponse(error); }
        finally { setIsLoading(false); }
    };

    const uploadPhoto = async (files: File[]) => {
        try {
        const form = new FormData();
        form.append("id", watch("id")!);
        form.append("photo", files[0]);
        const { data } = await api.put(`/users/profile-photo`, form, configApi(false));
        const result = data.result.data;
        localStorage.setItem("photo", result.photo);
        setUserLogger({ ...userLogger, photo: result.photo });
        resolveResponse({ status: 200, message: data.result.message });
        } catch (error) { resolveResponse(error); }
    };

    const saveAddress = async () => {
        try {
        setIsLoading(true);
        const addr = { ...getValues("address") };
        if (!addr.id) {
            const { data } = await api.post(`/addresses`, addr, configApi());
            resolveResponse({ status: 201, message: data.result.message });
        } else {
            const { data } = await api.put(`/addresses`, addr, configApi());
            resolveResponse({ status: 200, message: data.result.message });
        }
        } catch (error) { resolveResponse(error); }
        finally { setIsLoading(false); }
    };

    const lookupZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const zip = e.target.value.replace(/\D/g, "");
        if (zip.length !== 8) return;
        setIsLoading(true);
        try {
        const { data } = await axios.get(`https://viacep.com.br/ws/${zip}/json/`);
        reset({
            ...getValues(),
            address: {
            ...getValues("address"),
            city: data.localidade, state: data.estado, street: data.logradouro,
            neighborhood: data.bairro, complement: data.complemento, zipCode: data.cep,
            },
        });
        } finally { setIsLoading(false); }
    };

    useEffect(() => { getUser(); }, []);

  return (
    <>
      {/* Dados pessoais */}
      <ComponentCard title="Dados Pessoais">
        <div className="grid grid-cols-6 gap-2 container-form">
          <div className="col-span-6 xl:col-span-2">
            <Label title="Nome completo" />
            <input placeholder="Nome" {...register("name")} type="text" className="input-erp-primary input-erp-default" />
          </div>
          <div className="col-span-6 xl:col-span-2">
            <Label title="E-mail" />
            <input placeholder="E-mail" {...register("email")} type="email" className="input-erp-primary input-erp-default" />
          </div>
          <div className="col-span-6 xl:col-span-1">
            <Label title="Telefone" />
            <input placeholder="(00) 00000-0000" onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("phone")} type="text" className="input-erp-primary input-erp-default" />
          </div>
          <div className="col-span-6 xl:col-span-1">
            <Label title="WhatsApp" required={false} />
            <input placeholder="(00) 00000-0000" onInput={(e: React.ChangeEvent<HTMLInputElement>) => maskPhone(e)} {...register("whatsapp")} type="text" className="input-erp-primary input-erp-default" />
          </div>

          {/* Foto */}
          <div className="col-span-6 xl:col-span-2">
            <div className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 h-full justify-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-200 dark:border-brand-700 flex items-center justify-center bg-white dark:bg-gray-700">
                {userLogger.photo
                  ? <img src={`${uriBase}/${userLogger.photo}`} alt="foto" className="w-full h-full object-cover" />
                  : <FaUserCircle className="text-5xl text-gray-300 dark:text-gray-600" />
                }
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{userLogger.name}</p>
            </div>
          </div>
          <div className="col-span-6 xl:col-span-4">
            <DropzoneComponent sendFile={uploadPhoto} title="Atualizar foto de perfil" />
          </div>
        </div>
      </ComponentCard>
      <Button onClick={save} type="button" className="w-full xl:w-24 mt-2" size="sm">Salvar</Button>

      {/* Endereço */}
      <ComponentCard title="Endereço" className="mt-3">
        <div className="grid grid-cols-6 gap-2 container-form">
          <div className="col-span-6 xl:col-span-2">
            <Label title="CEP" />
            <input placeholder="00000-000" onInput={lookupZip} {...register("address.zipCode")} type="text" className="input-erp-primary input-erp-default" />
          </div>
          <div className="col-span-6 xl:col-span-1">
            <Label title="Número" />
            <input placeholder="Nº" {...register("address.number")} type="text" className="input-erp-primary input-erp-default" />
          </div>
          <div className="col-span-6 xl:col-span-3">
            <Label title="Rua" />
            <input placeholder="Rua / Avenida" {...register("address.street")} type="text" className="input-erp-primary input-erp-default" />
          </div>
          <div className="col-span-6 xl:col-span-2">
            <Label title="Bairro" />
            <input placeholder="Bairro" {...register("address.neighborhood")} type="text" className="input-erp-primary input-erp-default" />
          </div>
          <div className="col-span-6 xl:col-span-2">
            <Label title="Cidade" />
            <input placeholder="Cidade" {...register("address.city")} type="text" className="input-erp-primary input-erp-default" />
          </div>
          <div className="col-span-6 xl:col-span-1">
            <Label title="Estado" />
            <input placeholder="UF" {...register("address.state")} type="text" className="input-erp-primary input-erp-default" />
          </div>
          <div className="col-span-6 xl:col-span-3">
            <Label title="Complemento" required={false} />
            <input placeholder="Apto, bloco..." {...register("address.complement")} type="text" className="input-erp-primary input-erp-default" />
          </div>
        </div>
      </ComponentCard>
      <Button onClick={saveAddress} type="button" className="w-full xl:w-24 mt-2" size="sm">Salvar endereço</Button>
    </>
  );
}

// ─── ABA: PLANO & COBRANÇAS ───────────────────────────────────────────────────

function SubscriptionTab() {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [subscription, setSubscription] = useState<TSubscription | null>(null);
  const [history, setHistory] = useState<TPaymentHistory[]>([]);

  const load = async () => {
    try {
        setIsLoading(true);
        const [
            subRes, 
            // histRes
        ] = await Promise.all([
            api.get(`/subscriptions/current`, configApi()),
            // api.get(`/subscriptions/payments`, configApi()),
        ]);
        console.log(subRes.data.result.data);
        setSubscription(subRes.data.result?.data ?? null);
        // setHistory(histRes.data.result?.data ?? []);
    } catch (error) { resolveResponse(error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const gradient = PLAN_GRADIENT[subscription?.planType ?? ""] ?? "from-brand-600 to-brand-400";

  return (
    <div className="flex flex-col gap-3">
      {/* Card plano atual */}
      <div className={`p-px rounded-2xl bg-gradient-to-r ${gradient}`}>
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-5">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} shrink-0`}>
                <MdDiamond className="text-white text-2xl" />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Plano atual</p>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {subscription?.planType ?? "Sem plano ativo"}
                </h3>
                {subscription && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {fMoney(subscription.value)}/mês · {BILLING_LABEL[subscription.billingType] ?? subscription.billingType}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 xl:items-end">
              {subscription && <Badge status={subscription.status} map={SUB_STATUS} />}
              {subscription?.nextDueDate && (
                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                  <MdCalendarToday className="text-sm" />
                  Próx. vencimento: <strong className="text-gray-600 dark:text-gray-300 ml-1">{fDate(subscription.nextDueDate)}</strong>
                </p>
              )}
              {subscription?.startDate && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Início: {fDate(subscription.startDate)}
                </p>
              )}
              {subscription?.paymentUrl && (
                <a href={subscription.paymentUrl} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline">
                  <MdOpenInNew className="text-sm" /> Acessar fatura pendente
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sem assinatura */}
      {!subscription && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-10 gap-3">
          <MdWarning className="text-4xl text-warning-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma assinatura ativa encontrada.</p>
          <a href="/plans" className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">
            Assinar um plano →
          </a>
        </div>
      )}

      {/* Histórico */}
      {history.length > 0 && (
        <ComponentCard title={`Histórico de Cobranças (${history.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left">
                  <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">Vencimento</th>
                  <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">Pagamento</th>
                  <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400">Forma</th>
                  <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">Valor</th>
                  <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 text-center">Status</th>
                  <th className="py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 text-center">Fatura</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                    <td className="py-3 px-3 font-mono text-xs text-gray-600 dark:text-gray-300">{fDate(h.dueDate)}</td>
                    <td className="py-3 px-3 font-mono text-xs text-gray-400 dark:text-gray-500">{h.paymentDate ? fDate(h.paymentDate) : "—"}</td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{BILLING_LABEL[h.billingType] ?? h.billingType}</td>
                    <td className="py-3 px-3 text-right font-semibold text-gray-800 dark:text-white">{fMoney(h.value)}</td>
                    <td className="py-3 px-3 text-center"><Badge status={h.status} map={PAYMENT_STATUS} /></td>
                    <td className="py-3 px-3 text-center">
                      {(h.invoiceUrl || h.bankSlipUrl)
                        ? <a href={h.invoiceUrl || h.bankSlipUrl} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline">
                            <MdOpenInNew className="text-sm" /> Ver
                          </a>
                        : <span className="text-gray-300 dark:text-gray-600">—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}

// ─── ABA: INFORMAÇÕES DA INSTALAÇÃO ───────────────────────────────────────────

function InstallationTab() {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [info, setInfo] = useState<any>(null);

  const load = async () => {
    try {
      setIsLoading(true);
      const typeUser = localStorage.getItem("typeUser") ?? "";
      const uri = ["technical", "seller"].includes(typeUser) ? "employees" : "users";
      const { data } = await api.get(`/${uri}/logged`, configApi());
      setInfo(data.result.data);
    } catch (error) { resolveResponse(error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-800 dark:text-white text-right max-w-[60%] truncate">{value || "—"}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-6 gap-3">
      {/* Dados da conta */}
      <div className="col-span-6 xl:col-span-3">
        <ComponentCard title="Dados da Conta">
          <Row label="Nome"              value={info?.name} />
          <Row label="E-mail"            value={info?.email} />
          <Row label="Empresa"           value={info?.nameCompany} />
          <Row label="Loja ativa"        value={info?.nameStore} />
          <Row label="Empresas"          value={`${info?.companies?.length ?? 0} vinculada(s)`} />
          <Row label="Lojas"             value={`${info?.stores?.length ?? 0} vinculada(s)`} />
          <Row label="Membro desde"      value={fDate(info?.createdAt)} />
        </ComponentCard>
      </div>

      {/* Plano & sistema */}
      <div className="col-span-6 xl:col-span-3">
        <ComponentCard title="Plano & Sistema">
          <Row label="Versão"            value="Telemovvi ERP v1.0" />
          <Row label="Plano contratado"  value={info?.plan ?? "—"} />
          <div className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">Assinatura</span>
            <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${info?.subscriberPlan ? "text-success-600 dark:text-success-400" : "text-error-500 dark:text-error-400"}`}>
              {info?.subscriberPlan
                ? <><MdCheckCircle /> Ativa</>
                : <><MdCancel /> Inativa</>
              }
            </span>
          </div>
          <Row label="Tipo de usuário"   value={info?.admin ? "Administrador" : "Usuário padrão"} />
        </ComponentCard>
      </div>

      {/* Módulos liberados */}
      {info?.modules?.length > 0 && (
        <div className="col-span-6">
          <ComponentCard title={`Módulos Liberados (${info.modules.length})`}>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
              {info.modules.map((m: any, i: number) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/2 px-3 py-2.5">
                  <MdCheckCircle className="text-success-500 shrink-0 text-base" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                    {m.description ?? m.code}
                  </span>
                </div>
              ))}
            </div>
          </ComponentCard>
        </div>
      )}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

const TABS = [
  { key: "profile",      label: "Meu Perfil",       icon: <MdPerson /> },
  { key: "subscription", label: "Plano & Cobranças", icon: <MdStar /> },
  { key: "info",         label: "Instalação",        icon: <MdInfo /> },
];

export default function AccountPage() {
  const [tab, setTab] = useState("profile");

  return (
    <>
      {/* Tabs — mesmo padrão de StoreForm */}
      <div className="flex items-center font-medium gap-2 rounded-lg transition px-2 py-2 text-sm border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 mb-3 text-gray-700 dark:text-gray-400">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              tab === t.key ? "bg-brand-500 text-white" : ""
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-2">
        {tab === "profile"      && <ProfileTab />}
        {tab === "subscription" && <SubscriptionTab />}
        {tab === "info"         && <InstallationTab />}
      </div>
    </>
  );
}