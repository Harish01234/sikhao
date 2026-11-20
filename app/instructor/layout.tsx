import { AppShell, type AppNavItem } from "@/components/layout/app-sidebar"
import { requireRole } from "@/lib/auth-redirect"

const items: AppNavItem[] = [
  { title: "Dashboard", href: "/instructor/dashboard" },
]

export const instant = false

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireRole("instructor")

  return (
    <AppShell
      label="Instructor"
      items={items}
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
        role: "instructor",
      }}
    >
      {children}
    </AppShell>
  )
}
