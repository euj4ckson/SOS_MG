import Link from "next/link";
import { notFound } from "next/navigation";
import { DynamicMapView } from "@/components/map/map-view-dynamic";
import { NeedList } from "@/components/public/need-list";
import { CopyAddressButton } from "@/components/ui/copy-address-button";
import { getPublicShelterById } from "@/lib/shelters";
import {
  formatDateTime,
  formatRelativeDate,
  getDirectionsLinks,
  getLocationTypeLabel,
  getShelterStatusLabel,
  getVacancies,
} from "@/lib/utils";

type ShelterDetailPageProps = {
  params: { id: string };
};

export default async function ShelterDetailPage({ params }: ShelterDetailPageProps) {
  const shelter = await getPublicShelterById(params.id);
  if (!shelter) notFound();

  const activeNeeds = shelter.needs.filter((need) => need.status === "ACTIVE");
  const links = getDirectionsLinks(shelter.lat, shelter.lng);
  const vacancies = getVacancies(shelter.capacity, shelter.occupancy);
  const isDonationPoint = shelter.type === "DONATION_POINT";
  const shouldShowOccupancy = !isDonationPoint && shelter.occupancy > 0;
  const shouldShowVacancies = !isDonationPoint && vacancies > 0;
  const shouldShowCapacityInfo = shouldShowOccupancy || shouldShowVacancies;

  return (
    <div className="space-y-6">
      <nav className="text-sm text-slate-600">
        <Link href="/abrigos" className="font-semibold text-brand-700 underline">
          Voltar para locais
        </Link>
      </nav>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{shelter.name}</h1>
            <p className="text-sm text-slate-700">
              {shelter.neighborhood}, {shelter.city}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Tipo: <strong>{getLocationTypeLabel(shelter.type)}</strong>
            </p>
            {!isDonationPoint && (
              <p className="mt-1 text-sm text-slate-600">
                Status atual: <strong>{getShelterStatusLabel(shelter.status)}</strong>
              </p>
            )}
          </div>
          <div className="text-right text-sm text-slate-600">
            <p>Última atualização: {formatRelativeDate(shelter.updatedAt)}</p>
            <p>({formatDateTime(shelter.updatedAt)})</p>
          </div>
        </div>

       

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <strong>Endereço:</strong> {shelter.address}
            </p>
            <p>
              <strong>Contato público:</strong> {shelter.publicContact ?? "Não informado"}
            </p>
            <p>
              <strong>Horário:</strong> {shelter.hours ?? "Não informado"}
            </p>

            {shouldShowCapacityInfo && (
              <p>
                {shouldShowOccupancy && (
                  <>
                    <strong>Capacidade:</strong> {shelter.capacity} | <strong>Ocupação:</strong>{" "}
                    {shelter.occupancy}
                  </>
                )}
                {shouldShowOccupancy && shouldShowVacancies ? " | " : ""}
                {shouldShowVacancies && (
                  <>
                    <strong>Vagas:</strong> {vacancies}
                  </>
                )}
              </p>
            )}

            {!isDonationPoint && (
              <>
                <p>
                  <strong>Acessibilidade:</strong> {shelter.accessible ? "Sim" : "Não"}
                </p>
                {shelter.acceptsPets && (
                  <p>
                    <strong>Aceita pets:</strong> Sim
                  </p>
                )}
              </>
            )}

            {shelter.notes && (
              <p>
                <strong>Regras e observações:</strong> {shelter.notes}
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <CopyAddressButton address={shelter.address} />
              <a
                href={links.google}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Abrir rota
              </a>
              <a
                href={links.osm}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Abrir no OSM
              </a>
            </div>
          </div>

          <DynamicMapView
            shelters={[
              {
                id: shelter.id,
                type: shelter.type,
                name: shelter.name,
                city: shelter.city,
                neighborhood: shelter.neighborhood,
                lat: shelter.lat,
                lng: shelter.lng,
                status: shelter.status,
              },
            ]}
            zoom={15}
            className="h-[340px] rounded-xl border border-slate-200 bg-white p-2"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Necessidades</h2>
        <NeedList needs={activeNeeds} />
      </section>
    </div>
  );
}
