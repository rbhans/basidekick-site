import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { SectionLabel } from "@/components/section-label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChatCircle, Clock } from "@phosphor-icons/react/dist/ssr";

const categories = [
  { name: "General", count: 234 },
  { name: "Troubleshooting", count: 421 },
  { name: "Niagara", count: 512 },
  { name: "BACnet", count: 298 },
  { name: "Metasys", count: 187 },
  { name: "basidekick Tools", count: 56 },
];

const recentTopics = [
  {
    title: "Best practices for Niagara point naming conventions?",
    category: "Niagara",
    replies: 12,
    time: "2h ago",
  },
  {
    title: "BACnet device discovery issues on segmented network",
    category: "BACnet",
    replies: 8,
    time: "4h ago",
  },
  {
    title: "NSK template comparison showing false positives",
    category: "basidekick Tools",
    replies: 3,
    time: "6h ago",
  },
];

export default function ForumPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <SectionLabel>forum</SectionLabel>

            <h1 className="mt-6 text-4xl md:text-5xl font-semibold tracking-tight max-w-2xl">
              Ask questions, share knowledge, connect with other pros.
            </h1>

            <Button size="lg" className="mt-8">
              <Plus className="size-4 mr-2" />
              New Topic
            </Button>
          </div>
        </section>

        {/* Recent Topics */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <SectionLabel>recent</SectionLabel>

            <div className="mt-8 space-y-4">
              {recentTopics.map((topic) => (
                <div
                  key={topic.title}
                  className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium hover:text-primary transition-colors">
                        {topic.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <Badge variant="outline">{topic.category}</Badge>
                        <span className="flex items-center gap-1">
                          <ChatCircle className="size-4" />
                          {topic.replies}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-4" />
                          {topic.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <SectionLabel>categories</SectionLabel>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {category.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">
              Forum is coming soon. Join the waitlist to be notified when it launches.
            </p>
            <Button variant="outline" size="lg" className="mt-6">
              Join Waitlist
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
