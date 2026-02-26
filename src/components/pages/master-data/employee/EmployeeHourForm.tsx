"use client";

import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ResetEmployeeCalendar, ResetModule, TEmployeeCalendar, TModule, TRoutine } from "@/types/master-data/employee/employee.type";
import { iconAtom } from "@/jotai/global/icons.jotai";
import { menuRoutinesAtom } from "@/jotai/global/menu.jotai";
import { NavItem } from "@/types/global/menu.type";

type TProp = {
  id?: string;
  calendar: any
};

const DAYS = [
  { key: "monday", title: "SEG" },
  { key: "tuesday", title: "TER" },
  { key: "wednesday", title: "QUA" },
  { key: "thursday", title: "QUI" },
  { key: "friday", title: "SEX" },
  { key: "saturday", title: "SÁB" },
  { key: "sunday", title: "DOM" },
];
const HOURS = Array.from({ length: 23 }, (_, i) => {
  const h = i + 1;
  return h < 10 ? `0${h}:00` : `${h}:00`;
});

export default function EmployeeHourForm({id, calendar}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);

  const { getValues, formState: { errors }} = useForm<TEmployeeCalendar>({
    defaultValues: ResetEmployeeCalendar
  });
  
  const update: SubmitHandler<TEmployeeCalendar> = async (body: any) => {
    try {
      await api.put(`/employees/calendar`, body, configApi());
    } catch (error) {
      resolveResponse(error);
    }
  };

  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  const toggleSlot = async (day: {key: string, title: string; }, hour: string) => {
    const existed = calendar[day.key].find((h: string) => h == hour);

    if(existed) {
      calendar[day.key] = calendar[day.key].filter((h: string) => h != hour);
    } else {
      calendar[day.key].push(hour);
    };

    const code = `${day.key}-${hour}`;
    setSelectedSlots((prev) =>
      prev.includes(code) ? prev.filter((s) => s !== code) : [...prev, code]
    );

    const form: any = {
      id, 
      calendar
    };

    await update(form);
  };

  const isSelected = (day: string, hour: string) => selectedSlots.includes(`${day}-${hour}`);

  useEffect(() => {
    const monday = calendar.monday.map((m: string) => (`monday-${m}`));
    const tuesday = calendar.tuesday.map((m: string) => (`tuesday-${m}`));
    const wednesday = calendar.wednesday.map((m: string) => (`wednesday-${m}`));
    const thursday = calendar.thursday.map((m: string) => (`thursday-${m}`));
    const friday = calendar.friday.map((m: string) => (`friday-${m}`));
    const saturday = calendar.saturday.map((m: string) => (`saturday-${m}`));
    const sunday = calendar.sunday.map((m: string) => (`sunday-${m}`));
    setSelectedSlots([...monday, ...tuesday, ...wednesday, ...thursday, ...friday, ...saturday, ...sunday]);
  }, []);

  return (
    <>
      <ComponentCard title="Horários" hasHeader={false}>
        <div className="container-form">
          <div className="flex mb-4">
            <div className="w-16 shrink-0"></div>
            <div className="flex w-full justify-between pr-2">
              {HOURS.map((hour) => (
                <span key={hour} className="text-[10px] font-medium text-gray-400 w-full text-center">
                  {hour}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {DAYS.map((day: {key: string, title: string; }) => (
              <div key={day.key} className="flex items-center group">
                <div className="w-16 flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400 w-8">{day.title}</span>
                </div>

                <div className="flex w-full justify-between gap-2">
                  {HOURS.map((hour) => {
                    const active = isSelected(day.key, hour);
                    return (
                      <button key={`${day}-${hour}`} onClick={() => toggleSlot(day, hour)} className={`w-full h-10 rounded-lg transition-all duration-200 ${active ? "bg-brand-500 hover:bg-brand-600 shadow-sm" : "bg-gray-300 dark:bg-gray-800 hover:bg-gray-400 dark:hover:bg-gray-700"}`} title={`${day.title} às ${hour}`} />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>         
        </div>
      </ComponentCard>
    </>
  );
}