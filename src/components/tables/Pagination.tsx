type TProps = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  totalData: number;
  onPageChange: (page: number) => void;
};

const Pagination = ({currentPage, totalData, totalPages, totalCount, onPageChange}: TProps) => {
  return (
    <div className="flex justify-between">
      <h4 className="text-gray-700 dark:text-gray-400">Mostrando {totalCount} de {totalData}</h4>
      <div className="flex items-center">

        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="mr-2.5 flex items-center h-10 justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 text-sm">
          Anterior
        </button>

        <div className="flex items-center gap-2">
          {currentPage > 3 && <span className="px-2">...</span>}
          {Array.from({length: totalPages}, (_, page) => (
            <button key={page + 1} onClick={() => onPageChange(page + 1)} className={`px-4 py-2 rounded ${currentPage === page + 1? "bg-brand-500 text-white": "text-gray-700 dark:text-gray-400"} flex w-10 items-center justify-center h-10 rounded-lg text-sm font-medium hover:bg-blue-500/8 hover:text-brand-500 dark:hover:text-brand-500`}>
              {page + 1}
            </button>
          ))}
          {currentPage < totalPages - 2 && <span className="px-2">...</span>}
        </div>
        
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="ml-2.5 flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs text-sm hover:bg-gray-50 h-10 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3" >
          Próximo
        </button>

      </div>
    </div>
  );
};

export default Pagination;
