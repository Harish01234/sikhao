import { AppShell, type AppNavItem } from "@/components/layout/app-sidebar"

const items: AppNavItem[] = [
  { title: "Dashboard", href: "/admin/dashboard" },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppShell label="Admin" items={items}>
      {children}
    </AppShell>
  )
}
