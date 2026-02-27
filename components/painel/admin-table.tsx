import Link from "next/link";
import { DeleteShelterButton } from "@/components/painel/delete-shelter-button";
import { formatDateTime, formatRelativeDate, getShelterStatusLabel, getVacancies } from "@/lib/utils";

type AdminTableProps = {
  shelters: Array<{
    id: string;
    name: string;
    city: string;
    neighborhood: string;
    status: "OPEN" | "FULL" | "CLOSED";
    capacity: number;
    occupancy: number;
    updatedAt: Date;
  }>;
};

export function AdminTable({ shelters }: AdminTableProps) {
  if (shelters.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Nenhum abrigo cadastrado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th className="px-3 py-2 font-semibold">Abrigo</th>
            <th className="px-3 py-2 font-semibold">Cidade</th>
            <th className="px-3 py-2 font-semibold">Status</th>
            <th className="px-3 py-2 font-semibold">Vagas</th>
            <th className="px-3 py-2 font-semibold">Última atualização</th>
            <th className="px-3 py-2 font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          {shelters.map((shelter) => (
            <tr key={shelter.id} className="border-t border-slate-200">
              <td className="px-3 py-2 font-semibold text-slate-800">{shelter.name}</td>
              <td className="px-3 py-2 text-slate-700">
                {shelter.city} ({shelter.neighborhood})
              </td>
              <td className="px-3 py-2 text-slate-700">{getShelterStatusLabel(shelter.status)}</td>
              <td className="px-3 py-2 text-slate-700">{getVacancies(shelter.capacity, shelter.occupancy)}</td>
              <td className="px-3 py-2 text-slate-700">
                {formatRelativeDate(shelter.updatedAt)} ({formatDateTime(shelter.updatedAt)})
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/painel/abrigos/${shelter.id}`}
                    className="rounded-md bg-brand-600 px-3 py-1.5 font-semibold text-white hover:bg-brand-700"
                  >
                    Editar
                  </Link>
                  <DeleteShelterButton shelterId={shelter.id} shelterName={shelter.name} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
