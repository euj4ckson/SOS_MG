import Link from "next/link";
import { redirect } from "next/navigation";
import { NeedManager } from "@/components/painel/need-manager";
import { ShelterForm } from "@/components/painel/shelter-form";
import { getCurrentUser } from "@/lib/auth";
import { canAccessShelter } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getManagedShelterById } from "@/lib/shelters";
import { formatDateTime, formatRelativeDate } from "@/lib/utils";

type ManageShelterPageProps = {
  params: { id: string };
};

export default async function ManageShelterPage({ params }: ManageShelterPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect(`/painel/login?callbackUrl=/painel/abrigos/${params.id}`);
  if (!canAccessShelter(user, params.id)) redirect("/painel");

  const shelter = await getManagedShelterById(params.id);
  if (!shelter) redirect("/painel");

  const logs = await prisma.auditLog.findMany({
    where: {
      OR: [
        { entityType: "SHELTER", entityId: shelter.id },
        { entityType: "NEED", entityId: { in: shelter.needs.map((need) => need.id) } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      actorUser: {
        select: { name: true, email: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <nav className="text-sm">
        <Link href="/painel" className="font-semibold text-brand-700 underline">
          Voltar ao painel
        </Link>
      </nav>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h1 className="text-2xl font-bold text-slate-900">{shelter.name}</h1>
        <p className="text-sm text-slate-700">
          Última atualização {formatRelativeDate(shelter.updatedAt)} ({formatDateTime(shelter.updatedAt)})
        </p>
      </section>

      <ShelterForm
        mode="edit"
        shelterId={shelter.id}
        initialData={{
          type: shelter.type,
          name: shelter.name,
          city: shelter.city,
          neighborhood: shelter.neighborhood,
          address: shelter.address,
          lat: String(shelter.lat),
          lng: String(shelter.lng),
          status: shelter.status,
          capacity: String(shelter.capacity),
          occupancy: String(shelter.occupancy),
          accessible: shelter.accessible,
          acceptsPets: shelter.acceptsPets,
          publicContact: shelter.publicContact ?? "",
          hours: shelter.hours ?? "",
          notes: shelter.notes ?? "",
        }}
      />

      <NeedManager shelterId={shelter.id} needs={shelter.needs} />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <h2 className="text-lg font-bold text-slate-900">Auditoria de alterações</h2>
        <p className="mt-1 text-sm text-slate-600">Registro simples de quem alterou e quando.</p>
        <ul className="mt-4 space-y-2">
          {logs.map((log) => (
            <li key={log.id} className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
              <p className="font-semibold">
                {log.action} em {log.entityType}
              </p>
              <p>
                Por: {log.actorUser?.name ?? "Sistema"} ({log.actorUser?.email ?? "n/a"})
              </p>
              <p>
                Em: {formatDateTime(log.createdAt)} ({formatRelativeDate(log.createdAt)})
              </p>
            </li>
          ))}
          {logs.length === 0 && (
            <li className="rounded-lg border border-slate-200 p-3 text-sm text-slate-600">
              Nenhuma alteração registrada ainda.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
