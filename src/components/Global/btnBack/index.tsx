"use cliente";

import Link from "next/link";

export const BtnBack = ({uri}: {uri: string}) => {
    return (
        <Link href={uri} className="flex w-full items-center justify-end gap-2"> 
          <div className="rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200 lg:inline-flex lg:w-auto">
            Voltar
          </div>
        </Link>
    )
}