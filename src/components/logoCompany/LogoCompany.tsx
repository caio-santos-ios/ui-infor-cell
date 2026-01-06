"use cliente";

import { uriBase } from "@/service/api.service";
import Image from "next/image"
import { useEffect, useState } from "react";

type TProp = {
    width: number;
    height: number
}

export const CompanyLogo = ({width, height}: TProp) => {
    const [logoCompany, setLogoCompany] = useState<string>("");

    const normalizeLogoCompany = () => {
        return `${uriBase}/${logoCompany}`;
    };

    useEffect(() => {
        const logo = localStorage.getItem("logoCompany");
        if(logo) {
            setLogoCompany(logo)
        };
    }, []);

    return (
        <div className="flex justify-center items-center w-full m-auto">
            {
                logoCompany ?
                <img style={{width: `${width}px`, height: `${height}px`}} className="w-full h-full object-cover" src={normalizeLogoCompany()} alt="logo da empresa" />
                :
                <div className="border border-dashed border-(--erp-primary-color) p-3 text-(--erp-primary-color)">Logo da Empresa</div>
            }
        </div>
    )
}