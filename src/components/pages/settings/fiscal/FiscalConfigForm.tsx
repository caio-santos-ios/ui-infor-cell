"use client";

import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { ResetFiscalConfig, TFiscalConfig } from "@/types/fiscal-config/fiscal-config.type";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { MdOutlineUploadFile, MdCheckCircle, MdLock, MdWarning } from "react-icons/md";

export default function FiscalConfigForm({ storeId }: { storeId: string }) {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [certFileName, setCertFileName] = useState<string>("");
    const [certLoaded, setCertLoaded] = useState<boolean>(false);
    const [certExpiration, setCertExpiration] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, reset, setValue, getValues } = useForm<TFiscalConfig>({
        defaultValues: ResetFiscalConfig,
    });

    const getConfig = async () => {
        try {
        setIsLoading(true);
        const { data } = await api.get(`/fiscal/config/${storeId}`, configApi());
        const result = data.result.data;
        if (result) {
            reset(result);
            if (result.certificateBase64) {
            setCertLoaded(true);
            setCertExpiration(result.certificateExpiration ?? "");
            }
        }
        } catch (error) {
        resolveResponse(error);
        } finally {
        setIsLoading(false);
        }
    };

    const save = async () => {
        try {
        setIsLoading(true);
        const body = { ...getValues(), store: storeId };
        const { data } = await api.post(`/fiscal/config`, body, configApi());
        resolveResponse({ status: 200, message: data.result.message });
        } catch (error) {
        resolveResponse(error);
        } finally {
        setIsLoading(false);
        }
    };

    // Lê o .pfx e converte para Base64
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith(".pfx") && !file.name.endsWith(".p12")) {
            resolveResponse({ status: 422, message: "Selecione um arquivo .pfx ou .p12 válido." });
            return;
        }

        setCertFileName(file.name);

        const reader = new FileReader();
            reader.onload = () => {
            const base64 = (reader.result as string).split(",")[1];
            setValue("certificateBase64", base64);
            setCertLoaded(true);
        };
        reader.readAsDataURL(file);
    };

    const removeCert = () => {
        setValue("certificateBase64", "");
        setValue("certificatePassword", "");
        setCertFileName("");
        setCertLoaded(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    useEffect(() => {
        getConfig();
    }, []);

    // Alerta de vencimento
    const certDaysLeft = () => {
        if (!certExpiration) return null;
        const diff = Math.ceil((new Date(certExpiration).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const days = certDaysLeft();

    return (
        <div className="max-h-[calc(100dvh-10rem)] overflow-y-auto">
            <ComponentCard title="Ambiente e Séries">
                <div className="grid grid-cols-6 gap-2 container-form">

                <div className="col-span-6 xl:col-span-2">
                    <Label title="Ambiente" />
                    <select {...register("environment")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                    <option value="homologacao">Homologação (testes)</option>
                    <option value="producao">Produção</option>
                    </select>
                </div>

                <div className="col-span-6 xl:col-span-2">
                    <Label title="Série NF-e (55)" />
                    <input type="number" placeholder="1" {...register("seriesNfe")} className="input-erp-primary input-erp-default no-spinner" />
                </div>

                <div className="col-span-6 xl:col-span-2">
                    <Label title="Série NFC-e (65)" />
                    <input type="number" placeholder="1" {...register("seriesNfce")} className="input-erp-primary input-erp-default no-spinner" />
                </div>

                <div className="col-span-6 xl:col-span-2">
                    <Label title="Regime Tributário" />
                    <select {...register("taxRegime")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                    <option value="1">Simples Nacional</option>
                    <option value="2">Simples Nacional — Excesso</option>
                    <option value="3">Regime Normal</option>
                    </select>
                </div>

                <div className="col-span-6 xl:col-span-2">
                    <Label title="CFOP dentro do estado" />
                    <input placeholder="5102" {...register("defaultCfopInState")} type="text" className="input-erp-primary input-erp-default" />
                </div>

                <div className="col-span-6 xl:col-span-2">
                    <Label title="CFOP fora do estado" />
                    <input placeholder="6102" {...register("defaultCfopOutState")} type="text" className="input-erp-primary input-erp-default" />
                </div>

                <div className="col-span-6 xl:col-span-2">
                    <Label title="CFOP serviço" />
                    <input placeholder="5933" {...register("defaultCfopService")} type="text" className="input-erp-primary input-erp-default" />
                </div>

                <div className="col-span-6 xl:col-span-2">
                    <Label title="CSC (NFC-e)" required={false} />
                    <input placeholder="Código CSC" {...register("csc")} type="text" className="input-erp-primary input-erp-default" />
                </div>

                <div className="col-span-6 xl:col-span-2">
                    <Label title="ID do CSC" required={false} />
                    <input placeholder="ID CSC" {...register("cscId")} type="text" className="input-erp-primary input-erp-default" />
                </div>
                </div>
            </ComponentCard>

            <ComponentCard title="Endereço do Emitente" className="mt-3">
                <div className="grid grid-cols-6 gap-2 container-form">
                <div className="col-span-6 xl:col-span-3">
                    <Label title="Logradouro" />
                    <input placeholder="Rua, Avenida..." {...register("street")} type="text" className="input-erp-primary input-erp-default" />
                </div>

                <div className="col-span-6 xl:col-span-1">
                    <Label title="Número" />
                    <input placeholder="Nº" {...register("addressNumber")} type="text" className="input-erp-primary input-erp-default" />
                </div>

                <div className="col-span-6 xl:col-span-2">
                    <Label title="Bairro" />
                    <input placeholder="Bairro" {...register("district")} type="text" className="input-erp-primary input-erp-default" />
                </div>

                <div className="col-span-6 xl:col-span-2">
                    <Label title="Cidade" />
                    <input placeholder="Cidade" {...register("city")} type="text" className="input-erp-primary input-erp-default" />
                </div>

                <div className="col-span-6 xl:col-span-1">
                    <Label title="Cód. IBGE" />
                    <input placeholder="3550308" {...register("cityCode")} type="text" className="input-erp-primary input-erp-default" />
                </div>

                <div className="col-span-6 xl:col-span-1">
                    <Label title="UF" />
                    <select {...register("state")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                    {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                    ))}
                    </select>
                </div>

                <div className="col-span-6 xl:col-span-2">
                    <Label title="CEP" />
                    <input placeholder="00000-000" {...register("zipCode")} type="text" className="input-erp-primary input-erp-default" />
                </div>
                </div>
            </ComponentCard>

            <ComponentCard title="Certificado Digital A1" className="mt-3">
                <div className="grid grid-cols-6 gap-2">

                {/* Alerta de vencimento */}
                {days !== null && days <= 30 && (
                    <div className={`col-span-6 flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${days <= 0 ? "bg-error-50 border border-error-200 text-error-700 dark:bg-error-500/10 dark:border-error-500/30 dark:text-error-400" : "bg-warning-50 border border-warning-200 text-warning-700 dark:bg-warning-500/10 dark:border-warning-500/30 dark:text-warning-400"}`}>
                    <MdWarning className="mt-0.5 shrink-0 text-lg" />
                    <span>
                        {days <= 0
                        ? "Certificado digital vencido! Faça o upload de um novo para continuar emitindo notas."
                        : `Seu certificado vence em ${days} dia${days > 1 ? "s" : ""}. Renove em breve para não interromper a emissão.`}
                    </span>
                    </div>
                )}

                {/* Drop zone do certificado */}
                <div className="col-span-6 xl:col-span-3">
                    <Label title="Arquivo do certificado (.pfx / .p12)" />

                    {!certLoaded ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-2 cursor-pointer rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-brand-400 hover:bg-brand-50/30 dark:hover:border-brand-500 dark:hover:bg-brand-500/5 transition-all px-6 py-8"
                    >
                        <MdOutlineUploadFile className="text-4xl text-gray-400 dark:text-gray-500" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Clique para selecionar o arquivo</span>
                        <span className="text-xs text-gray-400 dark:text-gray-600">.pfx ou .p12</span>
                        <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pfx,.p12"
                        className="hidden"
                        onChange={handleFileChange}
                        />
                    </div>
                    ) : (
                    <div className="flex items-center gap-3 rounded-xl border border-success-200 bg-success-50 dark:border-success-500/30 dark:bg-success-500/10 px-4 py-4">
                        <MdCheckCircle className="text-2xl text-success-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-success-700 dark:text-success-400 truncate">
                            {certFileName || "Certificado carregado"}
                        </p>
                        {certExpiration && (
                            <p className="text-xs text-success-600/70 dark:text-success-400/60 mt-0.5">
                            Válido até {new Date(certExpiration).toLocaleDateString("pt-BR")}
                            </p>
                        )}
                        </div>
                        <button
                        type="button"
                        onClick={removeCert}
                        className="text-xs text-error-500 hover:underline shrink-0"
                        >
                        Remover
                        </button>
                    </div>
                    )}
                </div>

                {/* Senha do certificado */}
                <div className="col-span-6 xl:col-span-3">
                    <Label title="Senha do certificado" />
                    <div className="relative">
                    {/* <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" /> */}
                    <input
                        placeholder="Senha do .pfx"
                        {...register("certificatePassword")}
                        type="password"
                        className="input-erp-primary input-erp-default pl-9"
                    />
                    </div>
                    <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-600">
                    A senha é armazenada de forma criptografada e nunca é exibida após salva.
                    </p>
                </div>
                </div>
            </ComponentCard>

            <Button onClick={save} type="button" className="w-full xl:w-24 mt-3" size="sm">
                Salvar
            </Button>
        </div>
    );
}