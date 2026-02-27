import "dotenv/config";
import { hash } from "bcryptjs";
import { prisma } from "../lib/prisma";

const OFFICIAL_PJF_SHELTERS_SOURCE_URL =
  "https://www.pjf.mg.gov.br/noticias/view.php?modo=link2&idnoticia2=88482";
const OFFICIAL_PJF_DONATION_SOURCE_URL =
  "https://www.pjf.mg.gov.br/noticias/view.php?modo=link2&idnoticia2=88466";

const OFFICIAL_PJF_SHELTERS_UPDATED_AT = new Date("2026-02-26T22:00:00.000Z"); // 26/02/2026 19h (BRT)
const OFFICIAL_PJF_DONATION_UPDATED_AT = new Date("2026-02-25T15:00:00.000Z"); // 25/02/2026 12h (BRT)

const OFFICIAL_PJF_SHELTERS_NOTE =
  "Fonte oficial: Prefeitura de Juiz de Fora (Defesa Civil), atualização de 26/02/2026 às 19h. Coordenadas aproximadas obtidas via OpenStreetMap/Nominatim para exibição no mapa.";

const OFFICIAL_PJF_DONATION_NOTE =
  "Fonte oficial: Prefeitura de Juiz de Fora (SEDH), pontos oficiais de doação publicados em 25/02/2026. Coordenadas aproximadas via OpenStreetMap/Nominatim.";

const OFFICIAL_PJF_SHELTERS = [
  {
    name: "Escola Municipal Raymundo Hargreaves",
    neighborhood: "Bom Jardim",
    address: "Rua Luiz Fávero, 383, Bom Jardim, Juiz de Fora - MG",
    lat: -21.734353,
    lng: -43.3344828,
  },
  {
    name: "Escola Municipal Amélia Pires",
    neighborhood: "Monte Castelo",
    address: "Rua Itatiaia, 570, Monte Castelo, Juiz de Fora - MG",
    lat: -21.7450984,
    lng: -43.381705,
  },
  {
    name: "Escola Municipal Áurea Bicalho",
    neighborhood: "Linhares",
    address: "Rua Odilon Braga, 119, Linhares, Juiz de Fora - MG",
    lat: -21.7345676,
    lng: -43.3282107,
  },
  {
    name: "Escola Municipal Dante Jaime Brochado",
    neighborhood: "Santo Antônio",
    address: "Rua Francisco Fontainha, 163, Santo Antônio, Juiz de Fora - MG",
    lat: -21.7716885,
    lng: -43.3117333,
  },
  {
    name: "Escola Municipal Gabriel Gonçalves",
    neighborhood: "Ipiranga",
    address: "Rua Gabriel Coimbra, 240, Ipiranga, Juiz de Fora - MG",
    lat: -21.7955726,
    lng: -43.349148,
  },
  {
    name: "Escola Municipal Belmira Duarte",
    neighborhood: "Bairro JK",
    address: "Rua Adailton Garcia, 110, Bairro JK, Juiz de Fora - MG",
    lat: -21.7625969,
    lng: -43.3301238,
  },
  {
    name: "Escola Estadual Padre Frederico",
    neighborhood: "Bonfim",
    address: "Rua Carlos Alves, 133, Bonfim, Juiz de Fora - MG",
    lat: -21.7377805,
    lng: -43.3442227,
  },
  {
    name: "Escola Municipal Paulo Rogério",
    neighborhood: "Monte Castelo",
    address: "Rua Coronel Quintão, 136, Monte Castelo, Juiz de Fora - MG",
    lat: -21.745366,
    lng: -43.3825614,
  },
  {
    name: "Escola Municipal Henrique José de Souza",
    neighborhood: "Cidade do Sol",
    address: "Rua Cidade do Sol, 370, Cidade do Sol, Juiz de Fora - MG",
    lat: -21.7167031,
    lng: -43.4091836,
  },
  {
    name: "Escola Municipal Marlene Barros",
    neighborhood: "Marumbi",
    address: "Prolongamento da Rua Marumbi, 56, Marumbi, Juiz de Fora - MG",
    lat: -21.7311549,
    lng: -43.343182,
  },
  {
    name: "Escola Municipal Adhemar Rezende",
    neighborhood: "São Pedro",
    address: "Avenida Senhor dos Passos, 1596, São Pedro, Juiz de Fora - MG",
    lat: -21.7734353,
    lng: -43.3855605,
  },
  {
    name: "Escola Municipal Professor Nilo Camilo Ayupe",
    neighborhood: "Paineiras",
    address: "Rua Almirante Barroso, 155, Paineiras, Juiz de Fora - MG",
    lat: -21.7691565,
    lng: -43.3543078,
  },
  {
    name: "Escola Municipal Fernão Dias",
    neighborhood: "Bandeirantes",
    address: "Rua Gustavo Fernandes Barbosa, 155, Bandeirantes, Juiz de Fora - MG",
    lat: -21.7206859,
    lng: -43.3536659,
  },
  {
    name: "Escola Municipal Dilermando Cruz",
    neighborhood: "Vila Ideal",
    address: "Rua Dr. Altivo Halfeld, 44, Vila Ideal, Juiz de Fora - MG",
    lat: -21.7789569,
    lng: -43.3310312,
  },
  {
    name: "Escola Municipal Irineu Guimarães",
    neighborhood: "São Benedito",
    address: "Rua José Zacarias dos Santos, s/n, São Benedito, Juiz de Fora - MG",
    lat: -21.7502853,
    lng: -43.3259871,
  },
  {
    name: "Escola Estadual Antônio Carlos",
    neighborhood: "Mariano Procópio",
    address: "Av. Cel. Vidal, 180, Mariano Procópio, Juiz de Fora - MG",
    lat: -21.7457525,
    lng: -43.3655345,
  },
  {
    name: "Escola Municipal Antônio Carlos Fagundes",
    neighborhood: "Francisco Bernardino",
    address: "Rua Antônio Lopes Júnior, 35, Francisco Bernardino, Juiz de Fora - MG",
    lat: -21.7352449,
    lng: -43.3954449,
  },
  {
    name: "Escola Municipal Amélia Mascarenhas",
    neighborhood: "São Bernardo",
    address: "Rua Dr. Maurício Guerra, 300, São Bernardo, Juiz de Fora - MG",
    lat: -21.7575574,
    lng: -43.3341546,
  },
] as const;

