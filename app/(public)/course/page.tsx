import { CourseBrowser } from "./course-browser"
import { listCourses } from "./actions"
import { Footer } from "../footer"

export const instant = false

export default async function CoursePage() {
  const result = await listCourses({ search: "", price: "all" })

  return (
    <main className="flex flex-1 flex-col bg-background text-foreground">
      <CourseBrowser
        initialCourses={result.ok ? result.courses : []}
        initialError={result.ok ? null : result.error}
      />
      <Footer />
    </main>
  )
}
