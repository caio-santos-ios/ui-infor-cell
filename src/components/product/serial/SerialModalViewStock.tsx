"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useEffect, useState } from "react";
import { serialModalViewStockAtom } from "@/jotai/product/serial.jotai";
import { productAtom } from "@/jotai/product/product.jotai";
import { ResetProduct } from "@/types/product/product/product.type";
import { NotData } from "@/components/not-data/NotData";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { maskDate } from "@/utils/mask.util";
import { variationCurrentAtom } from "@/jotai/product/variation/variation.jotai";
import { TSerial } from "@/types/product/serial/serial.type";

export default function SerialModalViewStock() {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [modal, setModal] = useAtom(serialModalViewStockAtom);
  const [__, setCurrentVariation] = useAtom(variationCurrentAtom);
  const [product, setProduct] = useAtom(productAtom);
  const [stocks, setStock] = useState<any[]>([]);
  const [hasSerial, setHasSerial] = useState<boolean>(false);
  const [hasVariation, setHasVariation] = useState<boolean>(false);
  
  const getById = async (id: string) => {
  try {
    setIsLoading(true);
    const { data } = await api.get(`stocks/product/${id}`, configApi());
    const result = data.result.data;

    if (result.length > 0) {
      const apiHasSerial = result[0].productHasSerial === "yes";
      const apiHasVariation = result[0].productHasVariations === "yes";
      
      setHasSerial(apiHasSerial);
      setHasVariation(apiHasVariation);

      if (apiHasVariation) {
        const variations = result[0].variations;
        const listStock: any[] = [];

        result.forEach((res: any) => {
          variations.forEach((item: any) => {
            const itemFilted = item.filter((x: any) => x.stock > 0);
            
            itemFilted.forEach((varia: any) => {
              if(hasSerial) {
                let variation = varia.attributes.map((a: any) => (`${a.key}: ${a.value}`));
                variation = variation.join(" / ");
                const serialList = varia.serials.filter((x: any) => x.hasAvailable);

                serialList.forEach((serial: TSerial) => {
                  listStock.push({
                    storeName: res.storeName,
                    productName: res.productName,
                    serial: serial.code,
                    quantity: parseFloat(varia.stock),
                    createdAt: res.createdAt,
                    variation,
                    originDescription: res.originDescription
                  });
                });
              } else {
                let variation = varia.attributes.map((a: any) => (`${a.key}: ${a.value}`));
                variation = variation.join(" / ");
                
                const existedIndex = listStock.findIndex((x: any) => x.variation == variation);
                if(existedIndex >= 0) {
                  listStock[existedIndex].quantityAvailable += parseFloat(varia.stock);
                } else {
                  listStock.push({
                    storeName: res.storeName,
                    productName: res.productName,
                    serial: "",
                    quantity: parseFloat(varia.stock),
                    createdAt: res.createdAt,
                    variation,
                    originDescription: res.originDescription
                  });
                }
              }
            });
          });
        });        

        setStock(listStock);
      } else {
        console.log(result)
        setStock(result.filter((x: any) => x.quantityAvailable > 0));
      }
    } else {
      setStock([]);
    }
  } catch (error) {
    resolveResponse(error);
    setStock([]);
  } finally {
    setIsLoading(false);
  }
};

  const close = () => {
    setCurrentVariation("");
    setStock([]);
    setProduct(ResetProduct);
    setModal(false);
  };
  
  useEffect(() => {
    if (modal && product.id) {
      getById(product.id);
    }
  }, [modal, product.id]);

  return (
    <Modal isOpen={modal} onClose={close} className={`m-4 w-[80dvw] bg-red-400`}>
      <div className={`no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11`}>
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Estoque do Produto</h4>
        </div>

        <form className="flex flex-col mt-8">
          <div className={`max-h-[70dvh] custom-scrollbar overflow-y-auto px-2 pb-3`}>
            <div className="grid grid-cols-6 gap-4">
              {
                stocks.length > 0 ?
                <div className="col-span-6 erp-container-table rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 mb-3">
                  <div className="max-w-full overflow-x-auto tele-container-table">
                    <div className="divide-y">
                      <Table className="divide-y">
                        <TableHeader className="border-b border-gray-100 dark:border-white/5 tele-table-thead">
                          <TableRow>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Loja</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Produto</TableCell>
                            {
                              hasVariation &&
                              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Variação</TableCell>
                            }
                            {
                              hasSerial &&
                              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Serial</TableCell>
                            }
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Quantidade</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Origem</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Data de Entrada</TableCell>
                          </TableRow>
                        </TableHeader>
          
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                          {stocks.map((x: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.storeName}</TableCell>
                              <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.productName}</TableCell>
                              {
                                hasVariation &&
                                <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.variation}</TableCell>
                              }
                              {
                                hasSerial &&
                                <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.serial}</TableCell>
                              }
                              <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.quantity}</TableCell>
                              <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{x.originDescription}</TableCell>
                              <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">{maskDate(x.createdAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
                :
                <div className="col-span-6 flex justify-center items-center">
                  <NotData />
                </div>
              }
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={close}>Cancelar</Button>
          </div>
        </form>
      </div>
    </Modal> 
  );
}