import Link from "next/link";
import { SearchFilters } from "@/components/public/search-filters";
import { ShelterCard } from "@/components/public/shelter-card";
import { getPublicShelterList, getShelterCities } from "@/lib/shelters";
import { parseBooleanParam } from "@/lib/utils";
import { parseNeedFilters } from "@/lib/validators";

type HomePageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function pick(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const search = pick(searchParams.search)?.trim();
  const city = pick(searchParams.city)?.trim();
  const status = pick(searchParams.status)?.trim() as "OPEN" | "FULL" | "CLOSED" | undefined;
  const accessible = parseBooleanParam(pick(searchParams.accessible));
  const acceptsPets = parseBooleanParam(pick(searchParams.acceptsPets));
  const needs = parseNeedFilters(pick(searchParams.needs));

  const [cities, sheltersResult] = await Promise.all([
    getShelterCities(),
    getPublicShelterList({
      page: 1,
      pageSize: 6,
      search,
      city,
      status,
      accessible,
      acceptsPets,
      needs,
    }),
  ]);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-card">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-cyan-200">Portal público</p>
        <h1 className="text-2xl font-bold sm:text-3xl">
          Gestão de Abrigos e Acesso à Informação em crises de chuvas e enchentes
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-100 sm:text-base">
          Consulte vagas, localização e necessidades urgentes dos abrigos. As equipes autorizadas
          atualizam os dados no painel restrito.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/abrigos"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            Ver todos os abrigos
          </Link>
          <Link
            href="/como-ajudar"
            className="rounded-lg border border-slate-400 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Como ajudar
          </Link>
        </div>
      </section>

      <SearchFilters
        cities={cities}
        initial={{
          search,
          city,
          status,
          accessible,
          acceptsPets,
          needs,
        }}
      />

      <section aria-label="Lista de abrigos" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Abrigos em destaque</h2>
          <p className="text-sm text-slate-600">{sheltersResult.pagination.total} resultados encontrados</p>
        </div>

        {sheltersResult.items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Nenhum abrigo encontrado com estes filtros.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sheltersResult.items.map((shelter) => (
              <ShelterCard key={shelter.id} shelter={shelter} />
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Link
            href="/abrigos"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Abrir lista completa e mapa
          </Link>
        </div>
      </section>
    </div>
  );
}
