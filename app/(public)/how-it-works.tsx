const steps = [
  {
    title: "Join",
    text: "Create a free account.",
  },
  {
    title: "Choose",
    text: "Learn a course, or teach one.",
  },
  {
    title: "Start",
    text: "Open a lesson, or publish your first course.",
  },
]

export function HowItWorks() {
  return (
    <section className="border-y border-border bg-muted/40">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:py-16 md:py-20">
        <h2 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">
          How it works
        </h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title}>
              <p className="font-heading text-2xl font-semibold text-primary">
                {index + 1}
              </p>
              <h3 className="mt-2 font-heading text-lg font-medium text-foreground">
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
