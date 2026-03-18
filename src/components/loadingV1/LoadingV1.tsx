"use client";

import "./style.css";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";

export const LoadingV1 = () => {
    const [loading] = useAtom(loadingAtom);
    
    return (
        loading &&
        <div className="loading-overlay bg-white dark:bg-gray-900">
            <div className="container-loader">
                <div className="loader"></div>
                <p className="title-loader">Carregando...</p>
            </div>
        </div>
    )
}