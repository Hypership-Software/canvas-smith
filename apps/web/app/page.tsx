import { SiteNav } from '@/components/site-nav'
import { Hero } from '@/components/hero'
import { TrustStrip } from '@/components/trust-strip'
import { ProblemSection } from '@/components/problem-section'
import { HowItWorks } from '@/components/how-it-works'
import { SkillsSection } from '@/components/skills-section'
import { RegistryShowcase } from '@/components/registry-showcase'
import { BeforeAfter } from '@/components/before-after'
import { InstallSection } from '@/components/install-section'
import { FAQSection } from '@/components/faq-section'
import { FinalCTA } from '@/components/final-cta'
import { SiteFooter } from '@/components/site-footer'

/**
 * Page — the Canvasmith marketing single page (/), a React Server Component.
 *
 * It composes the section components in the R6 narrative order. Each section is
 * authored independently; this file only imports and renders them. Interactivity
 * and motion live inside the leaf client components, keeping the route itself a
 * server component (zero client JS for the page shell).
 *
 * Order (R6 §3): Nav → Hero → Trust → Problem → How it works → What's included →
 * The registry → Before/After → Install → FAQ → Final CTA → Footer.
 */
export default function Page() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <TrustStrip />
        <ProblemSection />
        <HowItWorks />
        <SkillsSection />
        <RegistryShowcase />
        <BeforeAfter />
        <InstallSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  )
}
