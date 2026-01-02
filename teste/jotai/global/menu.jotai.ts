import { TMenuRoutine } from "@/types/global/menu.type";
import { atom } from "jotai";

export const menuOpenAtom = atom<boolean>(false);
export const menuRoutinesAtom = atom<TMenuRoutine[]>([
    {
        code: '1',
        isOpen: true,
        authorized: false,
        description: 'Cadastro',
        icon: 'FiGrid',
        link: '',
        padding: 'px-2',
        subMenu: [
            {
                code: 'A11',
                isOpen: true,
                subMenu: [],
                description: 'Usuários',
                icon: '',
                link: 'master-data/users',
                padding: 'px-4',
                authorized: false,
                permissions: {
                    create: false,
                    update: false,
                    read: false,
                    delete: false
                }
            },     
            // {
            //     code: 'A12',
            //     isOpen: true,
            //     subMenu: [],
            //     description: 'Clientes',
            //     icon: '',
            //     link: 'master-data/customers',
            //     padding: 'px-4',
            //     authorized: false,
            //     permissions: {
            //         create: false,
            //         update: false,
            //         read: false,
            //         delete: false
            //     }
            // },          
            {
                code: 'A23',
                isOpen: true,
                subMenu: [],
                description: 'Tabelas Genérica',
                icon: '',
                link: 'master-data/generic-tables',
                padding: 'px-4',
                authorized: false,
                permissions: {
                    create: false,
                    update: false,
                    read: false,
                    delete: false
                }
            },            
            {
                code: 'A24',
                isOpen: true,
                subMenu: [],
                description: 'Fornecedores',
                icon: '',
                link: 'master-data/suppliers',
                padding: 'px-4',
                authorized: false,
                permissions: {
                    create: false,
                    update: false,
                    read: false,
                    delete: false
                }
            }           
        ],
    },
    {
        code: '0',
        isOpen: true,
        authorized: true,
        description: 'Sair',
        icon: '',
        link: '/',
        padding: 'px-2',
        subMenu: []
    }
]);