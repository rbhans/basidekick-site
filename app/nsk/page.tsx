import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { SectionLabel } from "@/components/section-label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KbdHint } from "@/components/kbd-hint";
import {
  ArrowLeft,
  Play,
  Download,
  Browser,
  Check,
  FileMagnifyingGlass,
  TextAa,
  CheckCircle,
  FileText,
} from "@phosphor-icons/react/dist/ssr";

const features = [
  {
    icon: FileMagnifyingGlass,
    title: "Template Comparison",
    description: "Compare points against templates to find inconsistencies and deviations instantly.",
  },
  {
    icon: TextAa,
    title: "Typo Detection",
    description: "Smart analysis finds naming errors, misspellings, and formatting issues.",
  },
  {
    icon: CheckCircle,
    title: "Point Verification",
    description: "Validate point configurations against standards and best practices.",
  },
  {
    icon: FileText,
    title: "Report Generation",
    description: "Generate clean, professional PDF reports to share with customers.",
  },
];

const steps = [
  {
    number: 1,
    title: "Export or Connect",
    description: "Export station CSV or connect live to your Niagara station",
  },
  {
    number: 2,
    title: "Analyze",
    description: "NSK analyzes and groups points by template automatically",
  },
  {
    number: 3,
    title: "Review & Report",
    description: "Review findings, fix issues, and generate clean reports",
  },
];

export default function NSKPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-grow">
        {/* Back Link */}
        <div className="container mx-auto px-4 pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Tools
          </Link>
        </div>

        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-6">
              <SectionLabel>nsk</SectionLabel>
              <Badge variant="default">Ready</Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-2xl">
              NiagaraSidekick
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              QA tool for Niagara stations. Finds typos, compares templates,
              verifies points, generates clean reports.
            </p>

            <p className="mt-6 font-mono text-2xl">
              $79{" "}
              <span className="text-base text-muted-foreground">
                one-time &middot; 1 year updates
              </span>
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button size="lg">
                <Download className="size-4 mr-2" />
                Download for Windows
                <KbdHint keys="D" />
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/nsk/web">
                  <Browser className="size-4 mr-2" />
                  Try Free (Web)
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <SectionLabel>demo</SectionLabel>

            <div className="mt-8 max-w-4xl">
              <div className="aspect-video bg-muted rounded-lg border border-border flex items-center justify-center">
                <div className="text-center">
                  <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Play className="size-8 text-primary" weight="fill" />
                  </div>
                  <p className="text-muted-foreground">NSK demo video</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <SectionLabel>features</SectionLabel>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="p-6 rounded-lg border border-border bg-card"
                >
                  <feature.icon className="size-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <SectionLabel>how it works</SectionLabel>

            <div className="mt-8 max-w-2xl">
              <div className="relative">
                {/* Connecting line */}
                <div className="absolute left-4 top-8 bottom-8 w-px bg-border" />

                <div className="space-y-8">
                  {steps.map((step, index) => (
                    <div key={step.number} className="relative flex gap-6">
                      <div className="relative z-10 flex items-center justify-center size-8 rounded-full bg-primary text-primary-foreground font-mono text-sm font-medium">
                        {step.number}
                      </div>
                      <div className="flex-1 pb-8">
                        <h4 className="font-semibold">{step.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Try Free Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <SectionLabel>try before you buy</SectionLabel>

            <div className="mt-8 max-w-xl">
              <p className="text-muted-foreground">
                Web version is free, works with CSV exports. No account needed.
              </p>
              <Button variant="outline" size="lg" className="mt-6" asChild>
                <Link href="/nsk/web">Try NSK Web &rarr;</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <SectionLabel>requirements</SectionLabel>

            <div className="mt-8 max-w-md">
              <dl className="space-y-4">
                <div className="flex justify-between py-2 border-b border-border">
                  <dt className="text-muted-foreground">Platform</dt>
                  <dd className="font-medium">Windows 10+</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <dt className="text-muted-foreground">For live connection</dt>
                  <dd className="font-medium">Niagara 4.x</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <dt className="text-muted-foreground">CSV works with</dt>
                  <dd className="font-medium">Any Niagara version</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <p className="font-mono text-2xl">
              $79{" "}
              <span className="text-base text-muted-foreground">
                one-time &middot; 1 year updates
              </span>
            </p>
            <Button size="lg" className="mt-6">
              <Download className="size-4 mr-2" />
              Download for Windows
              <KbdHint keys="D" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
