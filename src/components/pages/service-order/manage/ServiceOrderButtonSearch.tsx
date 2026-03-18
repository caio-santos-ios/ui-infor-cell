"use client";

import { IconSearch } from "@/components/iconSearch/IconSearch";
import { serviceOrderModalSearchAtom, serviceOrderSearchAtom } from "@/jotai/serviceOrder/manege.jotai";
import { useAtom } from "jotai";
import { useEffect } from "react";

export const ServiceOrderButtonSearch = () => {
    const [modalSearch, setModalSearch] = useAtom(serviceOrderModalSearchAtom);
    const [search] = useAtom(serviceOrderSearchAtom);

    return <IconSearch getObj={() => {setModalSearch(true); console.log(modalSearch)}} variant="outline" active={search} />
}