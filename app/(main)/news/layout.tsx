import { PageHero } from "@/components/page-hero";

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col">
      <PageHero centered imageSrc="/images/hero/news.png">
        <h1 className="text-3xl md:text-[42px] font-heading font-bold tracking-tight">
          News
        </h1>
        <p className="mt-3 text-muted-foreground max-w-[600px] mx-auto text-lg">
          The latest in building automation, curated by AI and the community.
        </p>
      </PageHero>
      <div className="flex-1">{children}</div>
    </div>
  );
}
