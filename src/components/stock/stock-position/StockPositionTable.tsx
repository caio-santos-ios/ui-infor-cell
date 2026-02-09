"use client";

import Pagination from "@/components/tables/Pagination";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { maskDate } from "@/utils/mask.util";
import { permissionRead, permissionUpdate } from "@/utils/permission.util";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { NotData } from "@/components/not-data/NotData";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { storeLoggedAtom } from "@/jotai/global/store.jotai";
import { MdSwapHoriz } from "react-icons/md";
import { TStore } from "@/types/master-data/store/store.type";
import Label from "@/components/form/Label";
import { useForm } from "react-hook-form";
import { ResetExchange, TExchange } from "@/types/stock/exchange/exchange.type";
import { ResetStockPosition, TStockPosition } from "@/types/stock/stock-position/stock-position.type";
import { TVariation } from "@/types/product/variation/variation.type";
import { TSerial } from "@/types/product/serial/serial.type";
import { TTransfer } from "@/types/stock/transfer/transfer.type";
import { IconViewStock } from "@/components/iconViewStock/IconViewStock";
import { ResetProduct } from "@/types/product/product/product.type";
import { productAtom } from "@/jotai/product/product.jotai";
import { serialModalViewStockAtom } from "@/jotai/product/serial.jotai";
import SerialModalViewStock from "@/components/product/serial/SerialModalViewStock";

