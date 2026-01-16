"use client";

import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import { GoAlert } from "react-icons/go";

type TProp = {
    isOpen: boolean;
    closeModal: () => void;
    confirm: () => void;
    title: string;
};

export const ModalDelete = ({isOpen, closeModal, confirm, title}: TProp) => {
    return (
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
            <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                <div className="px-2 pr-14">
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                        {title}
                    </h4>
                </div>

                <form className="flex flex-col">
                    <div className="custom-scrollbar h-[150px] overflow-y-auto px-2 pb-3">
                        <div className="mt-7">
                            <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                                <div className="h-full flex col-span-1 justify-center items-center flex-col">
                                    <GoAlert className="text-red-600" size={80} />
                                    <h1 className="font-semibold text-lg text-gray-800 dark:text-white/90">Deseja excluir esse registro?</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                        <Button size="sm" variant="outline" onClick={closeModal}>Cancelar</Button>
                        <Button size="sm" variant="primary" onClick={confirm}>Confirmar</Button>
                    </div>
                </form>
            </div>
        </Modal>    
    )
}