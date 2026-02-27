import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-card">
      <h1 className="text-2xl font-bold text-slate-900">Página não encontrada</h1>
      <p className="mt-2 text-sm text-slate-600">
        O recurso solicitado não existe ou foi removido.
      </p>
      <Link
        href="/"
        className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
