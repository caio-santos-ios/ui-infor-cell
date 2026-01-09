import { NavItem } from "@/types/global/menu.type";
import { atom } from "jotai";

export const menuOpenAtom = atom<boolean>(false);
export const menuRoutinesAtom = atom<NavItem[]>([
    {
    icon: "FiGrid",
    name: "Cadastros",
    authorized: false,
    code: "A",
    subItems: [
      {name: "Empresas", path: "/master-data/companies", code: "A1", pro: false, authorized: false },
      {name: "Lojas", path: "/master-data/stores", code: "A2", pro: false, authorized: false },
      {name: "Profissionais", path: "/master-data/employees", code: "A3", pro: false, authorized: false },
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
      {name: "Modelo", path: "/product/models", code: "B3", pro: false, authorized: false },
      {name: "Marcas", path: "/product/brands", code: "B4", pro: false, authorized: false }
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
      {name: "Transferências", path: "/stock/panel", code: "F2", pro: false, authorized: false },
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
  }
]);