const OFFICIAL_PJF_DONATION_POINTS = [
  {
    name: "Prédio Sede da PJF",
    city: "Juiz de Fora",
    neighborhood: "Centro",
    address: "Avenida Brasil, 2001 - térreo, Juiz de Fora - MG",
    lat: -21.7581273,
    lng: -43.3438393,
  },
  {
    name: "Casa da Mulher",
    city: "Juiz de Fora",
    neighborhood: "Vitorino Braga",
    address: "Avenida Garibaldi Campinhos, 169, Vitorino Braga, Juiz de Fora - MG",
    lat: -21.7532404,
    lng: -43.3449597,
  },
  {
    name: "Escola Municipal Murilo Mendes",
    city: "Juiz de Fora",
    neighborhood: "Alto Grajaú",
    address: "Rua Doutor Leonel Jaguaribe, 240, Alto Grajaú, Juiz de Fora - MG",
    lat: -21.7454816,
    lng: -43.340989,
  },
  {
    name: "Escola Municipal Professor Nilo Camilo Ayupe",
    city: "Juiz de Fora",
    neighborhood: "Paineiras",
    address: "Rua Almirante Barroso, 155, Paineiras, Juiz de Fora - MG",
    lat: -21.7691565,
    lng: -43.3543078,
  },
  {
    name: "Shopping Jardim Norte",
    city: "Juiz de Fora",
    neighborhood: "Mariano Procópio",
    address: "Avenida Brasil, 6345, Mariano Procópio, Juiz de Fora - MG",
    lat: -21.7404188,
    lng: -43.3709499,
  },
  {
    name: "Unimed Juiz de Fora",
    city: "Juiz de Fora",
    neighborhood: "Centro",
    address: "Avenida Rio Branco, 2540, Juiz de Fora - MG",
    lat: -21.750712,
    lng: -43.3524911,
  },
  {
    name: "Emcasa",
    city: "Juiz de Fora",
    neighborhood: "Costa Carvalho",
    address: "Avenida Sete de Setembro, 975, Costa Carvalho, Juiz de Fora - MG",
    lat: -21.7602075,
    lng: -43.3405628,
  },
  {
    name: "IF Sudeste MG",
    city: "Juiz de Fora",
    neighborhood: "Bairro Fábrica",
    address: "Rua Bernardo Mascarenhas, 1283, Bairro Fábrica, Juiz de Fora - MG",
    lat: -21.7424568,
    lng: -43.3754465,
  },
  {
    name: "Escola Municipal Paulo Rogério dos Santos",
    city: "Juiz de Fora",
    neighborhood: "Monte Castelo",
    address: "Rua Coronel Quintão, 136, Monte Castelo, Juiz de Fora - MG",
    lat: -21.745366,
    lng: -43.3825614,
  },
  {
    name: "Supermercados Bahamas (todas as lojas)",
    city: "Juiz de Fora",
    neighborhood: "Múltiplas unidades",
    address: "Supermercados Bahamas - todas as lojas de Juiz de Fora",
    lat: -21.7615835,
    lng: -43.3499362,
  },
  {
    name: "Sindicato dos Bancários",
    city: "Juiz de Fora",
    neighborhood: "Centro",
    address: "Rua Batista de Oliveira, 745, Centro, Juiz de Fora - MG",
    lat: -21.7574579,
    lng: -43.3477945,
  },
  {
    name: "Igreja Metodista em Bela Aurora",
    city: "Juiz de Fora",
    neighborhood: "Ipiranga",
    address: "Rua Doutor Costa Reis, 380, Ipiranga, Juiz de Fora - MG",
    lat: -21.7899722,
    lng: -43.3530761,
  },
  {
    name: "UniAcademia",
    city: "Juiz de Fora",
    neighborhood: "Centro",
    address: "Rua Halfeld, 1179, Centro, Juiz de Fora - MG",
    lat: -21.7615598,
    lng: -43.3506386,
  },
  {
    name: "Independência Shopping",
    city: "Juiz de Fora",
    neighborhood: "Cascatinha",
    address: "Avenida Presidente Itamar Franco, 3600, Cascatinha, Juiz de Fora - MG",
    lat: -21.7816455,
    lng: -43.3608237,
  },
  {
    name: "AACI",
    city: "Juiz de Fora",
    neighborhood: "Nova Era",
    address: "Rua Doutor Dias da Cruz, 487, Nova Era, Juiz de Fora - MG",
    lat: -21.7043972,
    lng: -43.4216455,
  },
  {
    name: "Secretaria Especial de Igualdade Racial",
    city: "Juiz de Fora",
    neighborhood: "Centro",
    address: "Avenida Rio Branco, 2234, Centro, Juiz de Fora - MG",
    lat: -21.7615835,
    lng: -43.3499362,
  },
  {
    name: "Loja Maçônica",
    city: "Juiz de Fora",
    neighborhood: "São Mateus",
    address: "Rua Cândido Tostes, 212, São Mateus, Juiz de Fora - MG",
    lat: -21.7713713,
    lng: -43.3545182,
  },
  {
    name: "Mister Shopping",
    city: "Juiz de Fora",
    neighborhood: "Centro",
    address: "Rua Mister Moore, 70, Centro, Juiz de Fora - MG",
    lat: -21.7593864,
    lng: -43.3483778,
  },
  {
    name: "Souza Gomes Imóveis",
    city: "Juiz de Fora",
    neighborhood: "São Mateus",
    address: "Avenida Presidente Itamar Franco, 2800, São Mateus, Juiz de Fora - MG",
    lat: -21.7747413,
    lng: -43.3550051,
  },
  {
    name: "Trade Hotel",
    city: "Juiz de Fora",
    neighborhood: "Cascatinha",
    address: "Avenida Presidente Itamar Franco, 3800, Cascatinha, Juiz de Fora - MG",
    lat: -21.781391,
    lng: -43.3622681,
  },
  {
    name: "Shopping Alameda",
    city: "Juiz de Fora",
    neighborhood: "Passos",
    address: "Rua Morais e Castro, 300, Passos, Juiz de Fora - MG",
    lat: -21.7774762,
    lng: -43.3460035,
  },
  {
    name: "Salvaterra Restaurante",
    city: "Juiz de Fora",
    neighborhood: "Salvaterra",
    address: "Avenida Deusdedith Salgado, 4735, Salvaterra, Juiz de Fora - MG",
    lat: -21.8128662,
    lng: -43.3753047,
  },
  {
    name: "Praça de pedágio de Simão Pereira",
    city: "Simão Pereira",
    neighborhood: "BR-040",
    address: "BR-040, km 819, Simão Pereira - MG",
    lat: -21.9282391,
    lng: -43.3163158,
  },
  {
    name: "Sesc Mesa Brasil",
    city: "Juiz de Fora",
    neighborhood: "São Mateus",
    address: "Rua Carlos Chagas, 100, São Mateus, Juiz de Fora - MG",
    lat: -21.7696736,
    lng: -43.3495743,
  },
  {
    name: "Colégio Adventista de Juiz de Fora",
    city: "Juiz de Fora",
    neighborhood: "Dom Bosco",
    address: "Rua Professor Inácio Werneck, 119, Dom Bosco, Juiz de Fora - MG",
    lat: -21.7764116,
    lng: -43.3585359,
  },
  {
    name: "Igreja Adventista do Sétimo Dia - Central de Juiz de Fora",
    city: "Juiz de Fora",
    neighborhood: "Santa Helena",
    address: "Rua Barão de Cataguases, 107, Santa Helena, Juiz de Fora - MG",
    lat: -21.7546084,
    lng: -43.3541351,
  },
  {
    name: "ADRA Juiz de Fora",
    city: "Juiz de Fora",
    neighborhood: "Grajaú",
    address: "Rua Raulina Magalhães, 212, Grajaú, Juiz de Fora - MG",
    lat: -21.7510787,
    lng: -43.3456859,
  },
  {
    name: "Lojas Sr. A Granel",
    city: "Juiz de Fora",
    neighborhood: "Múltiplas unidades",
    address: "Lojas Sr. A Granel - unidades participantes em Juiz de Fora",
    lat: -21.7615835,
    lng: -43.3499362,
  },
  {
    name: "Agências Sicredi",
    city: "Juiz de Fora",
    neighborhood: "Múltiplas unidades",
    address: "Agências Sicredi - unidades participantes em Juiz de Fora",
    lat: -21.7615835,
    lng: -43.3499362,
  },
] as const;

