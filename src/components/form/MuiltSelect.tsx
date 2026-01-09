'use client'

import React, { useState, useEffect, useRef } from "react";

interface Option {
  value: string;
  text: string;
  selected: boolean;
}

interface MultiSelectProps {
  options: Option[];
  selectedValues?: string[]; // Mudamos para ser controlado
  onChange?: (selected: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedValues = [],
  onChange,
  disabled = false,
  placeholder = "Selecione uma opção",
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(selectedValues);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sincroniza o estado interno quando os valores mudam externamente (ex: via useEffect do pai)
  useEffect(() => {
    setSelectedOptions(selectedValues);
  }, [selectedValues]);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (optionValue: string) => {
    const newSelectedOptions = selectedOptions.includes(optionValue)
      ? selectedOptions.filter((value) => value !== optionValue)
      : [...selectedOptions, optionValue];

    setSelectedOptions(newSelectedOptions);
    if (onChange) onChange(newSelectedOptions);
  };

  const removeOption = (e: React.MouseEvent, value: string) => {
    e.stopPropagation(); // Impede de abrir/fechar o dropdown ao clicar no 'x'
    const newSelectedOptions = selectedOptions.filter((opt) => opt !== value);
    setSelectedOptions(newSelectedOptions);
    if (onChange) onChange(newSelectedOptions);
  };

  const selectedValuesText = selectedOptions.map(
    (value) => options.find((option) => option.value === value)?.text || ""
  );

  return (
    <div className="relative z-20 inline-block w-full" ref={containerRef}>
      <div className="relative flex flex-col items-center">
        <div onClick={toggleDropdown} className="w-full cursor-pointer">
          <div className="flex min-h-11 h-auto rounded-lg border border-gray-300 py-1.5 pl-3 pr-3 shadow-theme-xs outline-hidden transition focus-within:border-brand-300 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex flex-wrap flex-auto gap-2">
              {selectedOptions.length > 0 ? (
                selectedOptions.map((value, index) => {
                  const option = options.find((o) => o.value === value);
                  return (
                    <div
                      key={value}
                      className="group flex items-center justify-center rounded-full border-[0.7px] border-transparent bg-gray-100 py-1 pl-2.5 pr-2 text-sm text-gray-800 dark:bg-gray-800 dark:text-white/90"
                    >
                      <span className="flex-initial max-w-full">{option?.text}</span>
                      <div
                        onClick={(e) => removeOption(e, value)}
                        className="pl-2 text-gray-500 cursor-pointer hover:text-red-500 dark:text-gray-400"
                      >
                        <svg className="fill-current" width="14" height="14" viewBox="0 0 14 14">
                          <path d="M3.40717 4.46881C3.11428 4.17591 3.11428 3.70104 3.40717 3.40815C3.70006 3.11525 4.17494 3.11525 4.46783 3.40815L6.99943 5.93975L9.53095 3.40822C9.82385 3.11533 10.2987 3.11533 10.5916 3.40822C10.8845 3.70112 10.8845 4.17599 10.5916 4.46888L8.06009 7.00041L10.5916 9.53193C10.8845 9.82482 10.8845 10.2997 10.5916 10.5926C10.2987 10.8855 9.82385 10.8855 9.53095 10.5926L6.99943 8.06107L4.46783 10.5927C4.17494 10.8856 3.70006 10.8856 3.40717 10.5927C3.11428 10.2998 3.11428 9.8249 3.40717 9.53201L5.93877 7.00041L3.40717 4.46881Z" />
                        </svg>
                      </div>
                    </div>
                  );
                })
              ) : (
                <span className="p-1 text-sm text-gray-400">{placeholder}</span>
              )}
            </div>
            <div className="flex items-center w-7">
              <svg
                className={`transition-transform ${isOpen ? "rotate-180" : ""} text-gray-400`}
                width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor"
              >
                <path d="M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="absolute left-0 z-99 w-full mt-1 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 top-full max-h-60 dark:bg-gray-900 dark:border-gray-700">
            <div className="flex flex-col">
              {options.map((option) => {
                const isSelected = selectedOptions.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-0 ${isSelected ? "bg-blue-50/50 dark:bg-blue-900/20" : ""}`}
                    onClick={() => handleSelect(option.value)}
                  >
                    <span className="text-sm text-gray-800 dark:text-white/90">{option.text}</span>
                    {isSelected && (
                       <svg className="text-blue-500" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                       </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelect;