"use client";

import { SectionLabel } from "@/components/section-label";
import { CircuitBackground } from "@/components/circuit-background";
import { QrCode, Camera, ShieldCheck, Database, Users, EnvelopeSimple } from "@phosphor-icons/react";

function PolicySection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-primary">{icon}</span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="text-muted-foreground leading-relaxed pl-8">
        {children}
      </div>
    </div>
  );
}

export function QRSidekickPrivacyView() {
  const lastUpdated = "January 12, 2025";

  return (
    <div className="min-h-full">
      {/* Header */}
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.15} colorGradient />
        <div className="container mx-auto px-4 relative z-10">
          <SectionLabel variant="resources">legal</SectionLabel>

          <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
            QR Sidekick Privacy Policy
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-card border border-border p-6 md:p-8">
            <PolicySection title="Introduction" icon={<QrCode className="size-5" />}>
              <p>
                QR Sidekick is a mobile application that allows you to scan QR codes using your
                device&apos;s camera. We are committed to protecting your privacy and being transparent
                about our data practices.
              </p>
            </PolicySection>

            <PolicySection title="Camera Access" icon={<Camera className="size-5" />}>
              <p className="mb-3">
                QR Sidekick requires access to your device&apos;s camera solely for the purpose of
                scanning QR codes. When you use the app:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Camera images are processed entirely on your device</li>
                <li>No images or camera data are ever transmitted to external servers</li>
                <li>No images or camera data are stored permanently</li>
                <li>Camera access is only active while you are actively scanning</li>
              </ul>
            </PolicySection>

            <PolicySection title="Data Collection" icon={<Database className="size-5" />}>
              <p className="mb-3">
                <strong className="text-foreground">We do not collect any personal data.</strong>
              </p>
              <p className="mb-3">QR Sidekick does not:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Collect personal information</li>
                <li>Track your location</li>
                <li>Record your scanning history</li>
                <li>Use analytics or tracking services</li>
                <li>Share any data with third parties</li>
                <li>Require account creation or login</li>
              </ul>
            </PolicySection>

            <PolicySection title="Data Storage" icon={<ShieldCheck className="size-5" />}>
              <p>
                All data processed by QR Sidekick remains on your device. We do not operate servers
                that store user data. The app functions entirely offline after installation.
              </p>
            </PolicySection>

            <PolicySection title="Third-Party Services" icon={<Users className="size-5" />}>
              <p>
                QR Sidekick does not integrate with any third-party analytics, advertising, or
                tracking services. The app contains no ads and makes no network requests.
              </p>
            </PolicySection>

            <PolicySection title="Children's Privacy" icon={<Users className="size-5" />}>
              <p>
                Because QR Sidekick does not collect any data from any user, it is compliant with
                the Children&apos;s Online Privacy Protection Act (COPPA) and similar regulations.
              </p>
            </PolicySection>

            <PolicySection title="Changes to This Policy" icon={<ShieldCheck className="size-5" />}>
              <p>
                If we make changes to this privacy policy, we will update the &quot;Last updated&quot; date
                at the top of this page. We encourage you to review this policy periodically.
              </p>
            </PolicySection>

            <PolicySection title="Contact Us" icon={<EnvelopeSimple className="size-5" />}>
              <p>
                If you have any questions about this privacy policy or QR Sidekick&apos;s privacy
                practices, please contact us at:{" "}
                <a
                  href="mailto:rob@basidekick.com"
                  className="text-primary hover:underline"
                >
                  rob@basidekick.com
                </a>
              </p>
            </PolicySection>
          </div>
        </div>
      </section>
    </div>
  );
}
