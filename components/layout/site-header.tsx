import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/painel/logout-button";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/abrigos", label: "Abrigos" },
  { href: "/como-ajudar", label: "Como ajudar" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-bold text-slate-900">
          SOS MG
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-4 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user && (
            <>
              <Link
                href="/painel"
                className="rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Painel
              </Link>
              <LogoutButton />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
