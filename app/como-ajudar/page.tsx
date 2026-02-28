import Link from "next/link";
import { getUrgentNeedsAggregate } from "@/lib/shelters";
import { getPriorityLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ComoAjudarPage() {
  const urgentNeeds = await getUrgentNeedsAggregate();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h1 className="text-2xl font-bold text-slate-900">Como ajudar</h1>
        <p className="mt-2 text-sm text-slate-700">
          Doe de forma orientada por demanda real dos abrigos. Evite levar itens sem consulta prévia.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
          <li>Priorize itens urgentes listados abaixo.</li>
          <li>Confirme a validade e a integridade dos alimentos.</li>
          <li>Itens de higiene e água têm alta rotatividade em períodos de chuva intensa.</li>
          <li>Se possível, organize doações em kits prontos (ex.: higiene pessoal).</li>

        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="text-xl font-bold text-slate-900">Itens mais urgentes (agregado)</h2>
        <p className="mt-2 text-sm text-slate-600">
          Lista calculada automaticamente a partir das necessidades ativas dos abrigos.
        </p>

        {urgentNeeds.length === 0 ? (
          <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            Nenhuma necessidade ativa no momento.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {urgentNeeds.map((need) => {
              const needsTerm = need.item.replaceAll(",", " ").trim();
              const href = `/?${new URLSearchParams({ needs: needsTerm }).toString()}`;

              return (
                <li key={`${need.category}-${need.item}-${need.priority}`} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                      {need.category}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
                      Prioridade {getPriorityLabel(need.priority)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {need.item}
                    {need.totalQuantity ? ` - ${need.totalQuantity}` : ""}
                    {need.unit ? ` ${need.unit}` : ""}
                  </p>
                  <p className="text-xs text-slate-600">{need.sheltersCount} registros ativos em abrigos</p>
                  <div className="mt-3">
                    <Link
                      href={href}
                      className="inline-flex items-center rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                    >
                      Ver locais que precisam deste item
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
