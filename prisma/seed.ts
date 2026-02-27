import "dotenv/config";
import { hash } from "bcryptjs";
import { prisma } from "../lib/prisma";

const OFFICIAL_PJF_SOURCE_URL =
  "https://www.pjf.mg.gov.br/noticias/view.php?modo=link2&idnoticia2=88482";
const OFFICIAL_PJF_UPDATED_AT = new Date("2026-02-26T22:00:00.000Z"); // 26/02/2026 19h (BRT)

const OFFICIAL_PJF_NOTE =
  "Fonte oficial: Prefeitura de Juiz de Fora (Defesa Civil), atualização de 26/02/2026 às 19h. Coordenadas aproximadas obtidas via OpenStreetMap/Nominatim para exibição no mapa.";

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
    data: OFFICIAL_PJF_SHELTERS.map((shelter) => ({
      name: shelter.name,
      city: "Juiz de Fora",
      neighborhood: shelter.neighborhood,
      address: shelter.address,
      lat: shelter.lat,
      lng: shelter.lng,
      status: "OPEN",
      capacity: 0,
      occupancy: 0,
      accessible: false,
      acceptsPets: false,
      publicContact: null,
      hours: null,
      notes: OFFICIAL_PJF_NOTE,
      createdAt: OFFICIAL_PJF_UPDATED_AT,
      updatedAt: OFFICIAL_PJF_UPDATED_AT,
    })),
  });

  const operatorShelter = await prisma.shelter.findFirst({
    where: { name: OFFICIAL_PJF_SHELTERS[0].name },
    select: { id: true, name: true },
  });

  if (operatorShelter) {
    await prisma.user.update({
      where: { id: operator.id },
      data: { shelterId: operatorShelter.id },
    });
  }

  console.log(`[seed] Abrigos oficiais inseridos: ${OFFICIAL_PJF_SHELTERS.length}`);
  console.log(`[seed] Fonte: ${OFFICIAL_PJF_SOURCE_URL}`);
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
