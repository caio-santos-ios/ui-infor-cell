"use client";

import React, { useEffect, useRef, useState,useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";
import { Logo } from "@/components/global/logo";
import { useAtom } from "jotai";
import { iconAtom } from "@/jotai/global/icons.jotai";
import { syncAtom, userAdmin } from "@/jotai/auth/auth.jotai";

type NavItem = {
  name: string;
  code: string;
  icon: string;
  path?: string;
  authorized: boolean;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean, code: string, authorized: boolean }[];
};

const navItems: NavItem[] = [
  // {
  //   icon: <GridIcon />,
  //   name: "Dashboard",
  //   path: "/dashboard",
  // },
  {
    icon: "FiGrid",
    name: "Cadastros",
    authorized: false,
    code: "A",
    subItems: [
      {name: "Empresas", path: "/master-data/companies", code: "A1", pro: false, authorized: false },
      {name: "Lojas", path: "/master-data/stores", code: "A2", pro: false, authorized: false },
      {name: "Usuários", path: "/master-data/users", code: "A3", pro: false, authorized: false },
    ]
  }
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [icons] = useAtom(iconAtom);
  const [sync] = useAtom(syncAtom);
  const [isAdmin] = useAtom(userAdmin);
  const [logoCompany, setLogoCompany] = useState<string>("");

  const renderMenuItems = (navItems: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => {
        const IconComponent = nav.icon ? icons[nav.icon] : null;

        return (
          <li key={nav.name}>
            {nav.subItems && (nav.authorized || isAdmin) ? (
              <button onClick={() => handleSubmenuToggle(index, menuType)}className={`menu-item group  ${openSubmenu?.type === menuType && openSubmenu?.index === index? "menu-item-active": "menu-item-inactive"} cursor-pointer ${!isExpanded && !isHovered? "lg:justify-center": "lg:justify-start"}`}>
                <span className={` ${ openSubmenu?.type === menuType && openSubmenu?.index === index ? "menu-item-icon-active" : "menu-item-icon-inactive" }`} >
                  {IconComponent && <IconComponent size={15} />}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon className={`ml-auto w-5 h-5 transition-transform duration-200  ${ openSubmenu?.type === menuType && openSubmenu?.index === index ? "rotate-180 text-brand-500" : ""}`}/>
                )}
              </button>
            ) : (
              nav.path && (nav.authorized || isAdmin) && (
                <Link href={nav.path} className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}>
                  <span className={`${ isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                    {IconComponent && <IconComponent size={15} />}
                  </span>

                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className={`menu-item-text`}>{nav.name}</span>
                  )}
                </Link>
              )
            )}
            
            {nav.subItems && (nav.authorized || isAdmin) && (isExpanded || isHovered || isMobileOpen) && (
              <div ref={(el) => {subMenuRefs.current[`${menuType}-${index}`] = el; }} className="overflow-hidden transition-all duration-300" style={{height: openSubmenu?.type === menuType && openSubmenu?.index === index ? `${subMenuHeight[`${menuType}-${index}`]}px` : "0px"}}>
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map((subItem) => (subItem.authorized || isAdmin) && (
                    <li key={subItem.name}>
                      <Link href={subItem.path} className={`menu-dropdown-item ${isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}>
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && (
                            <span className={`ml-auto ${isActive(subItem.path)? "menu-dropdown-badge-active": "menu-dropdown-badge-inactive"} menu-dropdown-badge `}>new</span>
                          )}
                          {subItem.pro && (
                            <span className={`ml-auto ${isActive(subItem.path)? "menu-dropdown-badge-active": "menu-dropdown-badge-inactive"} menu-dropdown-badge `}>
                              pro
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{type: "main" | "others"; index: number } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);
  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu &&  prevOpenSubmenu.type === menuType &&  prevOpenSubmenu.index === index) {
        return null;
      };

      return { type: menuType, index };
    });
  };

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  useEffect(() => {
    const modulesStr = localStorage.getItem("modules");

    if(modulesStr) {
      const modules: any[] = JSON.parse(modulesStr);
      // console.log(modules)
      // menu.map((x: TMenuRoutine) => {
      //   if(x.subMenu.length > 0) {
      //     x.authorized = false;

      //     const indexModule = modules.findIndex((m: any) => m.code == x.code);
      //     if(indexModule >= 0) {
      //         const routines: any[] = modules[indexModule].routines;
      //         if(routines.length > 0) {
      //             x.authorized = true;

      //             x.subMenu.map((sub: TMenuRoutine) => {
      //                 if(routines.find((r: any) => r.code == sub.code)) {
      //                     sub.authorized = true;
      //                 };
                      
      //                 return sub;
      //             })
      //         };                      
      //     };

      //     return x;
      //   } else {
      //     return x;
      //   }
      // });
    }
  }, [sync]);

  useEffect(() => {
    const logo = localStorage.getItem("logoCompany");
    if(logo) {
      console.log(logo)
    };
  }, []);

  return (
    <aside className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-1 border-r border-gray-200 
      ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"} ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <div className={`py-8 flex  ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link href={`${isAdmin ? '/dashboard' : '/master-data/profile'}`} className="w-full flex justify-center">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="hidden lg:flex">
              <Logo width={100} height={100} />
            </div>
          ) : (
            <Logo width={100} height={100} />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
