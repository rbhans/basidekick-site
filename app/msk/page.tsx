import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { SectionLabel } from "@/components/section-label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell } from "@phosphor-icons/react/dist/ssr";

export default function MSKPage() {
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
              <SectionLabel>msk</SectionLabel>
              <Badge variant="secondary">Dev</Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-2xl">
              MetasysSidekick
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              QA tool for Metasys systems. Same power as NSK, built for JCI
              environments. Currently in development.
            </p>

            <p className="mt-6 font-mono text-2xl">
              $79{" "}
              <span className="text-base text-muted-foreground">
                one-time &middot; 1 year updates
              </span>
            </p>

            <div className="mt-8">
              <Button size="lg">
                <Bell className="size-4 mr-2" />
                Notify Me When Ready
              </Button>
            </div>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <SectionLabel>coming soon</SectionLabel>

            <div className="mt-8 max-w-xl">
              <p className="text-muted-foreground">
                MSK is currently in development. It will include the same powerful
                QA features as NSK, optimized for Metasys systems:
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Template comparison for Metasys objects
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Point naming validation
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Configuration verification
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Professional report generation
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Notify Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground mb-6">
              Be the first to know when MSK is ready.
            </p>
            <Button size="lg">
              <Bell className="size-4 mr-2" />
              Notify Me When Ready
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
