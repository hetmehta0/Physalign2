import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Heart, Users, Lightbulb, TrendingUp } from "lucide-react"

export default function Mission() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-semibold text-foreground mb-6 tracking-tight leading-tight text-balance">
              Our Mission
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-pretty">
              To transform rehabilitation by making expert physiotherapy guidance accessible, effective, and empowering
              for everyone, everywhere.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="pb-20 md:pb-32 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-secondary/50 rounded-3xl p-8 md:p-12 border border-border/50">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-6">The challenge we're solving</h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Every year, millions of people begin physiotherapy to recover from injuries, surgery, or chronic
                  conditions. Yet research shows that up to 70% of patients don't complete their prescribed home
                  exercises correctly, leading to slower recovery times and increased risk of re-injury.
                </p>
                <p>
                  The problem isn't lack of motivation—it's the absence of real-time guidance. In clinical settings,
                  physiotherapists provide immediate feedback and corrections. But at home, patients are left to guess
                  whether they're performing exercises properly, often reinforcing incorrect movement patterns that can
                  do more harm than good.
                </p>
                <p>
                  This gap between professional supervision and home practice has profound consequences: prolonged
                  recovery times, unnecessary pain, wasted healthcare resources, and frustrated patients who lose
                  confidence in their healing journey.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="pb-20 md:pb-32 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-8 tracking-tight text-center">
              Our solution
            </h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                PhysAlign uses advanced body tracking technology to bring clinical-quality guidance into your home.
                Through your smartphone camera, our AI-powered system analyzes your movement in real-time, providing
                instant feedback on form, range of motion, and technique—just like having a physiotherapist by your
                side.
              </p>
              <p>
                But we're not just replicating clinical care—we're enhancing it. Our platform creates a continuous
                feedback loop between patients and physiotherapists, sharing progress data, identifying problem areas,
                and adapting treatment plans based on real performance metrics. This means more personalized care,
                better outcomes, and faster recovery times.
              </p>
              <p>
                By democratizing access to expert guidance, we're ensuring that geography, cost, and scheduling
                constraints no longer determine the quality of your rehabilitation. Whether you're recovering from ACL
                surgery in a rural town or managing chronic back pain in a busy city, PhysAlign delivers the same level
                of professional care.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="pb-20 md:pb-32 px-6 lg:px-8 bg-secondary/30">
          <div className="max-w-7xl mx-auto py-20 md:py-32">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-semibold text-foreground mb-4 tracking-tight">What drives us</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our core values shape everything we build and every decision we make.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-background rounded-2xl p-8 border border-border/50">
                <div className="w-14 h-14 rounded-full bg-[#D97757]/10 flex items-center justify-center mb-6">
                  <Heart className="w-7 h-7 text-[#D97757]" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Patient-first approach</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every feature we build starts with a simple question: How does this help patients recover faster and
                  more confidently? Your wellbeing is our north star. We obsess over details that might seem small but
                  make a real difference in your daily rehabilitation routine.
                </p>
              </div>

              <div className="bg-background rounded-2xl p-8 border border-border/50">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Lightbulb className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Innovation in care</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We leverage cutting-edge technology—from computer vision to machine learning—to solve real healthcare
                  challenges. But innovation isn't about complexity for its own sake. It's about making sophisticated
                  technology feel simple, intuitive, and accessible to everyone.
                </p>
              </div>

              <div className="bg-background rounded-2xl p-8 border border-border/50">
                <div className="w-14 h-14 rounded-full bg-[#7FA870]/10 flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-[#7FA870]" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Collaborative healing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We don't replace physiotherapists—we empower them. PhysAlign strengthens the connection between
                  patients and their care providers, extending professional expertise into the home and creating a
                  seamless experience that benefits everyone involved in the recovery process.
                </p>
              </div>

              <div className="bg-background rounded-2xl p-8 border border-border/50">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                  <TrendingUp className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Evidence-based results</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We're obsessed with data and measurable outcomes. Our platform tracks your progress with clinical
                  precision, providing insights that keep you motivated and on track. Every recommendation is backed by
                  research, validated by professionals, and proven through real-world results.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="pb-20 md:pb-32 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-semibold text-foreground mb-6 tracking-tight text-balance">
              Building the future of rehabilitation
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-pretty">
              We envision a world where distance, cost, and access are no longer barriers to quality rehabilitation
              care. Where every patient—regardless of location or circumstance—has the tools, guidance, and support they
              need to recover fully and confidently.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-pretty">
              A world where physiotherapists can extend their impact beyond the clinic walls, where data drives
              personalized treatment plans, and where technology truly serves human healing.
            </p>
            <p className="text-lg font-medium text-foreground text-pretty">
              With PhysAlign, that future isn't years away—it's already here. Join us in redefining what's possible in
              rehabilitation care.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
