import { cn, getNeedStatusLabel, getPriorityColor, getPriorityLabel } from "@/lib/utils";

type NeedListProps = {
  needs: Array<{
    id: string;
    category: string;
    item: string;
    priority: "HIGH" | "MED" | "LOW";
    quantity: number | null;
    unit: string | null;
    status: "ACTIVE" | "PAUSED" | "FULFILLED";
    notes: string | null;
  }>;
  showStatus?: boolean;
};

export function NeedList({ needs, showStatus = false }: NeedListProps) {
  if (needs.length === 0) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Sem necessidades cadastradas no momento.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {needs.map((need) => (
        <li key={need.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
              {need.category}
            </span>
            <span className={cn("rounded-full px-2 py-1 text-xs font-bold", getPriorityColor(need.priority))}>
              Prioridade {getPriorityLabel(need.priority)}
            </span>
            {showStatus && (
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                {getNeedStatusLabel(need.status)}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-800">
            {need.item}
            {need.quantity ? ` - ${need.quantity}` : ""}
            {need.unit ? ` ${need.unit}` : ""}
          </p>
          {need.notes && <p className="mt-1 text-sm text-slate-600">{need.notes}</p>}
        </li>
      ))}
    </ul>
  );
}
