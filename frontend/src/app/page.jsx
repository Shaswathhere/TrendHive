'use client';

import { About } from "@/components/landing/about"
import { Features } from "@/components/landing/features"
import { Footer } from "@/components/landing/footer"
import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { CTA } from "@/components/landing/cta"

export default function Home() {
  return (
    <div className="bg-[#f5f5ff] dark:bg-[#0c0a1e] min-h-screen">
      <Header />
      <Hero />
      <About />
      <Features />
      <CTA />
      <Footer />
    </div>
  )
}
