"use client";

import { useAtom } from "jotai";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { userAdmin, userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { ResetUserLogged } from "@/types/user/user.type";
import { removeLocalStorage } from "@/service/config.service";
import { loadingAtom } from "@/jotai/global/loading.jotai";

export const Autorization = () => {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [__, setUserLogger] = useAtom(userLoggerAtom);
    const [___, setIsAdmin] = useAtom(userAdmin);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const localToken = localStorage.getItem("token");
        const token = localToken ? localToken : "";

        if(!token) {
            setUserLogger(ResetUserLogged);
            setIsLoading(false);

            if(!["reset-password", "signup", "new-code-confirm", "confirm-account"].includes(pathname.split("/")[1])) {
                router.push("/");
                removeLocalStorage();
                setIsAdmin(false);
            };
        } else {
            const admin = localStorage.getItem("admin");
            const name = localStorage.getItem("name");
            const email = localStorage.getItem("email");
            const photo = localStorage.getItem("photo");
            const nameCompany = localStorage.getItem("nameCompany");
            const nameStore = localStorage.getItem("nameStore");
            const typeUser = localStorage.getItem("typeUser");

            setUserLogger({
                name: name ? name : "",
                email: email ? email : "",
                photo: photo ? photo : "",
                nameCompany: nameCompany ? nameCompany : "",
                nameStore: nameStore ? nameStore : "",
                typeUser: typeUser ? typeUser : ""
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