"use client";

import "./style.css";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { userAdmin, userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { ResetUserLogged } from "@/types/user/user.type";
import { removeLocalStorage } from "@/service/config.service";

export const Autorization = () => {
    const [_, setUserLogger] = useAtom(userLoggerAtom);
    const [__, setIsAdmin] = useAtom(userAdmin);
    const router = useRouter();
    const pathname = usePathname();

    return <></>
}