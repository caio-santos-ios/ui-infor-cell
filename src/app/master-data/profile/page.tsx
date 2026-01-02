import { BtnBack } from "@/components/global/btnBack";
import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ERP Mais | Perfil",
  description:
    "This is Next.js Profile page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Profile() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 lg:p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-0">
            Perfil
          </h3>

          <BtnBack uri="/dashboard" />
        </div>
        <div className="space-y-6">
          <UserMetaCard />
          <UserAddressCard />
        </div>
      </div>
    </div>
  );
}
