import { AppShell, type AppNavItem } from "@/components/layout/app-sidebar"

const items: AppNavItem[] = [
  { title: "Dashboard", href: "/learner/dashboard" },
]

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppShell label="Learner" items={items}>
      {children}
    </AppShell>
  )
}
