// "use client";

// import { loadingAtom } from "@/jotai/global/loading.jotai";
// import { api } from "@/service/api.service";
// import { configApi, resolveResponse } from "@/service/config.service";
// import { useAtom } from "jotai";
// import { Modal } from "@/components/ui/modal";
// import { Controller, useForm } from "react-hook-form";
// import { useEffect, useState } from "react";
// import { ResetBoxSettings, TBoxSettings } from "@/types/commercial/box/box.type";
// import { MdAccountBalanceWallet, MdArrowForward, MdRepeat, MdTrendingDown, MdTrendingUp } from "react-icons/md";
// import { boxIdAtom, boxSettingModalAtom } from "@/jotai/commercial/box/box.jotai";
// import { NumericFormat } from "react-number-format";
// import Label from "@/components/form/Label";
// import Button from "@/components/ui/button/Button";
// import { salesOrderModalAtom } from "@/jotai/commercial/sales-order/salesOrder.jotai";

// const list = [
//   {
//     title: "Sangria",
//     subTitle: "Informe o valor que deseja retirar",
//     name: "Sangrar Caixa",
//     uri: "sangria",
//     description: "A sangria caracteriza-se pela retirada de valor do caixa, ou seja, você retira um determinado valor da gaveta do operador para guardar em outro local mais seguro.",
//     color: "bg-[#ef6a5a]",
//     hover: "hover:bg-[#d95d4e]",
//     icon: <MdTrendingUp className="opacity-20 absolute right-4 top-4 text-8xl rotate-45" />
//   },
//   {
//     title: "Reforço",
//     subTitle: "Informe o valor que deseja adicionar",
//     name: "Reforçar Caixa",
//     uri: "reinforce",
//     description: "O reforço consiste em incluir valor no seu caixa, sempre que necessário. Esta transação ocorre normalmente quando é adicionado troco na gaveta do operador.",
//     color: "bg-[#00a65a]",
//     hover: "hover:bg-[#008d4c]",
//     icon: <MdTrendingDown className="opacity-20 absolute right-4 top-4 text-8xl -rotate-45" />
//   },
//   {
//     title: "Troca/Devolução",
//     subTitle: "",
//     name: "",
//     uri: "sangria",
//     description: "A troca ou devolução ocorre quando o cliente desistir de uma compra ou o produto apresenta algum defeito. O produto é trocado ou volta para o estoque.",
//     color: "bg-[#f39c12]",
//     hover: "hover:bg-[#db8b0b]",
//     icon: <MdRepeat className="opacity-20 absolute right-4 top-4 text-8xl" />
//   },
//   {
//     title: "Fechamento",
//     subTitle: "Deseja realmente fechar este caixa?",
//     name: "Fechar caixa",
//     uri: "closing",
//     description: "O fechamento de caixa envolve um trabalho cuidadoso de conferência e checagem dos valores que estão no caixa com o saldo dos registros de entradas e saídas.",
//     color: "bg-[#00c0ef]",
//     hover: "hover:bg-[#00add8]",
//     icon: <MdAccountBalanceWallet className="opacity-20 absolute right-4 top-4 text-8xl" />
//   }
// ];

// export default function BoxModalSettings() {
//   const [_, setIsLoading] = useAtom(loadingAtom);
//   const [modalSettings, setModalSettings] = useAtom(boxSettingModalAtom);
//   const [__, setModalCreate] = useAtom(salesOrderModalAtom);
//   const [title, setTitle] = useState("Operações do PDV");
//   const [subTitle, setSubTitle] = useState("");
//   const [uri, setUri] = useState("");
//   const [operations] = useState(list);
//   const [boxId] = useAtom(boxIdAtom);

//   const { getValues, register, control, reset, setValue } = useForm<TBoxSettings>({
//     defaultValues: ResetBoxSettings
//   });
  

//   const update = async () => {
//     try {
//       setIsLoading(true);
//       const {data} = await api.put(`/boxes/${uri}`, {...getValues(), id: boxId}, configApi());
//       const result = data.result;
//       resolveResponse({status: 200, message: result.message});
//       console.log(result)
//       reset(ResetBoxSettings);
//       if(uri == "closing") {
//         setModalSettings(false);
//         setModalCreate(false);
//       };
//     } catch (error) {
//       resolveResponse(error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const close = () => {
//     setModalSettings(false);
//   };

//   useEffect(() => {
//     const initial = async () => {
//       setTitle("Operações do PDV");
//     };
//     initial();
//   }, [modalSettings]);

//   return (
//     <Modal isOpen={modalSettings} onClose={close} className={`m-4 w-[90dvw] max-w-240`}>
//       <div className={`no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11`}>
//         <div className="px-2 pr-14 mb-4">
//           <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">{title}</h4>
//         </div>

