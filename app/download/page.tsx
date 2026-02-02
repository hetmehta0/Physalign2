import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Clock, Home } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Download() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen flex items-center justify-center px-6 lg:px-8 pt-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <Clock className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-semibold text-foreground mb-6 tracking-tight text-balance">
            Coming Soon
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8 text-pretty">
            We're putting the finishing touches on the PhysAlign app. Our innovative body tracking technology will be
            available for download very soon.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed text-pretty mb-8">
            Want to be notified when we launch? Get in touch with us and we'll keep you updated.
          </p>
          
          {/* Back to Home Button */}
          <div className="mt-8">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/">
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}