export default function StockPositionTable() {
  const [_, setLoading] = useAtom(loadingAtom);
  const [pagination, setPagination] = useAtom(paginationAtom); 
  const [storeLogged] = useAtom(storeLoggedAtom);
  const [stock, setStock] = useState<TStockPosition>(ResetStockPosition);
  const [modalApproval, setModalApproval] = useState<boolean>(false);
  const [stores, setStore] = useState<TStore[]>([]);
  const [variations, setVariation] = useState<TVariation[]>([]);
  const [serials, setSerial] = useState<TSerial[]>([]);
  const [quantity, setQuantity] = useState<number>(0);
  const [__, setModalViewStock] = useAtom(serialModalViewStockAtom);
  const [___, setProduct] = useAtom(productAtom);

  const { register, setValue, getValues, reset, watch } = useForm<TTransfer>({
    defaultValues: ResetExchange
  });

  const getAll = async (page: number) => {
    try {
      setLoading(true);
      const {data} = await api.get(`/stocks?deleted=false&gt$quantity=0&orderBy=createdAt&sort=desc&pageSize=10&pageNumber=${page}`, configApi());
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
  
  const approval = async () => {
    try {
      const form = {...getValues(), purchaseOrderItemId: stock.purchaseOrderItemId, productId: stock.productId};
      setLoading(true);
      await api.post(`/transfers`, form, configApi());
      resolveResponse({status: 200, message: "Tranferência feita com sucesso"});
      setModalApproval(false);
      reset(ResetExchange);
      await getAll(pagination.currentPage);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
  };

  const getObj = async (obj: any, action: string) => {
    if(action == "edit") {
      await getSelectStore();
      setValue("storeOriginId", obj.store);
      setValue("productHasSerial", obj.productHasSerial);
      setValue("productHasVariations", obj.productHasVariations);
      
      setStock(obj);
      setModalApproval(true);
      setQuantity(obj.quantity)
      setVariation(obj.variations);
    };

    if(action == "viewSerial") {
      setProduct({...ResetProduct, id: obj.productId});
      setModalViewStock(true);
    };    
  };

  const changePage = async (page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));

    await getAll(page);
  };

  const getSelectStore = async () => {
    try {
      setLoading(true);
      const {data} = await api.get(`/stores/select?deleted=false`, configApi());
      const result = data.result.data;
      setStore(result);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
  };

  const normalizeValueSelect = (variation: any) => {
    const variationStr = variation.attributes.map((a: any) => (a.value));
    return variationStr.join(" / ");
  };

  useEffect(() => {
    const item: any = variations.find(v => v.barcode == watch("barcode"));
    if(item) {
      setSerial(item.serials);
      setValue("variationId", item.variationId);
      setQuantity(parseFloat(item.stock.toString()));
    };
  }, [watch("barcode")]);

  useEffect(() => {
    if(permissionRead("F", "F1")) {
      getAll(1);
    };
  }, [storeLogged]);

  return (
    pagination.data.length > 0 ?
    <>
      <div className="erp-container-table rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 mb-3">
        <div className="max-w-full overflow-x-auto tele-container-table">
          <div className="min-w-[1102px] divide-y">
            <Table className="divide-y">
              <TableHeader className="border-b border-gray-100 dark:border-white/5 tele-table-thead">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Produto</TableCell>
                  {/* <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Fornecedor</TableCell> */}
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Quantidade</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Data da Entrada</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Origem</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ações</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                {pagination.data.map((x: any) => (
                  <TableRow key={x.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.productName}</TableCell>
                    {/* <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.supplierName}</TableCell> */}
                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">
                      {x.quantity}
                      {/* {
                        permissionRead("A", "A2") &&
                        <IconViewStock action="viewSerial" obj={x} getObj={getObj}/>
                      }   */}
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{maskDate(x.createdAt)}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.originDescription}</TableCell>
                    <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">
                      <div className="flex gap-3">    
                        {
                          permissionUpdate("F", "F1") &&
                          <div onClick={() => getObj(x, "edit")} className="cursor-pointer text-blue-400 hover:text-blue-500" >
                            <MdSwapHoriz size={20} />
                          </div>
                        } 
                        {
                          permissionRead("F", "F1") &&
                          <IconViewStock action="viewSerial" obj={x} getObj={getObj}/>
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
      <Pagination currentPage={pagination.currentPage} totalCount={pagination.totalCount} totalData={pagination.data.length} totalPages={pagination.totalPages} onPageChange={changePage} />

      <Modal isOpen={modalApproval} onClose={() => setModalApproval(false)} className="max-w-[900px] m-4">
        <div className="no-scrollbar relative w-full max-w-[900px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Transferência de Estoque</h4>
            </div>

            <form className="flex flex-col">
              <div className="custom-scrollbar max-h-[80vh] overflow-y-auto px-2 pb-3">
                <div className="mt-7">
                  <div className="grid grid-cols-12 gap-x-6 gap-y-5">
                    <div className="col-span-12 md:col-span-6">
                      <Label title="Loja de Origem"/>
                      <select disabled {...register("storeOriginId")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                        <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Selecione</option>
                        {
                          stores.map((x: TStore) => {
                            return <option key={x.id} value={x.id} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{x.tradeName}</option>
                          })
                        }
                      </select>
                    </div> 
                    
                    <div className="col-span-12 md:col-span-6">
                      <Label title="Loja de Destino"/>
                      <select {...register("storeDestinationId")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                        <option value="" className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">Selecione</option>
                        {
                          stores.map((x: TStore) => {
                            return (
                              stock.store != x.id &&
                              <option key={x.id} value={x.id} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{x.tradeName}</option>
                            ) 
                          })
                        }
                      </select>
                    </div>  
                    <div className="col-span-12 md:col-span-6">
                      <Label title="Produto"/>
                      <input disabled value={stock.productName} maxLength={40} placeholder="Código de barras"className="input-erp-primary input-erp-default w-full"/>
                    </div>
                    {
                      watch("productHasVariations") == "yes" &&
                      <div className="col-span-12 md:col-span-6">
                        <Label title="Variação"/>
                        <select {...register("barcode")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                          <option value="">Selecione</option>
                          {variations.map((item: any, j: number) => (
                            <option key={j} value={item.barcode}>{normalizeValueSelect(item)}</option>
                          ))}
                        </select>
                      </div>  
                    }
                    {
                      watch("barcode") && watch("productHasSerial") == "no" &&
                      <div className="col-span-12 md:col-span-6 xl:col-span-3">
                        <Label title="Quantidade"/>
                        <select {...register("quantity")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                          {
                            Array.from({length: quantity}, (_, index) => {
                              return <option key={index + 1} value={index + 1} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{index + 1}</option>
                            })
                          }
                        </select>
                      </div>  
                    }
                    {
                      watch("productHasSerial") == "no" && watch("productHasSerial") == "no" &&
                      <div className="col-span-12 md:col-span-6 xl:col-span-3">
                        <Label title="Quantidade"/>
                        <select {...register("quantity")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                          {
                            Array.from({length: quantity}, (_, index) => {
                              return <option key={index + 1} value={index + 1} className="text-gray-700 dark:bg-gray-900 dark:text-gray-400">{index + 1}</option>
                            })
                          }
                        </select>
                      </div>  
                    }
                    {
                      watch("productHasSerial") == "yes" &&
                      <div className="col-span-12 md:col-span-6">
                        <Label title="Serial"/>
                        <select {...register("serial")} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 dark:bg-dark-900">
                          <option value="">Selecione</option>
                          {serials.map((item: any, j: number) => (
                            <option key={j} value={item.code}>{item.code}</option>
                          ))}
                        </select>
                      </div> 
                    }
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                  <Button size="sm" variant="outline" onClick={() => {
                    setModalApproval(false);
                    reset(ResetExchange);
                  }}>Cancelar</Button>
                  <Button size="sm" variant="primary" onClick={approval}>Confirmar</Button>
              </div>
            </form>
        </div>
      </Modal> 

      <SerialModalViewStock />
    </>
    :
    <NotData />
  );
}