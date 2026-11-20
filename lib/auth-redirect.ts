import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { dashboardPath, isAppRole, type AppRole } from "@/lib/auth-role";

export async function getAuthSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireRole(expected: AppRole) {
  const session = await getAuthSession();

  if (!session) {
    redirect("/sign-in");
  }

  const role = session.user.role;

  if (!isAppRole(role)) {
    redirect("/sign-up");
  }

  if (role !== expected) {
    redirect(dashboardPath(role));
  }

  return session;
}
