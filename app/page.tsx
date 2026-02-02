import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowRight, CheckCircle, Smartphone, Activity, Target } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-7xl font-semibold text-foreground mb-6 tracking-tight leading-tight text-balance">
                Redefining innovative rehab
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto text-pretty">
                Real-time body tracking technology that helps you perform exercises correctly at home. Get better,
                faster with intelligent feedback.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/patient"
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all hover:scale-105 inline-flex items-center gap-2 group"
                >
                  Go to Patient App
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/mission"
                  className="px-8 py-4 bg-secondary text-secondary-foreground rounded-full font-medium hover:bg-secondary/80 transition-all inline-flex items-center gap-2"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Image */}
        <section className="px-6 lg:px-8 pb-20 md:pb-32">
          <div className="max-w-5xl mx-auto">
            <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl border border-border/50">
              <Image
                src="/mobile-app-interface-showing-body-tracking-exercis.jpg"
                alt="PhysAlign App Interface showing body tracking technology"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-32 px-6 lg:px-8 bg-secondary/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-3xl md:text-5xl font-semibold text-foreground mb-4 tracking-tight text-balance">
                Physiotherapy, perfected
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                Advanced technology meets rehabilitation science to accelerate your recovery journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background rounded-2xl p-8 border border-border/50 hover:border-accent/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-[#7FA870]/10 flex items-center justify-center mb-6">
                  <Activity className="w-6 h-6 text-[#7FA870]" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Real-time tracking</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Advanced body tracking technology monitors your movements and provides instant feedback on form and
                  technique.
                </p>
              </div>

              <div className="bg-background rounded-2xl p-8 border border-border/50 hover:border-accent/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-[#D97757]/10 flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-[#D97757]" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Precision guidance</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get personalized corrections and insights to ensure every exercise is performed correctly for maximum
                  benefit.
                </p>
              </div>

              <div className="bg-background rounded-2xl p-8 border border-border/50 hover:border-accent/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Home convenience</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Professional-grade physiotherapy guidance from your smartphone, anywhere, anytime. No equipment
                  needed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 md:py-32 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 tracking-tight text-balance">
                  Recover faster with confidence
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  PhysAlign bridges the gap between clinic and home, ensuring you maintain perfect form with every
                  exercise.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#7FA870] mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">Reduce risk of re-injury with proper form guidance</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#7FA870] mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">Track your progress with detailed analytics</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#7FA870] mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">Stay connected with your physiotherapist's treatment plan</p>
                  </div>
                </div>
              </div>
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border border-border/50">
                <Image
                  src="/person-doing-physiotherapy-exercise-at-home-with-s.jpg"
                  alt="Person doing physiotherapy exercises at home with PhysAlign"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="download" className="py-20 md:py-32 px-6 lg:px-8 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-semibold mb-6 tracking-tight text-balance">
              Start your recovery journey today
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto text-pretty">
              Join thousands of patients getting better, faster with PhysAlign's intelligent guidance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/patient"
                className="px-8 py-4 bg-primary-foreground text-primary rounded-full font-medium hover:bg-primary-foreground/90 transition-all hover:scale-105 inline-flex items-center gap-2"
              >
                Download for iOS
              </Link>
              <Link
                href="/patient"
                className="px-8 py-4 bg-primary-foreground/10 text-primary-foreground backdrop-blur-sm rounded-full font-medium hover:bg-primary-foreground/20 transition-all inline-flex items-center gap-2"
              >
                Download for Android
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}