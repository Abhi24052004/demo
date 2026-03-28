-- CreateTable
CREATE TABLE "Placement" (
    "id" SERIAL NOT NULL,
    "subject" TEXT,
    "body" TEXT,
    "sender" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);
