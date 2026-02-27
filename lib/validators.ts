import { NeedPriority, NeedStatus, ShelterStatus } from "@prisma/client";
import { z } from "zod";
import { NEED_FILTER_OPTIONS, SHELTER_PAGE_SIZE } from "./constants";

const stringOrUndefined = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const loginSchema = z.object({
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const shelterBaseSchema = z.object({
  name: z.string().trim().min(3, "Nome obrigatório").max(120),
  city: z.string().trim().min(2, "Cidade obrigatória").max(80),
  neighborhood: z.string().trim().min(2, "Bairro obrigatório").max(80),
  address: z.string().trim().min(5, "Endereço obrigatório").max(180),
  lat: z.number().min(-90, "Latitude inválida").max(90, "Latitude inválida"),
  lng: z.number().min(-180, "Longitude inválida").max(180, "Longitude inválida"),
  status: z.nativeEnum(ShelterStatus),
  capacity: z.number().int().min(0, "Capacidade deve ser >= 0"),
  occupancy: z.number().int().min(0, "Ocupação deve ser >= 0"),
  accessible: z.boolean(),
  acceptsPets: z.boolean(),
  publicContact: stringOrUndefined.or(z.literal("")),
  hours: stringOrUndefined.or(z.literal("")),
  notes: stringOrUndefined.or(z.literal("")),
});

export const shelterSchema = shelterBaseSchema
  .superRefine((value, ctx) => {
    if (value.occupancy > value.capacity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["occupancy"],
        message: "Ocupação não pode ser maior que a capacidade.",
      });
    }
  });

export const shelterUpdateSchema = shelterBaseSchema.partial();

export const needSchema = z.object({
  category: z.string().trim().min(2, "Categoria obrigatória").max(60),
  item: z.string().trim().min(2, "Item obrigatório").max(100),
  priority: z.nativeEnum(NeedPriority),
  quantity: z.number().positive("Quantidade deve ser maior que zero").nullable().optional(),
  unit: stringOrUndefined.or(z.literal("")),
  status: z.nativeEnum(NeedStatus).default(NeedStatus.ACTIVE),
  notes: stringOrUndefined.or(z.literal("")),
});

export const needUpdateSchema = needSchema.partial();

export const shelterQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(30).default(SHELTER_PAGE_SIZE),
  search: stringOrUndefined,
  city: stringOrUndefined,
  status: z.nativeEnum(ShelterStatus).optional(),
  accessible: z.enum(["true", "false"]).optional(),
  acceptsPets: z.enum(["true", "false"]).optional(),
  needs: stringOrUndefined,
});

export function parseNeedFilters(rawNeeds?: string) {
  if (!rawNeeds) return [];
  const normalized = rawNeeds
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return normalized.filter((value) =>
    NEED_FILTER_OPTIONS.some((option) => option.toLowerCase() === value),
  );
}
