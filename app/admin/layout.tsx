import { AppShell, type AppNavItem } from "@/components/layout/app-sidebar"
import { requireRole } from "@/lib/auth-redirect"

const items: AppNavItem[] = [
  { title: "Dashboard", href: "/admin/dashboard" },
  { title: "People", href: "/admin/users" },
]

export const instant = false

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireRole("admin")

  return (
    <AppShell
      label="Admin"
      items={items}
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
        role: "admin",
      }}
    >
      {children}
    </AppShell>
  )
}
