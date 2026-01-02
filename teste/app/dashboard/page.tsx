"use client";

import { Autorization } from "@/components/Global/Autorization";
import { Header } from "@/components/Global/Header";
import { SideMenu } from "@/components/Global/SideMenu";
import { SlimContainer } from "@/components/Global/SlimContainer";
import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";

export default function Dashboard() {
  const [userLogger] = useAtom(userLoggerAtom);
  const [_, setLoading] = useAtom(loadingAtom);  
  
  return (
    <>
      <Autorization />
      {
        userLogger ?
        <>
          <Header />
          <main className="slim-bg-main">
            <SideMenu />

            <div className="slim-container w-full">
              <SlimContainer breadcrump="Dashboard" breadcrumpIcon="FaMoneyBillTrendUp"
                buttons={<></>}>
                
                <></>
              </SlimContainer>
            </div>
          </main>
        </>
        :
        <></>
      }
    </>
  );
}
