import { Suspense } from "react";
import EcommercePage from "@/components/pages/ecommerce/EcommercePage";

export default function Ecommerce() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent" />
      </div>
    }>
      <EcommercePage />
    </Suspense>
  );
}
