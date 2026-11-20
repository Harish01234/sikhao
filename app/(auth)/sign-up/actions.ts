"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/src/lib/prisma";
import { getAuthSession } from "@/lib/auth-redirect";
import {
  dashboardPath,
  isAppRole,
  type AppRole,
} from "@/lib/auth-role";

export async function chooseRole(role: AppRole) {
  if (role !== "learner" && role !== "instructor") {
    return { error: "Pick Learner or Instructor." };
  }

  const session = await getAuthSession();

  if (!session) {
    redirect("/sign-in");
  }

  if (isAppRole(session.user.role)) {
    redirect(dashboardPath(session.user.role));
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role },
  });

  redirect(dashboardPath(role));
}
