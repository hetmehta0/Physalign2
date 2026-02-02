import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="PhysAlign" width={36} height={36} />
              <span className="text-lg font-semibold text-foreground">PhysAlign</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              Redefining innovative rehab with intelligent body tracking technology. Get better, faster, from the
              comfort of home.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Company</h3>
            <div className="flex flex-col gap-3">
              <Link href="/mission" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Our Mission
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Legal</h3>
            <div className="flex flex-col gap-3">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} PhysAlign. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
