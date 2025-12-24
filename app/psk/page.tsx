import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { SectionLabel } from "@/components/section-label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";

export default function PSKPage() {
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
            <SectionLabel>psk</SectionLabel>

            <h1 className="mt-6 text-4xl md:text-5xl font-semibold tracking-tight max-w-2xl">
              ProjectSidekick
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              Free project management tool for BAS professionals. Track projects,
              manage tasks, and keep your team organized.
            </p>

            <p className="mt-6 font-mono text-2xl text-primary">Free</p>

            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/psk/app">
                  Open PSK
                  <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <SectionLabel>features</SectionLabel>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="text-lg font-semibold mb-2">Project Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Track all your BAS projects in one place with status updates.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="text-lg font-semibold mb-2">Task Management</h3>
                <p className="text-sm text-muted-foreground">
                  Break projects into tasks and track progress.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
                <p className="text-sm text-muted-foreground">
                  Share projects with your team and work together.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground mb-6">
              No account required. Just open and start using.
            </p>
            <Button size="lg" asChild>
              <Link href="/psk/app">
                Open PSK
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
