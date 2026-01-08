"use client";

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
            console.log(pathname.split("/")[1])
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

            setUserLogger({
                name: name ? name : "",
                email: email ? email : "",
                photo: photo ? photo : "",
                nameCompany: nameCompany ? nameCompany : "",
                nameStore: nameStore ? nameStore : ""
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