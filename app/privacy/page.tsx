import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Home } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Privacy() {
  return (
    <>
      <Navigation />

      <main className="min-h-screen pt-24">
        {/* Hero Section */}
        <section className="pt-32 pb-8 md:pt-40 md:pb-12 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Back to Home Button */}
            <div className="mb-6">
              <Button asChild variant="outline" size="sm" className="gap-2 rounded-full px-4 py-2 shadow-sm">
                <Link href="/">
                  <Home className="w-4 h-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold text-foreground mb-4 tracking-tight">Privacy Policy</h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="pb-20 md:pb-32 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                At PhysAlign, we take your privacy seriously. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our mobile application and services. Please read
                this policy carefully to understand our practices regarding your personal data.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Personal Information</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We may collect personal identification information including your name, email address, phone number,
                    and other contact details when you register for our service or communicate with us.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Health and Exercise Data</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our app collects movement and exercise data through your device's camera to provide body tracking
                    analysis and feedback. This includes joint positioning, range of motion measurements, exercise
                    performance metrics, and progress tracking information.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Camera and Device Information</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We access your device's camera to capture video for real-time body tracking analysis. We also
                    collect device information such as device type, operating system, and app usage data to improve our
                    services and user experience.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the information we collect for the following purposes:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">
                    To provide personalized exercise feedback and body tracking analysis
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">To track your progress and provide performance insights</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">
                    To communicate with you about your rehabilitation journey and app updates
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">
                    To share relevant data with your physiotherapist or healthcare provider (with your explicit consent)
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">To improve our AI algorithms and body tracking technology</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">To ensure the security and proper functioning of our services</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We implement industry-standard security measures to protect your personal and health information. All
                data transmitted between your device and our servers is encrypted using secure protocols. Video data
                captured for body tracking is processed in real-time and not permanently stored unless you explicitly
                choose to save exercise sessions for progress tracking.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we
                strive to use commercially acceptable means to protect your information, we cannot guarantee absolute
                security.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Sharing Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information
                in the following circumstances:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">
                    With your physiotherapist or healthcare provider when you grant explicit permission
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">
                    With service providers who assist in operating our app and delivering our services
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">
                    When required by law or to protect the rights and safety of PhysAlign, our users, or others
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights and Choices</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">Access and review your personal data stored in our system</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">Request corrections to any inaccurate information</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">Delete your account and associated data at any time</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">Opt out of marketing communications</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">Export your exercise and progress data</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not intended for children under the age of 13. We do not knowingly collect personal
                information from children under 13. If you believe we have collected information from a child under 13,
                please contact us immediately so we can delete such information.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal
                requirements. We will notify you of any material changes by posting the new policy on this page and
                updating the "Last updated" date. We encourage you to review this policy periodically.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <a
                href="mailto:hettmehta05@gmail.com"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
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