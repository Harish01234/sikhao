import { Closing } from "./closing"
import { Footer } from "./footer"
import { Hero } from "./hero"
import { HowItWorks } from "./how-it-works"
import { Paths } from "./paths"
import { Reviews } from "./reviews"

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Paths />
      <Reviews />
      <Closing />
      <Footer />
    </main>
  )
}
