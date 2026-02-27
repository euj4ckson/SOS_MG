import { DynamicMapView } from "@/components/map/map-view-dynamic";
import { SearchFilters } from "@/components/public/search-filters";
import { ShelterCard } from "@/components/public/shelter-card";
import { Pagination } from "@/components/ui/pagination";
import { SHELTER_PAGE_SIZE } from "@/lib/constants";
import { getPublicShelterList, getShelterCities } from "@/lib/shelters";
import { parseBooleanParam } from "@/lib/utils";
import { parseNeedFilters } from "@/lib/validators";

type SheltersPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function pick(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SheltersPage({ searchParams }: SheltersPageProps) {
  const search = pick(searchParams.search)?.trim();
  const city = pick(searchParams.city)?.trim();
  const status = pick(searchParams.status)?.trim() as "OPEN" | "FULL" | "CLOSED" | undefined;
  const accessible = parseBooleanParam(pick(searchParams.accessible));
  const acceptsPets = parseBooleanParam(pick(searchParams.acceptsPets));
  const needs = parseNeedFilters(pick(searchParams.needs));
  const page = Math.max(Number(pick(searchParams.page) ?? "1") || 1, 1);

  const filters = {
    search,
    city,
    status,
    accessible,
    acceptsPets,
    needs,
  };

  const [cities, listResult, mapResult] = await Promise.all([
    getShelterCities(),
    getPublicShelterList({
      ...filters,
      page,
      pageSize: SHELTER_PAGE_SIZE,
    }),
    getPublicShelterList({
      ...filters,
      page: 1,
      pageSize: 200,
    }),
  ]);

  const mapShelters = mapResult.items.map((item) => ({
    id: item.id,
    name: item.name,
    city: item.city,
    neighborhood: item.neighborhood,
    lat: item.lat,
    lng: item.lng,
    status: item.status,
  }));

  function createPageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (city) params.set("city", city);
    if (status) params.set("status", status);
    if (accessible) params.set("accessible", "true");
    if (acceptsPets) params.set("acceptsPets", "true");
    if (needs.length > 0) params.set("needs", needs.join(","));
    params.set("page", String(targetPage));
    return `/abrigos?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-5 shadow-card">
        <h1 className="text-2xl font-bold text-slate-900">Abrigos disponíveis</h1>
        <p className="mt-2 text-sm text-slate-600">
          Consulte lista e mapa interativo para encontrar o abrigo mais próximo.
        </p>
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

      <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            {listResult.pagination.total} abrigos encontrados. Página {listResult.pagination.page}.
          </p>
          {listResult.items.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              Nenhum abrigo encontrado com os filtros informados.
            </div>
          ) : (
            listResult.items.map((shelter) => <ShelterCard key={shelter.id} shelter={shelter} />)
          )}
          <Pagination
            page={listResult.pagination.page}
            totalPages={listResult.pagination.totalPages}
            createHref={createPageHref}
          />
        </div>

        <aside className="sticky top-20 h-[70vh]">
          <DynamicMapView shelters={mapShelters} className="h-full rounded-2xl border border-slate-200 bg-white p-2 shadow-card" />
        </aside>
      </section>
    </div>
  );
}
