import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Home } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Terms() {
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
            <h1 className="text-4xl md:text-6xl font-semibold text-foreground mb-4 tracking-tight">Terms of Service</h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="pb-20 md:pb-32 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using PhysAlign's mobile application and services, you agree to be bound by these Terms
                of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are
                prohibited from using our services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Medical Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                PhysAlign is designed to complement, not replace, professional medical advice, diagnosis, or treatment.
                Our app provides exercise guidance and body tracking feedback but does not constitute medical advice.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4 font-medium">
                Important: Always consult with a qualified healthcare provider before starting any new exercise or
                rehabilitation program. Stop using the app immediately if you experience pain, discomfort, or any
                adverse effects during exercise.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                PhysAlign is not liable for any injuries or health complications that may arise from using our services.
                You assume all risks associated with your use of the app and acknowledge that you are solely responsible
                for your health and wellbeing.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Use License</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                PhysAlign grants you a limited, non-exclusive, non-transferable license to use our mobile application
                for personal, non-commercial purposes, subject to these terms. This license does not include:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">Modifying or copying the app or any content</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">Using the app for commercial purposes or public display</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">Attempting to reverse engineer or decompile the software</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">Removing any copyright or proprietary notations</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">Transferring the app to another person or entity</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To access certain features of PhysAlign, you must create an account. You are responsible for:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">Maintaining the confidentiality of your account credentials</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">All activities that occur under your account</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">Notifying us immediately of any unauthorized use</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">Providing accurate and complete information</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent
                or inappropriate behavior.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Privacy and Data Collection</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your use of PhysAlign is also governed by our Privacy Policy, which explains how we collect, use, and
                protect your personal and health information. By using our services, you consent to the data practices
                described in our Privacy Policy. Please review it carefully to understand how your data is handled.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree not to use PhysAlign for any unlawful purpose or in any way that could harm, disable, or
                impair our services. Prohibited activities include:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">Violating any applicable laws or regulations</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">Impersonating others or providing false information</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">Transmitting malware, viruses, or harmful code</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">Harassing, abusing, or threatening others</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">Attempting to gain unauthorized access to our systems</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content, features, and functionality of PhysAlign, including but not limited to text, graphics,
                logos, software, and algorithms, are owned by PhysAlign and protected by international copyright,
                trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create
                derivative works without our express written permission.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To the fullest extent permitted by law, PhysAlign and its affiliates, officers, directors, employees,
                and agents shall not be liable for any indirect, incidental, special, consequential, or punitive
                damages, or any loss of profits or revenues, whether incurred directly or indirectly, arising from:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">Your use or inability to use our services</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">Any injuries or health complications from exercise programs</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">Errors or omissions in any content or functionality</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="leading-relaxed">Unauthorized access to your data or account</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Service Availability</h2>
              <p className="text-muted-foreground leading-relaxed">
                We strive to maintain consistent availability of PhysAlign but do not guarantee uninterrupted or
                error-free operation. We reserve the right to modify, suspend, or discontinue any aspect of our services
                at any time without prior notice. We are not liable for any interruptions or modifications to our
                services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your access to PhysAlign immediately, without prior notice or liability, for
                any reason, including breach of these Terms of Service. Upon termination, your right to use the app will
                cease immediately, and you must delete the app from your devices.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. We will notify users of material
                changes by updating the "Last updated" date and, when appropriate, through in-app notifications or
                email. Your continued use of PhysAlign after changes are posted constitutes acceptance of the modified
                terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with applicable laws, without
                regard to conflict of law provisions. Any disputes arising from these terms or your use of PhysAlign
                shall be resolved through binding arbitration.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us at:
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