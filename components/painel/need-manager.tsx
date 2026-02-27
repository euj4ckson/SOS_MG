"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { NEED_CATALOG } from "@/lib/constants";
import { getNeedStatusLabel, getPriorityLabel } from "@/lib/utils";

type NeedRow = {
  id: string;
  category: string;
  item: string;
  priority: "HIGH" | "MED" | "LOW";
  quantity: number | null;
  unit: string | null;
  status: "ACTIVE" | "PAUSED" | "FULFILLED";
  notes: string | null;
  updatedAt: string | Date;
};

type NeedManagerProps = {
  shelterId: string;
  needs: NeedRow[];
};

const priorityOptions = [
  { value: "HIGH", label: "Alta" },
  { value: "MED", label: "Média" },
  { value: "LOW", label: "Baixa" },
] as const;

const statusOptions = [
  { value: "ACTIVE", label: "Ativo" },
  { value: "PAUSED", label: "Pausado" },
  { value: "FULFILLED", label: "Recebido" },
] as const;

export function NeedManager({ shelterId, needs: initialNeeds }: NeedManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [needs, setNeeds] = useState<NeedRow[]>(initialNeeds);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [category, setCategory] = useState("Água");
  const [item, setItem] = useState("Água potável");
  const [customItem, setCustomItem] = useState("");
  const [priority, setPriority] = useState<"HIGH" | "MED" | "LOW">("HIGH");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [notes, setNotes] = useState("");

  const categoryItems = useMemo(() => NEED_CATALOG[category] ?? [], [category]);
  const useCustomItem = category === "Outros";

  function resetForm() {
    setCategory("Água");
    setItem("Água potável");
    setCustomItem("");
    setPriority("HIGH");
    setQuantity("");
    setUnit("");
    setNotes("");
  }

  function createNeed(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const selectedItem = useCustomItem ? customItem.trim() : item;
    if (!selectedItem) {
      setFeedback({ type: "error", text: "Informe o item da necessidade." });
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/shelters/${shelterId}/needs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          item: selectedItem,
          priority,
          quantity: quantity ? Number(quantity) : null,
          unit: unit || null,
          notes: notes || null,
          status: "ACTIVE",
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setFeedback({ type: "error", text: data?.error ?? "Falha ao cadastrar necessidade." });
        return;
      }

      setNeeds((prev) => [data, ...prev]);
      setFeedback({ type: "success", text: "Necessidade cadastrada." });
      resetForm();
      router.refresh();
    });
  }

  function updateNeedStatus(id: string, status: "ACTIVE" | "PAUSED" | "FULFILLED") {
    startTransition(async () => {
      const response = await fetch(`/api/needs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        setFeedback({ type: "error", text: "Falha ao atualizar status." });
        return;
      }

      setNeeds((prev) => prev.map((need) => (need.id === id ? { ...need, status } : need)));
      setFeedback({ type: "success", text: "Status atualizado." });
      router.refresh();
    });
  }

  function deleteNeed(id: string) {
    startTransition(async () => {
      const response = await fetch(`/api/needs/${id}`, { method: "DELETE" });
      if (!response.ok) {
        setFeedback({ type: "error", text: "Falha ao excluir necessidade." });
        return;
      }

      setNeeds((prev) => prev.filter((need) => need.id !== id));
      setFeedback({ type: "success", text: "Necessidade removida." });
      router.refresh();
    });
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <h2 className="text-lg font-bold text-slate-900">Gestão de necessidades</h2>
      <p className="text-sm text-slate-600">
        Cadastre itens prioritários e marque como recebido/pausado conforme as doações chegam.
      </p>

      <form onSubmit={createNeed} className="grid gap-3 md:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Categoria
          <select
            value={category}
            onChange={(event) => {
              const nextCategory = event.target.value;
              setCategory(nextCategory);
              const firstItem = NEED_CATALOG[nextCategory]?.[0] ?? "";
              setItem(firstItem);
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {Object.keys(NEED_CATALOG).map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>

        {!useCustomItem ? (
          <label className="text-sm font-semibold text-slate-700">
            Item
            <select
              value={item}
              onChange={(event) => setItem(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {categoryItems.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="text-sm font-semibold text-slate-700">
            Item livre
            <input
              value={customItem}
              onChange={(event) => setCustomItem(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Ex.: Ração para cães"
            />
          </label>
        )}

        <label className="text-sm font-semibold text-slate-700">
          Prioridade
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as "HIGH" | "MED" | "LOW")}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Quantidade
          <input
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            type="number"
            min={0}
            step="any"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Ex.: 200"
          />
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Unidade
          <input
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Ex.: L, un, kg"
          />
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Observações
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Ex.: Urgente para próximas 24h"
          />
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70"
          >
            {isPending ? "Salvando..." : "Adicionar necessidade"}
          </button>
        </div>
      </form>

      {feedback && (
        <p
          className={`rounded-md px-3 py-2 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {feedback.text}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-3 py-2 font-semibold">Item</th>
              <th className="px-3 py-2 font-semibold">Prioridade</th>
              <th className="px-3 py-2 font-semibold">Quantidade</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {needs.map((need) => (
              <tr key={need.id} className="border-t border-slate-200">
                <td className="px-3 py-2 text-slate-800">
                  <span className="font-semibold">{need.item}</span>
                  <div className="text-xs text-slate-500">{need.category}</div>
                </td>
                <td className="px-3 py-2 text-slate-700">{getPriorityLabel(need.priority)}</td>
                <td className="px-3 py-2 text-slate-700">
                  {need.quantity ?? "-"} {need.unit ?? ""}
                </td>
                <td className="px-3 py-2 text-slate-700">
                  <select
                    value={need.status}
                    onChange={(event) =>
                      updateNeedStatus(
                        need.id,
                        event.target.value as "ACTIVE" | "PAUSED" | "FULFILLED",
                      )
                    }
                    className="rounded-md border border-slate-300 px-2 py-1"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {getNeedStatusLabel(option.value)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => deleteNeed(need.id)}
                    className="rounded-md border border-rose-300 bg-white px-3 py-1.5 font-semibold text-rose-700 hover:bg-rose-50"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {needs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                  Nenhuma necessidade cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
