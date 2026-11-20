import { AppShell, type AppNavItem } from "@/components/layout/app-sidebar"
import { requireRole } from "@/lib/auth-redirect"

const items: AppNavItem[] = [
  { title: "Dashboard", href: "/learner/dashboard" },
]

export const instant = false

export default async function LearnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireRole("learner")

  return (
    <AppShell
      label="Learner"
      items={items}
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
        role: "learner",
      }}
    >
      {children}
    </AppShell>
  )
}
