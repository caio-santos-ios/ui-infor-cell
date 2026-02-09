"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { ChevronDownIcon } from "../icons/index";
import { useAtom } from "jotai";
import { iconAtom } from "@/jotai/global/icons.jotai";
import { syncAtom, userAdmin } from "@/jotai/auth/auth.jotai";
import { CompanyLogo } from "@/components/logoCompany/LogoCompany";
import { NavItem } from "@/types/global/menu.type";

const staticNavItems: NavItem[] = [
  {
    icon: "FiGrid",
    name: "Cadastros",
    authorized: false,
    code: "A",
    subItems: [
      {name: "Empresas", path: "/master-data/companies", code: "A1", pro: false, authorized: false },
      {name: "Lojas", path: "/master-data/stores", code: "A2", pro: false, authorized: false },
      {name: "Profissionais", path: "/master-data/employees", code: "A3", pro: false, authorized: false },
      {name: "Clientes", path: "/master-data/customers", code: "A4", pro: false, authorized: false },
      {name: "Fornecedores", path: "/master-data/suppliers", code: "A5", pro: false, authorized: false },
      {name: "Permissões de Usuário", path: "/master-data/profile-permission", code: "F1", pro: false, authorized: false },
    ]
  },
  {
    icon: "MdShoppingBag",
    name: "Gestão Produtos",
    authorized: false,
    code: "B",
    subItems: [
      {name: "Produtos", path: "/product/products", code: "B1", pro: false, authorized: false },
      {name: "Categorias", path: "/product/categories", code: "B2", pro: false, authorized: false },
      {name: "Marcas", path: "/product/brands", code: "B4", pro: false, authorized: false },
      {name: "Grupos de Produtos", path: "/product/models", code: "B3", pro: false, authorized: false },
      {name: "Variações", path: "/product/variations", code: "B5", pro: false, authorized: false }
    ]
  },
  {
    icon: "FaHandshake",
    name: "Comercial",
    authorized: false,
    code: "C",
    subItems: [
      {name: "Pedidos de Vendas", path: "/commercials/sales-orders", code: "C1", pro: false, authorized: false },
      {name: "Orçamentos", path: "/commercials/budgets", code: "C2", pro: false, authorized: false },
    ]
  },
  {
    icon: "MdBuild",
    name: "Ordens de Serviços",
    authorized: false,
    code: "D",
    subItems: [
      {name: "Gerenciar O.S.", path: "/order-services/manages", code: "D1", pro: false, authorized: false },
      {name: "Painel", path: "/order-services/panel", code: "D2", pro: false, authorized: false },
    ]
  },
  {
    icon: "MdInventory",
    name: "Estoque",
    authorized: false,
    code: "F",
    subItems: [
      {name: "Posição de Estoque", path: "/stock/stock-position", code: "F1", pro: false, authorized: false },
      {name: "Transferências", path: "/stock/transfer", code: "F2", pro: false, authorized: false },
      {name: "Trocas e Devoluções", path: "/stock/exchanges", code: "F3", pro: false, authorized: false },
    ]
  },
  {
    icon: "MdShoppingCart",
    name: "Compras",
    authorized: false,
    code: "G",
    subItems: [
      {name: "Pedidos de Compras", path: "/purchase/purchase-order", code: "G1", pro: false, authorized: false }
    ]
  },
  {
    icon: "MdAttachMoney",
    name: "Financeiro",
    authorized: false,
    code: "F",
    subItems: [
      {name: "Formas de Pagamentos", path: "/financial/payment-methods", code: "F1", pro: false, authorized: false }
    ]
  }
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [icons] = useAtom(iconAtom);
  const [isAdmin] = useAtom(userAdmin);
  const [openSubmenu, setOpenSubmenu] = useState<{ index: number } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [filteredNav, setFilteredNav] = useState<NavItem[]>([]);

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) => (prev?.index === index ? null : { index }));
  };

  const getAuthorizedMenu = useCallback(() => {
    if (typeof window === "undefined") return [];

    const modulesStr = localStorage.getItem("modules");
    const masterStr = localStorage.getItem("master");
    const isMaster = masterStr ? masterStr == "true" : false;

    if (!modulesStr) return staticNavItems;

    const modules: any[] = JSON.parse(modulesStr);

    return staticNavItems.map((item) => {
      const newItem = { ...item };

      if(isMaster) {
        newItem.authorized = true;
        newItem.subItems = newItem.subItems?.map((sub) => ({
          ...sub,
          authorized: true
        }));
      } else {
        const foundModule = modules.find((m: any) => m.code === newItem.code);
  
        if (foundModule && foundModule.routines.length > 0) {
          newItem.authorized = true;
          newItem.subItems = newItem.subItems?.map((sub) => ({
            ...sub,
            authorized: foundModule.routines.some((r: any) => r.code === sub.code)
          }));
        }
      }

      return newItem;
    });
  }, []);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  useEffect(() => {
    setFilteredNav(getAuthorizedMenu());
  }, [getAuthorizedMenu]);

  return (
    <aside 
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-2 border-r border-gray-200 
      ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"} 
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link href={`${isAdmin ? '/dashboard' : '/master-data/profile'}`} className="w-full flex justify-center">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="hidden lg:flex">
              <CompanyLogo width={80} height={80} />
            </div>
          ) : (
            <CompanyLogo width={40} height={40} />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <ul className="flex flex-col gap-4">
            {filteredNav.map((nav, index) => {
              const IconComponent = nav.icon ? icons[nav.icon] : null;
              const hasAccess = nav.authorized || isAdmin;

              if (!hasAccess) return null;

              return (
                <li key={nav.name}>
                  {nav.subItems ? (
                    <>
                      <button 
                        onClick={() => handleSubmenuToggle(index)}
                        className={`menu-item group ${openSubmenu?.index === index ? "menu-item-active" : "menu-item-inactive"} cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
                      >
                        <span className={openSubmenu?.index === index ? "menu-item-icon-active" : "menu-item-icon-inactive"}>
                          {IconComponent && <IconComponent size={15} />}
                        </span>
                        {(isExpanded || isHovered || isMobileOpen) && (
                          <>
                            <span className="menu-item-text">{nav.name}</span>
                            <ChevronDownIcon className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.index === index ? "rotate-180 text-brand-500" : ""}`} />
                          </>
                        )}
                      </button>

                      <div 
                        ref={(el) => { subMenuRefs.current[`${index}`] = el; }} 
                        className="overflow-hidden transition-all duration-300" 
                        style={{ height: openSubmenu?.index === index ? `${subMenuHeight[`${index}`]}px` : "0px" }}
                      >
                        <ul className="mt-2 space-y-1 ml-9">
                          {nav.subItems.map((subItem) => (subItem.authorized || isAdmin) && (
                            <li key={subItem.name}>
                              <Link 
                                href={subItem.path} 
                                className={`menu-dropdown-item ${isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}
                              >
                                {subItem.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <Link href={nav.path || "#"} className={`menu-item group ${isActive(nav.path || "") ? "menu-item-active" : "menu-item-inactive"}`}>
                      <span className={isActive(nav.path || "") ? "menu-item-icon-active" : "menu-item-icon-inactive"}>
                        {IconComponent && <IconComponent size={15} />}
                      </span>
                      {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;