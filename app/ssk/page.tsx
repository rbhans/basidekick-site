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
  Cpu,
  Broadcast,
  Timer,
  Sliders,
} from "@phosphor-icons/react/dist/ssr";

const features = [
  {
    icon: Cpu,
    title: "Virtual Devices",
    description: "Create virtual BACnet and Modbus devices in seconds for testing.",
  },
  {
    icon: Broadcast,
    title: "Protocol Support",
    description: "Full BACnet/IP and Modbus TCP/RTU support with configurable responses.",
  },
  {
    icon: Timer,
    title: "Dynamic Values",
    description: "Simulate changing values with patterns, ranges, and randomization.",
  },
  {
    icon: Sliders,
    title: "Easy Configuration",
    description: "Import point lists or configure manually with an intuitive interface.",
  },
];

export default function SSKPage() {
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
              <SectionLabel>ssk</SectionLabel>
              <Badge variant="default">Ready</Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-2xl">
              SimulatorSidekick
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              BACnet/Modbus simulator for testing and development. Create virtual
              devices in seconds without needing physical equipment.
            </p>

            <p className="mt-6 font-mono text-2xl">
              $75{" "}
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
                  <p className="text-muted-foreground">SSK demo video</p>
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
                  <dt className="text-muted-foreground">BACnet</dt>
                  <dd className="font-medium">BACnet/IP</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <dt className="text-muted-foreground">Modbus</dt>
                  <dd className="font-medium">TCP & RTU</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <p className="font-mono text-2xl">
              $75{" "}
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
