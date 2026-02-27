"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NEED_FILTER_OPTIONS } from "@/lib/constants";
import { SearchBar } from "@/components/public/search-bar";

type FilterState = {
  search?: string;
  city?: string;
  status?: string;
  accessible?: boolean;
  acceptsPets?: boolean;
  needs: string[];
};

type SearchFiltersProps = {
  cities: string[];
  initial: FilterState;
};

export function SearchFilters({ cities, initial }: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(initial.search ?? "");
  const [city, setCity] = useState(initial.city ?? "");
  const [status, setStatus] = useState(initial.status ?? "");
  const [accessible, setAccessible] = useState(initial.accessible ?? false);
  const [acceptsPets, setAcceptsPets] = useState(initial.acceptsPets ?? false);
  const [needs, setNeeds] = useState<string[]>(initial.needs ?? []);

  const statusOptions = useMemo(
    () => [
      { value: "", label: "Todos os status" },
      { value: "OPEN", label: "Aberto" },
      { value: "FULL", label: "Lotado" },
      { value: "CLOSED", label: "Encerrado" },
    ],
    [],
  );

  function toggleNeed(value: string) {
    setNeeds((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  }

  function applyFilters() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (city) params.set("city", city);
    if (status) params.set("status", status);
    if (accessible) params.set("accessible", "true");
    if (acceptsPets) params.set("acceptsPets", "true");
    if (needs.length > 0) params.set("needs", needs.join(","));
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    setSearch("");
    setCity("");
    setStatus("");
    setAccessible(false);
    setAcceptsPets(false);
    setNeeds([]);
    router.push(pathname);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <h2 className="mb-3 text-lg font-bold text-slate-900">Buscar abrigo</h2>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <SearchBar value={search} onChange={setSearch} />

        <label className="text-sm font-semibold text-slate-700">
          Cidade
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Todas</option>
            {cities.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={applyFilters}
            className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Aplicar filtros
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
          <input
            checked={acceptsPets}
            onChange={(event) => setAcceptsPets(event.target.checked)}
            type="checkbox"
            className="h-4 w-4"
          />
          Aceita pets
        </label>
        <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
          <input
            checked={accessible}
            onChange={(event) => setAccessible(event.target.checked)}
            type="checkbox"
            className="h-4 w-4"
          />
          Acessível para cadeirantes
        </label>
      </div>

      <fieldset className="mt-4">
        <legend className="mb-2 text-sm font-semibold text-slate-700">Necessidades urgentes</legend>
        <div className="flex flex-wrap gap-2">
          {NEED_FILTER_OPTIONS.map((option) => (
            <label
              key={option}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={needs.includes(option)}
                onChange={() => toggleNeed(option)}
                className="h-4 w-4"
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
