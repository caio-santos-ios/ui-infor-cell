// import type { Metadata } from "next";
// import { ListPlan } from "@/components/plan/ListPlan";
// import Link from "next/link";
// import Button from "@/components/ui/button/Button";

// export const metadata: Metadata = {
//   title:"Telemovvi | Assinar Plano",
//   description: "This is Next.js Home for TailAdmin Dashboard Template",
// };

// export default function Plan() {
//   return (
//     <>
//       <div className="flex justify-end items-center pr-10 mb-2 h-20">
//         <Link href="/dashboard">
//           <Button type="submit" className="" size="sm">Voltar</Button>
//         </Link>
//       </div>
//       <div className="h-[calc(100dvh-10rem)] w-dvw flex justify-center items-center">
//         <ListPlan />
//       </div>
//     </>
//   );
// }

import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/button/Button";
import { SubscriptionFlow } from "@/components/pages/subscription-flow/SubscriptionFlow";

export const metadata: Metadata = {
  title: "Telemovvi | Assinar Plano",
  description: "Assine um plano ERP SaaS",
};

export default function Plan() {
  return (
    <>
      <div className="flex justify-end items-center pr-10 mb-2 h-20">
        <Link href="/dashboard">
          <Button type="button" size="sm">Voltar</Button>
        </Link>
      </div>
      <div className="min-h-[calc(100dvh-10rem)] w-full flex justify-center items-start pt-6 pb-10">
        <SubscriptionFlow />
      </div>
    </>
  );
}