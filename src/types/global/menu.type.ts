export type NavItem = {
  name: string;
  code: string;
  icon: string;
  path?: string;
  authorized: boolean;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean, code: string, authorized: boolean }[];
};
