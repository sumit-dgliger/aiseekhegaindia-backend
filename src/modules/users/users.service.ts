import type { User } from "@prisma/client";
import { prisma } from "../../db/prisma.js";

export type UpsertGoogleUserInput = {
  googleSub: string;
  email: string;
  emailVerified: boolean;
  name?: string | null;
  pictureUrl?: string | null;
};

export async function upsertByGoogleSub(
  input: UpsertGoogleUserInput,
): Promise<User> {
  return prisma.user.upsert({
    where: { googleSub: input.googleSub },
    create: {
      googleSub: input.googleSub,
      email: input.email,
      emailVerified: input.emailVerified,
      name: input.name ?? null,
      pictureUrl: input.pictureUrl ?? null,
    },
    update: {
      email: input.email,
      emailVerified: input.emailVerified,
      name: input.name ?? null,
      pictureUrl: input.pictureUrl ?? null,
    },
  });
}

export async function findById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    name: user.name,
    pictureUrl: user.pictureUrl,
    createdAt: user.createdAt.toISOString(),
  };
}
