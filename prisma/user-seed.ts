import { PrismaClient } from "../prisma/generated/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting user seeding...");

  // Create Admin User
  const adminPassword = await hash("kawanestudiopassword@1921", 10);
  const admin = await prisma.user.upsert({
    where: { email: "kawane.studio1921@gmail.com" },
    update: {},
    create: {
      name: "Admin Kawane Studio",
      email: "kawane.studio1921@gmail.com",
      password: adminPassword,
      role: "ADMIN",
      isVerified: true,
      isDeleted: false,
    },
  });

  // Create Staff User
  const staffPassword = await hash("Staff123!", 10);
  const staff = await prisma.user.upsert({
    where: { email: "staff@kawane.com" },
    update: {},
    create: {
      name: "Staff Kawane",
      email: "staff@kawane.com",
      password: staffPassword,
      role: "STAFF",
      isVerified: true,
      isDeleted: false,
    },
  });

  // Create Test Customers
  const customerPassword = await hash("Customer123!", 10);

  const customer1 = await prisma.user.upsert({
    where: { email: "customer@kawane.com" },
    update: {},
    create: {
      name: "Test Customer",
      email: "customer@kawane.com",
      password: customerPassword,
      role: "CUSTOMER",
      isVerified: true,
      isDeleted: false,
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "john@example.com",
      password: customerPassword,
      role: "CUSTOMER",
      isVerified: true,
      isDeleted: false,
    },
  });

  const customer3 = await prisma.user.upsert({
    where: { email: "jane@example.com" },
    update: {},
    create: {
      name: "Jane Smith",
      email: "jane@example.com",
      password: customerPassword,
      role: "CUSTOMER",
      isVerified: true,
      isDeleted: false,
    },
  });

  // Create additional test customers
  const customer4 = await prisma.user.upsert({
    where: { email: "budi@example.com" },
    update: {},
    create: {
      name: "Budi Santoso",
      email: "budi@example.com",
      password: customerPassword,
      role: "CUSTOMER",
      isVerified: true,
      isDeleted: false,
    },
  });

  const customer5 = await prisma.user.upsert({
    where: { email: "sari@example.com" },
    update: {},
    create: {
      name: "Sari Indah",
      email: "sari@example.com",
      password: customerPassword,
      role: "CUSTOMER",
      isVerified: true,
      isDeleted: false,
    },
  });

  console.log("✅ User seeding completed successfully!");
  console.log("\n📋 Created Users:");
  console.log(`👑 Admin: kawane.studio1921@gmail.com (password: kawanestudiopassword@1921)`);
  console.log(`👨‍💼 Staff: staff@kawane.com (password: Staff123!)`);
  console.log(`👤 Customer: customer@kawane.com (password: Customer123!)`);
  console.log(`👤 Customer: john@example.com (password: Customer123!)`);
  console.log(`👤 Customer: jane@example.com (password: Customer123!)`);
  console.log(`👤 Customer: budi@example.com (password: Customer123!)`);
  console.log(`👤 Customer: sari@example.com (password: Customer123!)`);
  console.log(`\n📊 Total Users: 7`);
}

main()
  .catch((e) => {
    console.error("❌ User seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
