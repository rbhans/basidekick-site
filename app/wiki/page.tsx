import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { SectionLabel } from "@/components/section-label";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

const categories = [
  {
    title: "Protocols",
    items: ["BACnet", "Modbus", "LonWorks", "MQTT"],
  },
  {
    title: "Platforms",
    items: ["Niagara", "Metasys", "EcoStruxure"],
  },
  {
    title: "Equipment",
    items: ["VAV Boxes", "AHUs", "Chillers", "Boilers", "VFDs"],
  },
  {
    title: "Reference",
    items: ["Error Codes", "Point Naming", "HVAC Formulas"],
  },
];

export default function WikiPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <SectionLabel>wiki</SectionLabel>

            <h1 className="mt-6 text-4xl md:text-5xl font-semibold tracking-tight max-w-2xl">
              Guides, references, and troubleshooting for BAS professionals.
            </h1>

            {/* Search */}
            <div className="mt-10 max-w-xl">
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search wiki... (Cmd+K)"
                  className="w-full h-12 pl-10 pr-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.map((category) => (
                <div key={category.title}>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
                    {category.title}
                  </h3>
                  <ul className="space-y-2">
                    {category.items.map((item) => (
                      <li key={item}>
                        <Link
                          href={`/wiki/${item.toLowerCase().replace(/\s+/g, "-")}`}
                          className="text-sm hover:text-primary transition-colors"
                        >
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">
              Wiki content is being developed. Check back soon for comprehensive
              guides and references.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
