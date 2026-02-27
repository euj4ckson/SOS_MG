import Link from "next/link";
import { getDirectionsLinks, getShelterStatusColor, getShelterStatusLabel, getVacancies } from "@/lib/utils";

type ShelterCardProps = {
  shelter: {
    id: string;
    name: string;
    city: string;
    neighborhood: string;
    address: string;
    lat: number;
    lng: number;
    status: "OPEN" | "FULL" | "CLOSED";
    capacity: number;
    occupancy: number;
    accessible: boolean;
    acceptsPets: boolean;
    publicContact: string | null;
    needs: Array<{
      id: string;
      item: string;
      priority: "HIGH" | "MED" | "LOW";
      quantity: number | null;
      unit: string | null;
    }>;
  };
};

export function ShelterCard({ shelter }: ShelterCardProps) {
  const vacancies = getVacancies(shelter.capacity, shelter.occupancy);
  const links = getDirectionsLinks(shelter.lat, shelter.lng);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{shelter.name}</h3>
          <p className="text-sm text-slate-600">
            {shelter.neighborhood}, {shelter.city}
          </p>
        </div>
        <span
          className={`rounded-full border px-2 py-1 text-xs font-bold ${getShelterStatusColor(
            shelter.status,
          )}`}
        >
          {getShelterStatusLabel(shelter.status)}
        </span>
      </div>

      <p className="text-sm text-slate-700">{shelter.address}</p>
      <p className="mt-2 text-sm text-slate-700">
        OcupaÃ§Ã£o: <strong>{shelter.occupancy}</strong> / {shelter.capacity} | Vagas:{" "}
        <strong>{vacancies}</strong>
      </p>
      <p className="mt-1 text-sm text-slate-700">
        {shelter.accessible ? "Acessivel" : "Sem acessibilidade total"}
        {shelter.acceptsPets ? " | Aceita pets" : ""}
      </p>
      {shelter.publicContact && (
        <p className="mt-1 text-sm text-slate-700">Contato: {shelter.publicContact}</p>
      )}

      {shelter.needs.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          {shelter.needs.map((need) => (
            <li key={need.id}>
              {need.item}
              {need.quantity ? ` - ${need.quantity}` : ""}
              {need.unit ? ` ${need.unit}` : ""}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/abrigos/${shelter.id}`}
          className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Ver detalhes
        </Link>
        <a
          href={links.google}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Como chegar
        </a>
        <Link
          href="/como-ajudar"
          className="rounded-lg border border-brand-600 bg-white px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
        >
          Como ajudar
        </Link>
      </div>
    </article>
  );
}

