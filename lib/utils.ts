import { LocationType, ShelterStatus } from "@prisma/client";
import clsx, { type ClassValue } from "clsx";
import { differenceInHours, format, formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SHELTER_UPDATE_STALE_HOURS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatRelativeDate(date: Date | string) {
  return formatDistanceToNowStrict(new Date(date), {
    addSuffix: true,
    locale: ptBR,
  });
}

export function isDataStale(date: Date | string) {
  return differenceInHours(new Date(), new Date(date)) >= SHELTER_UPDATE_STALE_HOURS;
}

export function getVacancies(capacity: number, occupancy: number) {
  return Math.max(capacity - occupancy, 0);
}

export function parseBooleanParam(value?: string | null) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export function getShelterStatusLabel(status: ShelterStatus) {
  const map: Record<ShelterStatus, string> = {
    OPEN: "Aberto",
    FULL: "Lotado",
    CLOSED: "Encerrado",
  };
  return map[status];
}

export function getShelterStatusColor(status: ShelterStatus) {
  const map: Record<ShelterStatus, string> = {
    OPEN: "bg-emerald-100 text-emerald-800 border-emerald-200",
    FULL: "bg-amber-100 text-amber-900 border-amber-200",
    CLOSED: "bg-rose-100 text-rose-800 border-rose-200",
  };
  return map[status];
}

export function getLocationTypeLabel(type: LocationType) {
  return type === "DONATION_POINT" ? "Ponto de doação" : "Abrigo";
}

export function getLocationTypeColor(type: LocationType) {
  return type === "DONATION_POINT"
    ? "bg-blue-100 text-blue-800 border-blue-200"
    : "bg-slate-100 text-slate-800 border-slate-200";
}

export function getPriorityLabel(priority: "HIGH" | "MED" | "LOW") {
  const map = {
    HIGH: "Alta",
    MED: "Média",
    LOW: "Baixa",
  };
  return map[priority];
}

export function getPriorityColor(priority: "HIGH" | "MED" | "LOW") {
  const map = {
    HIGH: "bg-rose-100 text-rose-800",
    MED: "bg-amber-100 text-amber-900",
    LOW: "bg-slate-100 text-slate-800",
  };
  return map[priority];
}

export function getNeedStatusLabel(status: "ACTIVE" | "PAUSED" | "FULFILLED") {
  const map = {
    ACTIVE: "Ativo",
    PAUSED: "Pausado",
    FULFILLED: "Recebido",
  };
  return map[status];
}

export function getDirectionsLinks(lat: number, lng: number) {
  return {
    osm: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`,
    google: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
  };
}
