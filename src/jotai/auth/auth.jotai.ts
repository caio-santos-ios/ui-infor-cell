import { ResetUserLogged, TUserLogged } from "@/types/user/user.type";
import { atom } from "jotai";

export const userLoggerAtom = atom<TUserLogged>(ResetUserLogged);
export const syncAtom = atom<boolean>(false);
export const userAdmin = atom<boolean>(false);