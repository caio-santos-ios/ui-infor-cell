"use cliente";

import Image from "next/image"
import { useEffect, useState } from "react";

type TProp = {
    width: number;
    height: number
}

export const CompanyLogo = ({width, height}: TProp) => {
    const [logoCompany, setLogoCompany] = useState<string>("");

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
                <Image
                    src="/assets/images/logo-2.png"
                    alt="Logo"
                    width={width}
                    height={height}
                    />
                :
                <div className="border border-dashed border-(--erp-primary-color) p-3 text-(--erp-primary-color)">Logo da Empresa</div>
            }
        </div>
    )
}