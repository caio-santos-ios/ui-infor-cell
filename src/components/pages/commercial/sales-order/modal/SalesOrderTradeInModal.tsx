"use client";

import Autocomplete from "@/components/form/Autocomplete";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import ModalV2 from "@/components/ui/modalV2";
import { salesOrderItemIdAtom } from "@/jotai/commercial/sales-order/salesOrderItem.jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { formattedMoney } from "@/utils/mask.util";
import { atom, useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "react-toastify";
import { MdPhoneIphone } from "react-icons/md";

// ─── Atoms públicos ───────────────────────────────────────────────────────────
export const tradeInModalAtom = atom<boolean>(false);
// SalesOrderModalItems observa esse atom para recarregar a lista após a troca
export const tradeInRefreshAtom = atom<number>(0);

// ─── Tipos ───────────────────────────────────────────────────────────────────
type TTradeIn = { tradeInValue: number };
const ResetTradeIn: TTradeIn = { tradeInValue: 0 };

// ─── Componente ──────────────────────────────────────────────────────────────
export const SalesOrderTradeInModal = () => {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [modal, setModal] = useAtom(tradeInModalAtom);
    const [salesOrderItemId] = useAtom(salesOrderItemIdAtom);
    const [__, setRefresh] = useAtom(tradeInRefreshAtom);

    const [currentItem, setCurrentItem] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [mode, setMode] = useState<"search" | "manual">("search");
    const [manualDeviceName, setManualDeviceName] = useState("");
    const [newTotal, setNewTotal] = useState(0);

    const { control, watch, reset } = useForm<TTradeIn>({ defaultValues: ResetTradeIn });
    const watchedTradeInValue = watch("tradeInValue") ?? 0;

    // ── Busca o item do pedido pelo id — usa a lista de GET ?salesOrderId
    // pois o GET /:id aggregate retorna apenas campos básicos sem productName
    const getItem = async () => {
        if (!salesOrderItemId) return;
        try {
            // Busca via GetAll filtrando pelo id do item — já traz productName via lookup
            const { data } = await api.get(
                `/sales-orders-items?deleted=false&id=${salesOrderItemId}&pageSize=1&pageNumber=1`,
                configApi()
            );
            const items = data.result.data;
            if (items && items.length > 0) {
                setCurrentItem(items[0]);
            } else {
                // fallback: busca pelo GetById
                const res = await api.get(`/sales-orders-items/${salesOrderItemId}`, configApi());
                setCurrentItem(res.data.result.data);
            }
        } catch (error) {
            resolveResponse(error);
        }
    };

    const searchProducts = async (value: string) => {
        if (!value) return setProducts([]);
        try {
            const { data } = await api.get(
                `/products/autocomplete?deleted=false&orderBy=name&sort=desc&pageSize=10&pageNumber=1&regex$or$name=${value}&regex$or$code=${value}`,
                configApi()
            );
            const list = data.result.data.map((x: any) => ({
                ...x,
                isOutOfStock: x.stock.filter((s: any) => s.quantity > 0).length === 0,
            }));
            setProducts(list);
        } catch (error) {
            resolveResponse(error);
        }
    };

    // Preview em tempo real
    useEffect(() => {
        if (!currentItem) return;
        const calculated = parseFloat(currentItem.total) - watchedTradeInValue;
        setNewTotal(calculated < 0 ? 0 : calculated);
    }, [watchedTradeInValue, currentItem]);

    const confirm = async () => {
        if (!currentItem) return;

        const deviceName =
            mode === "search"
                ? selectedProduct?.productName ?? ""
                : manualDeviceName.trim();

        if (!deviceName) {
            toast.warn("Informe o aparelho dado como entrada.", { theme: "colored" });
            return;
        }

        if (watchedTradeInValue <= 0) {
            toast.warn("O valor de entrada deve ser maior que zero.", { theme: "colored" });
            return;
        }

        const originalTotal = parseFloat(currentItem.total);
        if (watchedTradeInValue > originalTotal) {
            toast.warn("O valor de entrada não pode ser maior que o total do item.", { theme: "colored" });
            return;
        }

        try {
            setIsLoading(true);

            const newDiscountValue = parseFloat(currentItem.discountValue ?? 0) + watchedTradeInValue;
            const calculatedTotal = originalTotal - watchedTradeInValue;

            const body = {
                ...currentItem,
                id: currentItem.id,
                salesOrderId: currentItem.salesOrderId,
                productId: currentItem.productId,
                variationId: currentItem.variationId ?? "",
                codeVariation: currentItem.codeVariation ?? "",
                total: calculatedTotal < 0 ? 0 : calculatedTotal,
                subTotal: parseFloat(currentItem.subTotal),
                value: parseFloat(currentItem.value),
                quantity: parseFloat(currentItem.quantity),
                discountValue: newDiscountValue,
                discountType: "money",
                serial: currentItem.serial ?? "",
                stockId: currentItem.stockId ?? "",
            };

            await api.put(`/sales-orders-items`, body, configApi());
            resolveResponse({
                status: 201,
                message: `"${deviceName}" aplicado. Desconto de ${formattedMoney(watchedTradeInValue)} no item.`,
            });

            // Dispara refresh no SalesOrderModalItems
            setRefresh((n) => n + 1);
            close();
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const close = () => {
        reset(ResetTradeIn);
        setCurrentItem(null);
        setSelectedProduct(null);
        setProducts([]);
        setManualDeviceName("");
        setMode("search");
        setNewTotal(0);
        setModal(false);
    };

    useEffect(() => {
        if (modal && salesOrderItemId) getItem();
    }, [modal]);

    const resolvedDeviceName =
        mode === "search" ? selectedProduct?.productName ?? "" : manualDeviceName;

    return (
        <ModalV2 isOpen={modal} onClose={close} size="md" title="Entrada de Aparelho">
            <div className="p-6 flex flex-col gap-5">

                {/* Banner */}
                <div className="flex items-center gap-3 rounded-lg bg-brand-50 dark:bg-brand-900/20 px-4 py-3 border border-brand-200 dark:border-brand-700">
                    <MdPhoneIphone size={26} className="text-brand-500 shrink-0" />
                    <p className="text-sm text-brand-700 dark:text-brand-300">
                        O valor do aparelho entregue será <strong>descontado do total do item</strong> selecionado no pedido.
                    </p>
                </div>

                {/* Produto sendo comprado */}
                {currentItem && (
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800 grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">Produto comprado</span>
                            <p className="font-medium text-gray-700 dark:text-gray-200 mt-0.5">
                                {currentItem.productName ?? "Carregando..."}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">Total atual do item</span>
                            <p className="font-medium text-gray-700 dark:text-gray-200 mt-0.5">
                                {formattedMoney(currentItem.total)}
                            </p>
                        </div>
                    </div>
                )}

                {/* Toggle modo */}
                <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
                    <button
                        type="button"
                        onClick={() => { setMode("search"); setSelectedProduct(null); setProducts([]); }}
                        className={`flex-1 py-2 px-3 transition-colors ${
                            mode === "search"
                                ? "bg-brand-500 text-white font-medium"
                                : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                    >
                        Buscar no estoque
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode("manual"); setSelectedProduct(null); setProducts([]); }}
                        className={`flex-1 py-2 px-3 transition-colors border-l border-gray-200 dark:border-gray-700 ${
                            mode === "manual"
                                ? "bg-brand-500 text-white font-medium"
                                : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                    >
                        Digitar manualmente
                    </button>
                </div>

                {/* Campo de aparelho */}
                <div>
                    <Label title="Aparelho dado como entrada" />

                    {mode === "search" ? (
                        <>
                            <Autocomplete
                                placeholder="Buscar produto no estoque..."
                                defaultValue={selectedProduct?.productName ?? "empty"}
                                objKey="id"
                                objValue="productName"
                                onSearch={searchProducts}
                                onSelect={(opt) => { setSelectedProduct(opt); setProducts([]); }}
                                options={products}
                            />
                            {selectedProduct && (
                                <div className="mt-2 flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 text-sm">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-700 dark:text-gray-200">{selectedProduct.productName}</span>
                                        {selectedProduct.code && (
                                            <span className="text-xs text-gray-400">Cód: {selectedProduct.code}</span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedProduct(null); }}
                                        className="text-gray-400 hover:text-red-500 text-xs ml-3"
                                    >
                                        ✕ remover
                                    </button>
                                </div>
                            )}
                            {!selectedProduct && (
                                <p className="mt-1 text-xs text-gray-400">
                                    Não encontrou?{" "}
                                    <button type="button" onClick={() => setMode("manual")} className="text-brand-500 hover:underline">
                                        Digitar manualmente
                                    </button>
                                </p>
                            )}
                        </>
                    ) : (
                        <>
                            <input
                                value={manualDeviceName}
                                onChange={(e) => setManualDeviceName(e.target.value)}
                                maxLength={100}
                                placeholder="Ex: iPhone 15 Pro Max 256GB"
                                type="text"
                                className="input-erp-primary input-erp-default"
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                Produto no estoque?{" "}
                                <button type="button" onClick={() => setMode("search")} className="text-brand-500 hover:underline">
                                    Buscar no estoque
                                </button>
                            </p>
                        </>
                    )}
                </div>

                {/* Valor do aparelho */}
                <div>
                    <Label title="Valor do aparelho (abatimento)" />
                    <Controller
                        name="tradeInValue"
                        control={control}
                        defaultValue={0}
                        render={({ field: { onChange, value } }) => (
                            <NumericFormat
                                className="input-erp-primary input-erp-default"
                                value={value}
                                onValueChange={(values) => onChange(values.floatValue ?? 0)}
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix="R$ "
                                decimalScale={2}
                                fixedDecimalScale
                                allowNegative={false}
                                placeholder="R$ 0,00"
                            />
                        )}
                    />
                </div>

                {/* Preview */}
                {currentItem && watchedTradeInValue > 0 && (
                    <div className="rounded-lg border border-green-200 dark:border-green-700 px-4 py-3 bg-green-50 dark:bg-green-900/20">
                        {resolvedDeviceName && (
                            <p className="text-xs text-green-700 dark:text-green-400 mb-2 text-center">
                                Aparelho: <strong>{resolvedDeviceName}</strong>
                            </p>
                        )}
                        <div className="grid grid-cols-3 gap-2 text-sm text-center">
                            <div>
                                <span className="text-gray-400 text-xs uppercase tracking-wide block">Total original</span>
                                <span className="font-semibold text-gray-600 dark:text-gray-300">{formattedMoney(currentItem.total)}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 text-xs uppercase tracking-wide block">Abatimento</span>
                                <span className="font-semibold text-red-500">− {formattedMoney(watchedTradeInValue)}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 text-xs uppercase tracking-wide block">Novo total</span>
                                <span className="font-bold text-green-600 dark:text-green-400 text-base">{formattedMoney(newTotal)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Ações */}
                <div className="flex justify-end gap-3 pt-1">
                    <Button size="sm" variant="outline" onClick={close}>Cancelar</Button>
                    <Button size="sm" variant="primary" onClick={confirm}>Aplicar Entrada</Button>
                </div>
            </div>
        </ModalV2>
    );
};