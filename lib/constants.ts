export const SHELTER_PAGE_SIZE = 8;
export const SHELTER_UPDATE_STALE_HOURS = 6;

export const NEED_FILTER_OPTIONS = [
  "água",
  "alimentos",
  "colchões",
  "higiene",
  "remédios",
] as const;

export const NEED_CATALOG: Record<string, string[]> = {
  Água: ["Água potável", "Galão 20L", "Água mineral 1,5L"],
  Alimentos: ["Cestas básicas", "Arroz 5kg", "Feijão 1kg", "Leite em pó"],
  Colchões: ["Colchão solteiro", "Colchonete", "Cobertores"],
  Higiene: ["Kit higiene pessoal", "Sabonete", "Papel higiênico", "Fraldas"],
  Remédios: ["Analgésicos", "Soro fisiológico", "Antitérmicos"],
  Outros: [],
};
