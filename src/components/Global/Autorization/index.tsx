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

    useEffect(() => {
        const localToken = localStorage.getItem("token");
        const token = localToken ? localToken : "";

        if(!token) {
            setUserLogger(ResetUserLogged);
            if(!pathname.includes("/reset-password")) {
                router.push("/");
                removeLocalStorage();
                setIsAdmin(false);
            };
        } else {
            const admin = localStorage.getItem("admin");
            const name = localStorage.getItem("name");
            const email = localStorage.getItem("email");
            const photo = localStorage.getItem("photo");

            setUserLogger({
                name: name ? name : "",
                email: email ? email : "",
                photo: photo ? photo : ""
            });
            
            setIsAdmin(admin == 'true');

            if(admin == "true") {
                if(pathname == "/" || pathname == "/reset-password") {
                    router.push("/dashboard");
                };
            } else {
                if(pathname == "/" || pathname == "/reset-password") {
                    router.push("/master-data/profile");
                };
            };
        };
    }, [pathname, router]);

    return <></>
}