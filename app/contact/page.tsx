"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Mail } from "lucide-react"

export default function Contact() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-20 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-semibold text-foreground mb-6 tracking-tight leading-tight text-balance">
              Get in touch
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed text-pretty">
              Have questions about PhysAlign? We'd love to hear from you.
            </p>
          </div>
        </section>

        <section className="pb-20 md:pb-32 px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-background rounded-3xl p-12 md:p-16 border border-border/50 shadow-sm text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#D97757]/10 flex items-center justify-center mx-auto mb-8">
                <Mail className="w-8 h-8 text-[#D97757]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">Email us</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                For all inquiries, support, and partnership opportunities
              </p>
              <a
                href="mailto:hettmehta05@gmail.com"
                className="text-2xl md:text-3xl text-accent hover:text-accent/80 transition-colors font-medium"
              >
                hettmehta05@gmail.com
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
