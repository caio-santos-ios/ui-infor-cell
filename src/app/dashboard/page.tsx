import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";

export const metadata: Metadata = {
  title:"Telemovvi | Dashboard",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 xl:col-span-6">
        <EcommerceMetrics />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <MonthlyTarget />
      </div>
      
      <div className="col-span-12 xl:col-span-6">
        <MonthlySalesChart />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <RecentOrders />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>
    </div>
  );
}
