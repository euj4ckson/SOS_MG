"use client";

import dynamic from "next/dynamic";

export const DynamicMapView = dynamic(
  () => import("@/components/map/map-view").then((module) => module.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500">
        Carregando mapa...
      </div>
    ),
  },
);
