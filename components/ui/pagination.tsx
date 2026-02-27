import Link from "next/link";

type PaginationProps = {
  page: number;
  totalPages: number;
  createHref: (page: number) => string;
};

export function Pagination({ page, totalPages, createHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Paginação" className="mt-6 flex items-center justify-center gap-2">
      <Link
        href={createHref(Math.max(1, page - 1))}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        aria-disabled={page <= 1}
      >
        Anterior
      </Link>
      <span className="text-sm text-slate-700">
        Página {page} de {totalPages}
      </span>
      <Link
        href={createHref(Math.min(totalPages, page + 1))}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        aria-disabled={page >= totalPages}
      >
        Próxima
      </Link>
    </nav>
  );
}
