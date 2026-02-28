function decodeMojibake(value: string) {
  try {
    const decoded = Buffer.from(value, "latin1").toString("utf8");
    return decoded;
  } catch {
    return value;
  }
}

export function normalizeText(value: string) {
  const trimmed = value.trim();
  const maybeDecoded = /[ÃÂ]/.test(trimmed) ? decodeMojibake(trimmed) : trimmed;
  return maybeDecoded.normalize("NFC");
}

export function sanitizeShelterData<T extends {
  name?: string;
  city?: string;
  neighborhood?: string;
  address?: string;
  publicContact?: string | null;
  hours?: string | null;
  notes?: string | null;
}>(data: T): T {
  return {
    ...data,
    ...(data.name !== undefined ? { name: normalizeText(data.name) } : {}),
    ...(data.city !== undefined ? { city: normalizeText(data.city) } : {}),
    ...(data.neighborhood !== undefined ? { neighborhood: normalizeText(data.neighborhood) } : {}),
    ...(data.address !== undefined ? { address: normalizeText(data.address) } : {}),
    ...(data.publicContact !== undefined && data.publicContact !== null
      ? { publicContact: normalizeText(data.publicContact) }
      : {}),
    ...(data.hours !== undefined && data.hours !== null ? { hours: normalizeText(data.hours) } : {}),
    ...(data.notes !== undefined && data.notes !== null ? { notes: normalizeText(data.notes) } : {}),
  };
}

export function sanitizeNeedData<T extends {
  category?: string;
  item?: string;
  unit?: string | null;
  notes?: string | null;
}>(data: T): T {
  return {
    ...data,
    ...(data.category !== undefined ? { category: normalizeText(data.category) } : {}),
    ...(data.item !== undefined ? { item: normalizeText(data.item) } : {}),
    ...(data.unit !== undefined && data.unit !== null ? { unit: normalizeText(data.unit) } : {}),
    ...(data.notes !== undefined && data.notes !== null ? { notes: normalizeText(data.notes) } : {}),
  };
}
