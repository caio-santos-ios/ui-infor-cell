"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import Button from "../ui/button/Button";
import { FaCheck } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { MdStarBorder } from "react-icons/md";
import { MdStarHalf } from "react-icons/md";
import { MdStar } from "react-icons/md";
import { MdDiamond } from "react-icons/md";


export const ListPlan = () => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [plans, setPlan] = useState([
        {
            name: "Platina",
            price: 'R$ 379,00/Mês',
            value: 379,
            discount: 'R$ 583,08',
            items: [
                {text: "Emissão de boletos", valid: true},
                {text: "Emissão de notas fiscais", valid: true},
                {text: "Layout e domínio personalizado", valid: true},
                {text: "3 empresas/lojas", valid: true},
                {text: "7 usuários", valid: true}
            ]
        },
        {
            name: "Ouro",
            price: 'R$ 289,00/mês',
            value: 289,
            discount: 'R$ 444,62',
            items: [
                {text: "Emissão de boletos", valid: true},
                {text: "Emissão de notas fiscais", valid: true},
                {text: "Layout e domínio personalizado", valid: true},
                {text: "2 empresas/lojas", valid: true},
                {text: "5 usuários", valid: true}
            ]
        },
        {
            name: "Prata",
            price: 'R$ 199,00/mês',
            value: 199,
            discount: 'R$ 306,15',
            items: [
                {text: "Emissão de boletos", valid: true},
                {text: "Emissão de notas fiscais", valid: true},
                {text: "Layout e domínio personalizado", valid: false},
                {text: "1 empresa/loja", valid: true},
                {text: "3 usuários", valid: true}
            ]
        },
        {
            name: "Bronze",
            price: 'R$ 119,00/mês',
            value: 119,
            discount: 'R$ 183,08',
            items: [
                {text: "Emissão de boletos", valid: false},
                {text: "Emissão de notas fiscais", valid: false},
                {text: "Layout e domínio personalizado", valid: false},
                {text: "1 empresa/loja", valid: true},
                {text: "1 usuário", valid: true}
            ]
        }
    ])
    
    const getAll = async () => {
        setLoading(false);
    };

    useEffect(() => {
        getAll();
    }, []);

    return (
        <ul className="w-[80dvw] h-96 grid grid-cols-1 lg:grid-cols-4 gap-4">
            {
                plans.map((p: any, index: number) => {
                    return (
                        <div className="grid grid-cols-1 rounded-xl border border-gray-200 p-4 sm:p-6 dark:border-gray-800" key={index}>
                            <div className="flex items-center gap-2 text-2xl font-medium text-gray-800 dark:text-white/90">
                                <h3>{p.name}</h3>
                                {
                                    p.name == "Bronze" &&
                                    <MdStarBorder />
                                }
                                {
                                    p.name == "Prata" &&
                                    <MdStarHalf />
                                }
                                {
                                    p.name == "Ouro" &&
                                    <MdStar />
                                }
                                {
                                    p.name == "Platina" &&
                                    <MdDiamond  />
                                }
                            </div>
                            <div className="text-center text-xl font-medium text-gray-800 dark:text-white/90">
                                <h3 className="line-through decoration-gray-800 dark:decoration-white/90">{p.discount}</h3>
                                <h3 className="">{p.price}</h3>
                            </div>
                            <ul className="flex flex-col mb-3">
                                {
                                    p.items.map((i: any, ind: number) => {
                                        return ( 
                                            <div key={ind} className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                                {
                                                    i.valid ? <FaCheck /> : <IoMdClose size={15} />
                                                }

                                                <span className={`${i.valid ? '' : 'line-through decoration-gray-800 dark:decoration-white/90'}`}>{i.text}</span>
                                            </div>
                                        )
                                    })
                                }
                            </ul>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full self-end" size="sm">Selecionar</Button>
                        </div>
                    )
                })
            }
        </ul>
    )
}