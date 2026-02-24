"use client";

import ComponentCard from "@/components/common/ComponentCard";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";

type TProp = {
  register: any;
  watch: any;
  onSave: () => void;
  isClosed: boolean;
};

export default function ServiceOrderLaudoTab({ register, onSave, isClosed }: TProp) {
  return (
    <ComponentCard title="Laudo Técnico" hasHeader={false}>
      <div className="grid grid-cols-6 gap-3 container-form">
        <div className="col-span-6">
          <Label title="Laudo Técnico" />
          <textarea
            {...register("laudo.technicalReport")}
            placeholder="Descreva o diagnóstico técnico detalhado, procedimentos realizados, conclusões..."
            disabled={isClosed}
            rows={6}
            className="input-erp-primary input-erp-default resize-none py-2.5 h-auto"
          />
        </div>
        <div className="col-span-6 xl:col-span-3">
          <Label title="Testes Realizados" required={false} />
          <textarea
            {...register("laudo.testsPerformed")}
            placeholder="Descreva os testes realizados..."
            disabled={isClosed}
            rows={3}
            className="input-erp-primary input-erp-default resize-none py-2.5 h-auto"
          />
        </div>
        <div className="col-span-6 xl:col-span-3">
          <Label title="Status Final do Reparo" required={false} />
          <select
            {...register("laudo.repairStatus")}
            disabled={isClosed}
            className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 text-gray-800"
          >
            <option value="">Selecionar...</option>
            <option value="repaired">Reparado com sucesso</option>
            <option value="partial">Reparo parcial</option>
            <option value="not_repaired">Não foi possível reparar</option>
            <option value="waiting_part">Aguardando peça</option>
          </select>
        </div>
      </div>
      {!isClosed && (
        <div className="mt-4">
          <Button onClick={onSave} type="submit" className="w-full xl:max-w-24" size="sm">Salvar</Button>
        </div>
      )}
    </ComponentCard>
  );
}