//         <div className="grid grid-cols-2 gap-4 p-4">
//           {title == "Operações do PDV" && operations.map((op, index) => (
//             <div onClick={() => {
//               setTitle(op.name);
//               setSubTitle(op.subTitle);
//               setUri(op.uri);
//               console.log(op)
//             }} key={index} className={`${op.color} ${op.hover} text-white rounded shadow-md flex flex-col justify-between overflow-hidden relative transition-all cursor-pointer group`}>
//               {op.icon}

//               <div className="p-5 z-10">
//                 <h2 className="text-3xl font-bold mb-3 tracking-tight">{op.title}</h2>
//                 <p className="text-sm leading-relaxed opacity-95 h-20 overflow-hidden">
//                   {op.description}
//                 </p>
//               </div>

//               <div className="bg-black/10 py-2 px-5 flex justify-center items-center gap-2 group-hover:bg-black/20 transition-colors z-10">
//                 <span className="text-sm font-light">Clique aqui</span>
//                 <MdArrowForward />
//               </div>
//             </div>
//           ))}

//           {
//             title != "Operações do PDV" &&
//             <>
//               <h1 className="col-span-2 mb-1.5 block text-xl text-center font-medium text-gray-700 dark:text-gray-400">{subTitle}</h1>
//               {
//                 uri != "closing" &&
//                 <div className="col-span-2">
//                   <Label title="Valor" />
//                   <Controller
//                     name="valueSettings"
//                     control={control}
//                     defaultValue={0}
//                     render={({ field: { onChange, value } }) => (
//                       <NumericFormat
//                         className="input-erp-primary input-erp-default" 
//                         value={value}
//                         onValueChange={(values) => {
//                           const val = values.floatValue ?? 0;
//                           onChange(val);
//                         }}
//                         thousandSeparator="."
//                         decimalSeparator=","
//                         prefix="R$ "
//                         decimalScale={2}
//                         fixedDecimalScale
//                         allowNegative={false}
//                         placeholder="Valor"
//                       />
//                     )}
//                   />
//                 </div> 
//               }
//               <Button className="w-full" size="sm" variant="outline" onClick={close}>Cancelar</Button>
//               <Button className="w-full" size="sm" variant="primary" onClick={() => update()}>Confirmar</Button>
//             </>
//           }
//         </div>
//       </div>
//     </Modal> 
//   );
// }

"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { Modal } from "@/components/ui/modal";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { ResetBoxSettings, TBoxSettings } from "@/types/commercial/box/box.type";
import {
  MdAccountBalanceWallet,
  MdArrowBack,
  MdArrowForward,
  MdRepeat,
  MdTrendingDown,
  MdTrendingUp,
} from "react-icons/md";
import { boxIdAtom, boxSettingModalAtom } from "@/jotai/commercial/box/box.jotai";
import { NumericFormat } from "react-number-format";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { salesOrderModalAtom, salesOrderCodeAtom } from "@/jotai/commercial/sales-order/salesOrder.jotai";
import { salesOrderItemIdAtom } from "@/jotai/commercial/sales-order/salesOrderItem.jotai";
import { exchangeModalAtom } from "@/jotai/stock/exchange.jotai";
import { productAtom } from "@/jotai/product/product.jotai";
import Autocomplete from "@/components/form/Autocomplete";
import { maskDate, formattedMoney } from "@/utils/mask.util";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

type TScreen = "menu" | "sangria" | "reinforce" | "closing" | "exchange";

const list = [
  {
    title: "Sangria",
    subTitle: "Informe o valor que deseja retirar",
    name: "Sangrar Caixa",
    screen: "sangria" as TScreen,
    description:
      "A sangria caracteriza-se pela retirada de valor do caixa, ou seja, você retira um determinado valor da gaveta do operador para guardar em outro local mais seguro.",
    color: "bg-[#ef6a5a]",
    hover: "hover:bg-[#d95d4e]",
    icon: <MdTrendingUp className="opacity-20 absolute right-4 top-4 text-8xl rotate-45" />,
  },
  {
    title: "Reforço",
    subTitle: "Informe o valor que deseja adicionar",
    name: "Reforçar Caixa",
    screen: "reinforce" as TScreen,
    description:
      "O reforço consiste em incluir valor no seu caixa, sempre que necessário. Esta transação ocorre normalmente quando é adicionado troco na gaveta do operador.",
    color: "bg-[#00a65a]",
    hover: "hover:bg-[#008d4c]",
    icon: <MdTrendingDown className="opacity-20 absolute right-4 top-4 text-8xl -rotate-45" />,
  },
  {
    title: "Troca/Devolução",
    subTitle: "Selecione o pedido de venda",
    name: "Troca/Devolução",
    screen: "exchange" as TScreen,
    description:
      "A troca ou devolução ocorre quando o cliente desistir de uma compra ou o produto apresenta algum defeito. O produto é trocado ou volta para o estoque.",
    color: "bg-[#f39c12]",
    hover: "hover:bg-[#db8b0b]",
    icon: <MdRepeat className="opacity-20 absolute right-4 top-4 text-8xl" />,
  },
  {
    title: "Fechamento",
    subTitle: "Deseja realmente fechar este caixa?",
    name: "Fechar caixa",
    screen: "closing" as TScreen,
    description:
      "O fechamento de caixa envolve um trabalho cuidadoso de conferência e checagem dos valores que estão no caixa com o saldo dos registros de entradas e saídas.",
    color: "bg-[#00c0ef]",
    hover: "hover:bg-[#00add8]",
    icon: <MdAccountBalanceWallet className="opacity-20 absolute right-4 top-4 text-8xl" />,
  },
];

