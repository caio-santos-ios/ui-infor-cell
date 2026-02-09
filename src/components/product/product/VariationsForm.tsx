"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import ComponentCard from "@/components/common/ComponentCard";
import { TProduct, TVariationProduct } from "@/types/product/product/product.type";
import { FaPlus, FaTrash } from "react-icons/fa";
import { TVariation } from "@/types/product/variation/variation.type";
import Label from "@/components/form/Label";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import { MdCheck, MdOutlineQrCodeScanner } from "react-icons/md";
import { Modal } from "@/components/ui/modal";
import { serialModalAtom } from "@/jotai/product/serial.jotai";
import { TSerial } from "@/types/product/serial/serial.type";
import { NumericFormat } from "react-number-format";

type TProp = { 
  variations: any[];
  variationsCode: string[];
  // serials: TSerial[];
  productId?: string; 
  sendBody: (body: any) => void;
  sendCancel?: () => void;
  btnAdd?: boolean;
  btnSave?: boolean;
  btnCancel?: boolean;
  btnDelete?: boolean;
  btnEdit?: boolean;
  btnAddSerial?: boolean;
  qtdStock?: number;
  stockDisabled?: boolean;
  lineDefault?: number;
  typeBtnSave?: any;
};

export default function VariationsForm({ productId, variations = [], variationsCode = [], btnAdd = true, btnAddSerial = true, btnCancel = true, btnDelete = true, btnEdit = true, btnSave = true, qtdStock = 0, stockDisabled = false, lineDefault = 1, typeBtnSave = "submit", sendBody, sendCancel}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [variationTypes, setVariationTypes] = useState<TVariation[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [modalSerial, setModalSerial] = useAtom<boolean>(serialModalAtom);
  const [serials, setSerial] = useState<TSerial[]>([]);
  const [currentVariation, setCurrentVariation] = useState<number>(-1);

  const isInitialMount = useRef(true); 

  const { register, control, reset, getValues, setValue, watch } = useForm<any>({
    defaultValues: { variations: [] }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variations",
  });
  
  // const getById = async (id: string, types: TVariation[]) => {
  //   try {
  //     setIsLoading(true);
  //     const { data } = await api.get(`/products/${id}`, configApi());
  //     const result = data.result.data;

  //     if (result.variations) {
  //       result.variations = result.variations.map((v: any) => {
  //         const rowData: any = { ...v };

  //         v.attributes?.forEach((attr: any) => {
  //           const variationType = types.find(t => t.name === attr.key);
  //           if (variationType) {
  //             const item = variationType.items.find(i => i.value === attr.value);
  //             if (item) {
  //               rowData[`variationItemId_${variationType.code}`] = item.code;
  //             }
  //           }
  //         });
  //         return rowData;
  //       });
  //     }

  //     setSelectedGrades(result.variationsCode || []);
  //     reset(result);
  //   } catch (error) {
  //     resolveResponse(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const update = () => {
    const body = generateBody();
    sendBody(body);
  };

  const generateBody = () => {
    const values = getValues();
    const body: any = { ...values };
    const allUsedVariationCodes = new Set<string>();

    body.variations = values.variations.map((item: any) => {
      const attributes: { key: string; value: string }[] = [];
      
      Object.entries(item)
        .filter(([key, val]) => key.startsWith("variationItemId_") && val)
        .forEach(([key, val]) => {
          const gradeCode = key.split("_")[1];
          const variation = variationTypes.find(v => v.code === gradeCode);
          
          if (variation) {
            allUsedVariationCodes.add(variation.code);
            const variationItem = variation.items.find(i => i.code === val);
            if (variationItem) {
              attributes.push({ key: variation.name, value: variationItem.value });
            }
          }
        });

      return {
        barcode: item.barcode,
        stock: Number(item.stock),
        variationId: item.variationId || variationTypes.find(v => v.code === Array.from(allUsedVariationCodes)[0])?.id,
        variationItemId: item.variationItemId || "VAR",
        attributes,
        serials: item.serials
      };
    });

    body.variationsCode = Array.from(allUsedVariationCodes);
    return body;
  };

  const toggleGrade = (gradeId: string) => {
    setSelectedGrades(prev => 
      prev.includes(gradeId) ? prev.filter(i => i !== gradeId) : [...prev, gradeId]
    );
  };

  const addNewLine = async () => {
    append({
      barcode: "",
      stock: 0,
      code: "",
      variationId: "",
      variationItemId: "",
      value: "",
      serials: [{
        code: "",
        cost: 0,
        price: 0,
        hasAvailable: true
      }]
    });

    // update();
  };
  
  const updateLine = async () => {
    update();
  };
  
  const removeVariation = async (index: number) => {
    remove(index);
    // update();
  };

  const updateSerial = async () => {
    const newList = watch("variations");
    // console.log(newList)
    // const body = generateBody();

    // const totalCost = serials.reduce((acc, item) => acc + Number(item.cost), 0);
    // const totalPrice = serials.reduce((acc, item) => acc + Number(item.price), 0);
    // console.log(variations[currentVariation])
    // console.log(serials)
    newList[currentVariation].serials = serials;
    // body.cost = totalCost / serials.length;
    // body.price = totalPrice / serials.length;
    console.log(newList)
    setModalSerial(false);
  };

  useEffect(() => {
    const initial = async () => {
      const { data } = await api.get(`/variations/select?deleted=false`, configApi());
      const types = data.result.data;
      setVariationTypes(types);

      const newList = variations.map((v: any) => {
        const rowData: any = { ...v };

        v.attributes?.forEach((attr: any) => {
          const variationType = types.find((t: any) => t.name === attr.key);
          if (variationType) {
            const item = variationType.items.find((i: any) => i.value === attr.value);
            if (item) {
              rowData[`variationItemId_${variationType.code}`] = item.code;
            }
          }
        });
        return rowData;
      });

      
      if(variations.length > 0) {
        setValue("variations", newList);
        setSelectedGrades(variationsCode);
      };
      
      if (variations.length == 0 && isInitialMount.current) {
        Array.from({ length: lineDefault }).forEach(() => {
          append({
            barcode: "",
            stock: qtdStock,
            code: "",
            variationId: "",
            variationItemId: "",
            value: "",
            serials: [
              {
                code: "",
                cost: 0,
                price: 0,
                hasAvailable: true
              }
            ]
          });
        });

        isInitialMount.current = false;
      };
    };
    initial();
  }, [productId]);

  return (
    <>
      <ComponentCard title="Variações" hasHeader={false} className="max-h-[calc(100dvh-22rem)] overflow-y-auto">
        <div className="flex flex-wrap gap-6 mb-4 px-2">
          {variationTypes.map(v => (
            <div key={v.code}>
              <Label title={v.name} required={false} />
              <input checked={selectedGrades.includes(v.code)} onChange={() => toggleGrade(v.code)} className="w-5 h-5 appearance-none cursor-pointer dark:border-gray-700 border border-gray-300 checked:border-transparent rounded-md checked:bg-brand-500 disabled:opacity-60" type="checkbox"/>
            </div>
          ))}
        </div>

        <div className="erp-container-table rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3 mb-3">
          <div className="max-w-full overflow-x-auto tele-container-table">
            <div className="min-w-[1102px] divide-y">
              <Table className="divide-y">
                <TableHeader className="border-b border-gray-100 dark:border-white/5 tele-table-thead">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Código de Barras</TableCell>
                    {selectedGrades.map(gradeId => (
                      <TableCell key={gradeId} className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">
                        {variationTypes.find(t => t.code === gradeId)?.name}
                      </TableCell>
                    ))}
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Estoque Atual</TableCell>
                    {
                      (btnEdit || btnDelete || btnAddSerial) &&
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ações</TableCell>
                    }
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                  {fields.map((field, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">
                        <input {...register(`variations.${index}.barcode`)} maxLength={40} placeholder="Código de barras"className="input-erp-primary input-erp-default w-full"/>
                      </TableCell>

                      {selectedGrades.map(gradeId => {
                        const currentGrade = variationTypes.find(t => t.code === gradeId);

                        return (
                          <TableCell key={gradeId} className="px-5 py-4">
                            <select 
                              {...register(`variations.${index}.variationItemId_${gradeId}` as any)} 
                              className="input-erp-primary input-erp-default w-full"
                            >
                              <option value="">Selecione...</option>
                              {currentGrade?.items?.map((item: any, j: number) => {
                                return (
                                  item.code && item.value &&
                                  <option key={j} value={item.code}>
                                    {item.value}
                                  </option>
                                )
                              })}
                            </select>
                          </TableCell>
                        );
                      })}

                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">
                        <input disabled={stockDisabled} {...register(`variations.${index}.stock`)} type="number" maxLength={40} placeholder="Estoque Atual" className="input-erp-primary input-erp-default w-full"/>
                      </TableCell>

                      {
                        (btnEdit || btnDelete || btnAddSerial) &&
                        <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-500 dark:text-gray-400">
                          <div key={index} className="flex gap-3"> 
                            {
                              btnEdit &&
                              <div onClick={updateLine} className="cursor-pointer text-green-400 hover:text-green-500 text-lg">
                                <MdCheck />
                              </div>      
                            }
                            {
                              btnDelete &&
                              <div onClick={() => removeVariation(index)} className="cursor-pointer text-red-400 hover:text-red-500">
                                <FaTrash />
                              </div>      
                            }
                            {
                              btnAddSerial &&
                              <div onClick={() => {
                                // const stockCount = variations[index].stock;
                                // const serial = variations[index].serials;
                                const stockCount = Number(getValues(`variations.${index}.stock`)) || 0;
                                console.log(stockCount)
                                const serial = getValues(`variations.${index}.serials`);
                                
                                // if (id && id !== "create") {
                                  //   const body = {...getValues()};
                                  //   setSerial(body.variations[index].serials);
                                  // } else {};
                                  
                                if(serial.length == 0) {
                                  console.log(stockCount)
                                  console.log(serial)
                                  const initialSerials = Array.from({ length: stockCount }, () => ({
                                    code: "",
                                    cost: 0,
                                    price: 0,
                                    hasAvailable: true
                                  }));
                                  console.log(initialSerials)

                                  setSerial(initialSerials);
                                } else {
                                  setSerial(serial);
                                }     

                                setCurrentVariation(index);
                                setModalSerial(true);
                              }} className="cursor-pointer text-blue-400 hover:text-blue-500 text-lg">
                                <MdOutlineQrCodeScanner />
                              </div>   
                            }
                          </div>
                        </TableCell>
                      }

                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        {
          btnAdd &&
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={addNewLine} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-green-700 transition-colors">
              <FaPlus size={12} /> Adicionar nova variação
            </button>
          </div>
        }
      </ComponentCard>
      
      {
        btnCancel &&
        <Button onClick={() => {
          if(sendCancel) sendCancel();
        }} variant="outline" type="button" className="w-full md:max-w-20 mt-2 me-2" size="sm">Cancelar</Button>
      }

      {
        btnSave &&
        <Button onClick={() => update()} type={typeBtnSave} className="w-full md:max-w-20 mt-2" size="sm">Salvar</Button>
      }

      <Modal isOpen={modalSerial} onClose={() => setModalSerial(false)} className={`m-4 w-[80dvw] max-w-200 bg-red-400`}>
        <div className={`no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11`}>
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Serial</h4>
          </div>

          <form className="flex flex-col">
            <div className={`max-h-[70dvh] custom-scrollbar overflow-y-auto px-2 pb-3`}>
              <div className="grid grid-cols-8 gap-4 mb-2">
                <div className="text-start text-gray-500 dark:text-gray-400 col-span-8 lg:col-span-4">Nº do Serial</div>
                <div className="text-start text-gray-500 dark:text-gray-400 col-span-8 lg:col-span-2">Custo</div>
                <div className="text-start text-gray-500 dark:text-gray-400 col-span-8 lg:col-span-2">Preço</div>
              </div>

              {
                serials.map((serial: TSerial, index: number) => {
                  return (
                    <div key={index} className="grid grid-cols-8 gap-4 mb-3">
                      
                      <div className="col-span-8 lg:col-span-4">
                        <input onInput={(e: any) => {
                          serials[index].code = e.target.value;
                        }} maxLength={50} defaultValue={serials[index].code} placeholder="Digite" type="text" className="input-erp-primary input-erp-default"/>
                      </div>

                      <div className="col-span-8 lg:col-span-2">
                        <Controller
                          name="cost"
                          control={control}
                          defaultValue={0}
                          render={({ field: { onChange, value } }) => (
                            <NumericFormat
                              className="input-erp-primary input-erp-default" 
                              value={serials[index].cost}
                              onValueChange={(values) => {
                                serials[index].cost = values.floatValue ? values.floatValue : 0;
                              }}
                              thousandSeparator="."
                              decimalSeparator=","
                              prefix="R$ "
                              decimalScale={2}
                              fixedDecimalScale
                              allowNegative={false}
                              placeholder="Custo"
                            />
                          )}
                        />
                      </div>
                      
                      <div className="col-span-8 lg:col-span-2">
                        <Controller
                          name="price"
                          control={control}
                          defaultValue={0}
                          render={({ field: { onChange, value } }) => (
                            <NumericFormat
                              className="input-erp-primary input-erp-default" 
                              value={serials[index].price}
                              onValueChange={(values) => {
                                serials[index].price = values.floatValue ? values.floatValue : 0;
                              }}
                              thousandSeparator="."
                              decimalSeparator=","
                              prefix="R$ "
                              decimalScale={2}
                              fixedDecimalScale
                              allowNegative={false}
                              placeholder="Preço"
                            />
                          )}
                        />
                      </div>                        
                    </div>
                  )
                })
              }
            </div>
            
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={() => setModalSerial(false)}>Cancelar</Button>
              <Button size="sm" variant="primary" onClick={() => {
                updateSerial();
              }}>Salvar</Button>
            </div>
          </form>
        </div>
      </Modal> 
    </>
  );
}