"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type DeleteShelterButtonProps = {
  shelterId: string;
  shelterName: string;
};

export function DeleteShelterButton({ shelterId, shelterName }: DeleteShelterButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (isPending) return;

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o local "${shelterName}"? Esta ação não pode ser desfeita.`,
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const response = await fetch(`/api/shelters/${shelterId}`, { method: "DELETE" });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error ?? "Não foi possível excluir o local.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-md border border-rose-300 bg-white px-3 py-1.5 font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-70"
      >
        {isPending ? "Excluindo..." : "Excluir"}
      </button>
      {error && <span className="text-xs text-rose-700">{error}</span>}
    </div>
  );
}
