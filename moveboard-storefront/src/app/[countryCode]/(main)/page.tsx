import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import Problem from "@modules/home/components/problem"
import Solution from "@modules/home/components/solution"
import Benefits from "@modules/home/components/benefits"
import OurStory from "@modules/home/components/our-story"
import CTASection from "@modules/home/components/cta-section"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Moveboard™ Flow — Active Standing Board for Modern Workspaces",
  description:
    "Moveboard™ Flow is a premium active standing board designed in India. Make movement intuitive — not forced, not extreme, just natural. Engineered for the modern workspace.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <Hero />
      <Problem />
      <Solution />
      <Benefits />
      <OurStory />
      <div className="py-16 bg-[#0f0f0f]">
        <div className="content-container">
          <div className="text-center mb-12">
            <span className="text-[#c4956a] text-sm font-medium tracking-[0.2em] uppercase mb-4 block">
              Shop
            </span>
            <h2 className="text-3xl small:text-4xl font-bold text-white">
              Featured Products
            </h2>
          </div>
          <ul className="flex flex-col gap-x-6">
            <FeaturedProducts collections={collections} region={region} />
          </ul>
        </div>
      </div>
      <CTASection />
    </>
  )
}
