export type AppRole = "learner" | "instructor" | "admin";

export function isAppRole(role: string | null | undefined): role is AppRole {
  return role === "learner" || role === "instructor" || role === "admin";
}

export function dashboardPath(role: AppRole) {
  if (role === "learner") return "/learner/dashboard";
  if (role === "instructor") return "/instructor/dashboard";
  return "/admin/dashboard";
}

export function roleLabel(role: AppRole) {
  if (role === "learner") return "Learner";
  if (role === "instructor") return "Instructor";
  return "Admin";
}
