"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ShelterFormData = {
  name: string;
  city: string;
  neighborhood: string;
  address: string;
  lat: string;
  lng: string;
  status: "OPEN" | "FULL" | "CLOSED";
  capacity: string;
  occupancy: string;
  accessible: boolean;
  acceptsPets: boolean;
  publicContact: string;
  hours: string;
  notes: string;
};

type ShelterFormProps = {
  mode: "create" | "edit";
  shelterId?: string;
  initialData?: Partial<ShelterFormData>;
};

const defaultData: ShelterFormData = {
  name: "",
  city: "",
  neighborhood: "",
  address: "",
  lat: "",
  lng: "",
  status: "OPEN",
  capacity: "0",
  occupancy: "0",
  accessible: false,
  acceptsPets: false,
  publicContact: "",
  hours: "",
  notes: "",
};

export function ShelterForm({ mode, shelterId, initialData }: ShelterFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState<ShelterFormData>({
    ...defaultData,
    ...initialData,
  });

  function update<K extends keyof ShelterFormData>(key: K, value: ShelterFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function parsePayload() {
    const payload = {
      name: form.name.trim(),
      city: form.city.trim(),
      neighborhood: form.neighborhood.trim(),
      address: form.address.trim(),
      lat: Number(form.lat),
      lng: Number(form.lng),
      status: form.status,
      capacity: Number(form.capacity),
      occupancy: Number(form.occupancy),
      accessible: form.accessible,
      acceptsPets: form.acceptsPets,
      publicContact: form.publicContact.trim() || undefined,
      hours: form.hours.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    if (!payload.name || !payload.city || !payload.neighborhood || !payload.address) {
      throw new Error("Preencha nome, cidade, bairro e endereço.");
    }
    if (Number.isNaN(payload.lat) || payload.lat < -90 || payload.lat > 90) {
      throw new Error("Latitude inválida.");
    }
    if (Number.isNaN(payload.lng) || payload.lng < -180 || payload.lng > 180) {
      throw new Error("Longitude inválida.");
    }
    if (!Number.isFinite(payload.capacity) || !Number.isFinite(payload.occupancy)) {
      throw new Error("Capacidade e ocupação devem ser numéricas.");
    }
    if (payload.occupancy > payload.capacity) {
      throw new Error("Ocupação não pode ser maior que capacidade.");
    }

    return payload;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    let payload: ReturnType<typeof parsePayload>;
    try {
      payload = parsePayload();
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Dados inválidos.",
      });
      return;
    }

    startTransition(async () => {
      const endpoint = mode === "create" ? "/api/shelters" : `/api/shelters/${shelterId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setFeedback({
          type: "error",
          text: data?.error ?? "Não foi possível salvar o abrigo.",
        });
        return;
      }

      setFeedback({
        type: "success",
        text: mode === "create" ? "Abrigo criado com sucesso." : "Abrigo atualizado com sucesso.",
      });

      if (mode === "create" && data?.id) {
        router.push(`/painel/abrigos/${data.id}`);
        return;
      }

      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <h2 className="text-lg font-bold text-slate-900">
        {mode === "create" ? "Cadastrar novo abrigo" : "Dados do abrigo"}
      </h2>
      <p className="text-sm text-slate-600">
        Geocodificação é opcional. Informe latitude e longitude manualmente, se necessário.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Nome do abrigo
          <input
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Cidade
          <input
            value={form.city}
            onChange={(event) => update("city", event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Bairro
          <input
            value={form.neighborhood}
            onChange={(event) => update("neighborhood", event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Endereço completo
          <input
            value={form.address}
            onChange={(event) => update("address", event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Latitude
          <input
            type="number"
            step="any"
            value={form.lat}
            onChange={(event) => update("lat", event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Longitude
          <input
            type="number"
            step="any"
            value={form.lng}
            onChange={(event) => update("lng", event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Status
          <select
            value={form.status}
            onChange={(event) => update("status", event.target.value as ShelterFormData["status"])}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="OPEN">Aberto</option>
            <option value="FULL">Lotado</option>
            <option value="CLOSED">Encerrado</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Capacidade total
          <input
            type="number"
            min={0}
            value={form.capacity}
            onChange={(event) => update("capacity", event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Ocupação atual
          <input
            type="number"
            min={0}
            value={form.occupancy}
            onChange={(event) => update("occupancy", event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Contato público (telefone/WhatsApp)
          <input
            value={form.publicContact}
            onChange={(event) => update("publicContact", event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Horários de funcionamento
          <input
            value={form.hours}
            onChange={(event) => update("hours", event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.accessible}
            onChange={(event) => update("accessible", event.target.checked)}
            className="h-4 w-4"
          />
          Abrigo acessível para cadeirante
        </label>
        <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.acceptsPets}
            onChange={(event) => update("acceptsPets", event.target.checked)}
            className="h-4 w-4"
          />
          Aceita pets
        </label>
      </div>

      <label className="block text-sm font-semibold text-slate-700">
        Observações
        <textarea
          value={form.notes}
          onChange={(event) => update("notes", event.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

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

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-70"
      >
        {isPending ? "Salvando..." : "Salvar abrigo"}
      </button>
    </form>
  );
}
