"use client";

import { boxSettingModalAtom } from "@/jotai/commercial/box/box.jotai";
import { useAtom } from "jotai";
import { TbSettingsSearch } from "react-icons/tb";

export const SalesOrderSettingsButtonCreate = () => {
    const [_, setModal] = useAtom(boxSettingModalAtom);

    return (
        <div onClick={() => setModal(true)} className="bg-brand-500 text-white shadow-theme-xs rounded-e-2xl px-2 py-2 hover:bg-brand-600 disabled:bg-brand-300 absolute z-99 start-0 cursor-pointer">
            <TbSettingsSearch size={40} />
        </div>
    )
}