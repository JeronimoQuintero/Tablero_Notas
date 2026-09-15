CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'USER',
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Note" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL DEFAULT '',
  "text" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'Pendiente',
  "x" INTEGER NOT NULL DEFAULT 80,
  "y" INTEGER NOT NULL DEFAULT 80,
  CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
