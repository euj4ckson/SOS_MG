import { redirect } from "next/navigation";
import { LoginForm } from "@/components/painel/login-form";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/painel");

  return (
    <div className="mx-auto max-w-md">
      <LoginForm />
      <p className="mt-4 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
        Ambiente de teste (seed): admin@sosjf.local / Admin@123 e operador@sosjf.local /
        Operador@123.
      </p>
    </div>
  );
}
