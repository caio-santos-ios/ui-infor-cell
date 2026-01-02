import { atom } from "jotai";

// export const paginationAtom = atom<TPagination>({
//     data: [],
//     totalPages: 100,
//     currentPage: 1,
//     sizePage: 10
// });

export const paginationAtom = atom<any>({
    data: [],
    totalPages: 1,
    totalCount: 100,
    currentPage: 1,
    sizePage: 10 
})