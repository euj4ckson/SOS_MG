import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminTable } from "@/components/painel/admin-table";
import { ShelterForm } from "@/components/painel/shelter-form";
import { getCurrentUser } from "@/lib/auth";
import { getSheltersForManagement } from "@/lib/shelters";

export default async function PainelPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/painel/login?callbackUrl=/painel");
  }

  const shelters = await getSheltersForManagement(user);

  if (user.role === "OPERATOR") {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <h1 className="text-2xl font-bold text-slate-900">Painel do operador</h1>
          <p className="mt-2 text-sm text-slate-700">
            Você pode atualizar apenas o abrigo vinculado ao seu usuário.
          </p>
        </section>

        {shelters[0] ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <h2 className="text-lg font-bold text-slate-900">{shelters[0].name}</h2>
            <p className="text-sm text-slate-600">
              {shelters[0].city} - {shelters[0].neighborhood}
            </p>
            <Link
              href={`/painel/abrigos/${shelters[0].id}`}
              className="mt-3 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Editar meu abrigo
            </Link>
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-card">
            Nenhum abrigo vinculado ao seu usuário. Solicite ajuste ao administrador.
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h1 className="text-2xl font-bold text-slate-900">Painel administrativo</h1>
        <p className="mt-2 text-sm text-slate-700">
          Gerencie os abrigos, necessidades e atualizações públicas do portal.
        </p>
      </section>

      <ShelterForm mode="create" />

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">Abrigos cadastrados</h2>
        <AdminTable shelters={shelters} />
      </section>
    </div>
  );
}