export default function BoxModalSettings() {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [modalSettings, setModalSettings] = useAtom(boxSettingModalAtom);
  const [__, setModalCreate] = useAtom(salesOrderModalAtom);
  const [boxId] = useAtom(boxIdAtom);

  // ─── atoms compartilhados com ExchangeModal ──────────────────────────────
  const [, setSalesOrderCode] = useAtom(salesOrderCodeAtom);
  const [, setSalesOrderItemId] = useAtom(salesOrderItemIdAtom);
  const [, setExchangeModal] = useAtom(exchangeModalAtom);
  const [, setProduct] = useAtom(productAtom);

  const [screen, setScreen] = useState<TScreen>("menu");
  const [subTitle, setSubTitle] = useState("");

  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState<any>(null);
  const [salesOrderItems, setSalesOrderItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const { control, reset } = useForm<TBoxSettings>({
    defaultValues: ResetBoxSettings,
  });

  const [valueSettings, setValueSettings] = useState(0);

  const updateBox = async () => {
    const uri = screen === "sangria" ? "sangria" : screen === "reinforce" ? "reinforce" : "closing";
    try {
      setIsLoading(true);
      const { data } = await api.put(`/boxes/${uri}`, { valueSettings, id: boxId }, configApi());
      const result = data.result;
      resolveResponse({ status: 200, message: result.message });
      reset(ResetBoxSettings);
      setValueSettings(0);
      if (uri === "closing") {
        setModalSettings(false);
        setModalCreate(false);
      } else {
        setScreen("menu");
      }
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchSalesOrders = async (value: string) => {
    try {
      if (!value) return setSalesOrders([]);
      const { data } = await api.get(
        `/sales-orders?deleted=false&status=Finalizado&orderBy=code&sort=desc&pageSize=20&pageNumber=1&regex$or$code=${value}&regex$or$customerName=${value}`,
        configApi()
      );
      setSalesOrders(data.result.data ?? []);
    } catch {
      setSalesOrders([]);
    }
  };

  const selectSalesOrder = async (order: any) => {
    setSelectedSalesOrder(order);
    setSalesOrderItems([]);
    setLoadingItems(true);
    try {
      const { data } = await api.get(
        `/sales-orders-items?deleted=false&salesOrderId=${order.id}&orderBy=createdAt&sort=desc&pageSize=100&pageNumber=1`,
        configApi()
      );
      setSalesOrderItems(data.result.data ?? []);
    } catch {
      setSalesOrderItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const openExchange = (item: any) => {
    if (!selectedSalesOrder) return;
    setSalesOrderCode(selectedSalesOrder.code);
    setSalesOrderItemId(item.id);
    setProduct({ ...item, hasSerial: item.productHasSerial });
    setModalSettings(false);
    setExchangeModal(true);
  };

  const close = () => {
    setModalSettings(false);
  };

  useEffect(() => {
    if (modalSettings) {
      setScreen("menu");
      setSubTitle("");
      setValueSettings(0);
      setSelectedSalesOrder(null);
      setSalesOrders([]);
      setSalesOrderItems([]);
    }
  }, [modalSettings]);

  return (
    <Modal isOpen={modalSettings} onClose={close} className="m-4 w-[90dvw] max-w-240">
      <div className="no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14 mb-4 flex items-center gap-3">
          {screen !== "menu" && (
            <button
              onClick={() => { setScreen("menu"); setSelectedSalesOrder(null); setSalesOrderItems([]); }}
              className="text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              <MdArrowBack size={22} />
            </button>
          )}
          <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            {screen === "menu" ? "Operações do PDV" : list.find((l) => l.screen === screen)?.name ?? ""}
          </h4>
        </div>

        {screen === "menu" && (
          <div className="grid grid-cols-2 gap-4 p-4">
            {list.map((op) => (
              <div
                key={op.screen}
                onClick={() => {
                  setScreen(op.screen);
                  setSubTitle(op.subTitle);
                }}
                className={`${op.color} ${op.hover} text-white rounded shadow-md flex flex-col justify-between overflow-hidden relative transition-all cursor-pointer group`}
              >
                {op.icon}
                <div className="p-5 z-10">
                  <h2 className="text-3xl font-bold mb-3 tracking-tight">{op.title}</h2>
                  <p className="text-sm leading-relaxed opacity-95 h-20 overflow-hidden">{op.description}</p>
                </div>
                <div className="bg-black/10 py-2 px-5 flex justify-center items-center gap-2 group-hover:bg-black/20 transition-colors z-10">
                  <span className="text-sm font-light">Clique aqui</span>
                  <MdArrowForward />
                </div>
              </div>
            ))}
          </div>
        )}

        {(screen === "sangria" || screen === "reinforce") && (
          <div className="grid grid-cols-2 gap-4 p-4">
            <h1 className="col-span-2 mb-1.5 block text-xl text-center font-medium text-gray-700 dark:text-gray-400">
              {subTitle}
            </h1>
            <div className="col-span-2">
              <Label title="Valor" />
              <NumericFormat
                className="input-erp-primary input-erp-default"
                value={valueSettings}
                onValueChange={(values) => setValueSettings(values.floatValue ?? 0)}
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                decimalScale={2}
                fixedDecimalScale
                allowNegative={false}
                placeholder="Valor"
              />
            </div>
            <Button className="w-full" size="sm" variant="outline" onClick={() => setScreen("menu")}>
              Cancelar
            </Button>
            <Button className="w-full" size="sm" variant="primary" onClick={updateBox}>
              Confirmar
            </Button>
          </div>
        )}

        {screen === "closing" && (
          <div className="grid grid-cols-2 gap-4 p-4">
            <h1 className="col-span-2 mb-1.5 block text-xl text-center font-medium text-gray-700 dark:text-gray-400">
              {subTitle}
            </h1>
            <Button className="w-full" size="sm" variant="outline" onClick={() => setScreen("menu")}>
              Cancelar
            </Button>
            <Button className="w-full" size="sm" variant="primary" onClick={updateBox}>
              Confirmar
            </Button>
          </div>
        )}

        {screen === "exchange" && (
          <div className="flex flex-col gap-5 p-4">

            <div>
              <Label title="Buscar Pedido de Venda (nº ou cliente)" />
              <Autocomplete
                placeholder="Digite o nº ou nome do cliente..."
                objKey="id"
                objValue="code"
                options={salesOrders.map((o) => ({
                  ...o,
                  code: `#${o.code} — ${o.customerName ?? "Ao consumidor"}`,
                }))}
                onSearch={searchSalesOrders}
                onSelect={(opt) => selectSalesOrder(opt)}
              />
            </div>

            {selectedSalesOrder && (
              <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3 text-sm text-gray-600 dark:text-gray-300 flex flex-wrap gap-x-6 gap-y-1">
                <span><strong>Pedido:</strong> #{selectedSalesOrder.code}</span>
                <span><strong>Cliente:</strong> {selectedSalesOrder.customerName ?? "Ao consumidor"}</span>
                <span><strong>Total:</strong> {formattedMoney(selectedSalesOrder.total)}</span>
                <span><strong>Data:</strong> {maskDate(selectedSalesOrder.createdAt)}</span>
              </div>
            )}

            {loadingItems && (
              <p className="text-sm text-gray-400 text-center">Carregando itens...</p>
            )}

            {!loadingItems && selectedSalesOrder && salesOrderItems.length === 0 && (
              <p className="text-sm text-gray-400 text-center">Nenhum item encontrado neste pedido.</p>
            )}

            {!loadingItems && salesOrderItems.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 overflow-x-auto">
                <Table className="divide-y">
                  <TableHeader className="border-b border-gray-100 dark:border-white/5">
                    <TableRow>
                      <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Produto</TableCell>
                      <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Qtd</TableCell>
                      <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Valor Unit.</TableCell>
                      <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Total</TableCell>
                      <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ação</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                    {salesOrderItems.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.productName}</TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{item.quantity}</TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formattedMoney(item.value)}</TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formattedMoney(item.total)}</TableCell>
                        <TableCell className="px-4 py-3">
                          <button
                            onClick={() => openExchange(item)}
                            className="flex items-center gap-1.5 text-xs font-medium text-white bg-[#f39c12] hover:bg-[#db8b0b] px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <MdRepeat size={14} />
                            Trocar
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setScreen("menu")}>
                Voltar ao menu
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}