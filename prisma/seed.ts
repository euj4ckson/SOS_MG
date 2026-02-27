import "dotenv/config";
import { hash } from "bcryptjs";
import { prisma } from "../lib/prisma";

const DEFAULT_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@sosjf.local";
const DEFAULT_OPERATOR_EMAIL = process.env.SEED_OPERATOR_EMAIL ?? "operador@sosjf.local";

const DEFAULT_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Admin@123";
const DEFAULT_OPERATOR_PASSWORD = process.env.SEED_OPERATOR_PASSWORD ?? "Operador@123";

async function main() {
  const adminPasswordHash = await hash(DEFAULT_ADMIN_PASSWORD, 10);
  const operatorPasswordHash = await hash(DEFAULT_OPERATOR_PASSWORD, 10);

  const operatorShelter = await prisma.shelter.findFirst({
    where: { type: "SHELTER" },
    orderBy: [{ updatedAt: "desc" }],
    select: { id: true, name: true },
  });

  await prisma.user.upsert({
    where: { email: DEFAULT_ADMIN_EMAIL },
    update: {
      name: "Administrador SOS MG",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
    create: {
      name: "Administrador SOS MG",
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: DEFAULT_OPERATOR_EMAIL },
    update: {
      name: "Operador SOS MG",
      passwordHash: operatorPasswordHash,
      role: "OPERATOR",
      shelterId: operatorShelter?.id ?? null,
    },
    create: {
      name: "Operador SOS MG",
      email: DEFAULT_OPERATOR_EMAIL,
      passwordHash: operatorPasswordHash,
      role: "OPERATOR",
      shelterId: operatorShelter?.id ?? null,
    },
  });

  const [shelterCount, donationPointCount] = await Promise.all([
    prisma.shelter.count({ where: { type: "SHELTER" } }),
    prisma.shelter.count({ where: { type: "DONATION_POINT" } }),
  ]);

  console.log("[seed] Seed executado sem inserir locais hardcoded.");
  console.log(`[seed] Abrigos existentes no banco: ${shelterCount}`);
  console.log(`[seed] Pontos de doacao existentes no banco: ${donationPointCount}`);
  if (operatorShelter) {
    console.log(`[seed] Operador vinculado ao abrigo: ${operatorShelter.name}`);
  } else {
    console.log("[seed] Nenhum abrigo encontrado para vincular o operador.");
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