async function main() {
  const adminPassword = await hash("Admin@123", 10);
  const operatorPassword = await hash("Operador@123", 10);

  await prisma.auditLog.deleteMany();
  await prisma.need.deleteMany();
  await prisma.user.deleteMany();
  await prisma.shelter.deleteMany();

  await prisma.user.create({
    data: {
      name: "Administrador SOS Abrigos",
      email: "admin@sosjf.local",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const operator = await prisma.user.create({
    data: {
      name: "Operador SOS Abrigos",
      email: "operador@sosjf.local",
      passwordHash: operatorPassword,
      role: "OPERATOR",
    },
  });

  await prisma.shelter.createMany({
    data: [
      ...OFFICIAL_PJF_SHELTERS.map((shelter) => ({
        type: "SHELTER" as const,
        name: shelter.name,
        city: "Juiz de Fora",
        neighborhood: shelter.neighborhood,
        address: shelter.address,
        lat: shelter.lat,
        lng: shelter.lng,
        status: "OPEN" as const,
        capacity: 0,
        occupancy: 0,
        accessible: false,
        acceptsPets: false,
        publicContact: null,
        hours: null,
        notes: OFFICIAL_PJF_SHELTERS_NOTE,
        createdAt: OFFICIAL_PJF_SHELTERS_UPDATED_AT,
        updatedAt: OFFICIAL_PJF_SHELTERS_UPDATED_AT,
      })),
      ...OFFICIAL_PJF_DONATION_POINTS.map((point) => ({
        type: "DONATION_POINT" as const,
        name: point.name,
        city: point.city,
        neighborhood: point.neighborhood,
        address: point.address,
        lat: point.lat,
        lng: point.lng,
        status: "OPEN" as const,
        capacity: 0,
        occupancy: 0,
        accessible: false,
        acceptsPets: false,
        publicContact: null,
        hours: null,
        notes: OFFICIAL_PJF_DONATION_NOTE,
        createdAt: OFFICIAL_PJF_DONATION_UPDATED_AT,
        updatedAt: OFFICIAL_PJF_DONATION_UPDATED_AT,
      })),
    ],
  });

  const operatorShelter = await prisma.shelter.findFirst({
    where: {
      type: "SHELTER",
      name: OFFICIAL_PJF_SHELTERS[0].name,
    },
    select: { id: true, name: true },
  });

  if (operatorShelter) {
    await prisma.user.update({
      where: { id: operator.id },
      data: { shelterId: operatorShelter.id },
    });
  }

  console.log(`[seed] Abrigos oficiais inseridos: ${OFFICIAL_PJF_SHELTERS.length}`);
  console.log(`[seed] Pontos oficiais de doação inseridos: ${OFFICIAL_PJF_DONATION_POINTS.length}`);
  console.log(`[seed] Fonte (abrigos): ${OFFICIAL_PJF_SHELTERS_SOURCE_URL}`);
  console.log(`[seed] Fonte (doações): ${OFFICIAL_PJF_DONATION_SOURCE_URL}`);
  if (operatorShelter) {
    console.log(`[seed] Operador vinculado ao abrigo: ${operatorShelter.name}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
