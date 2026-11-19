import { AppShell, type AppNavItem } from "@/components/layout/app-sidebar"

const items: AppNavItem[] = [
  { title: "Dashboard", href: "/instructor/dashboard" },
]

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppShell label="Instructor" items={items}>
      {children}
    </AppShell>
  )
}
