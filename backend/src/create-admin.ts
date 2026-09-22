import dotenv from "dotenv";
import { prisma } from "./utils/prisma.js";
import { hashPassword } from "./utils/auth.js";

dotenv.config();

async function main() {
  const passwordHash = await hashPassword(
    "Admin@12345"
  );

  const existingUser = await prisma.user.findUnique({
    where: {
      email: "admin@communitywifi.local",
    },
  });

  if (existingUser) {
    console.log("Admin user already exists.");
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@communitywifi.local",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("Admin created:");
  console.log(user.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
