import { NewsList } from "@/components/news/news-list";

export const metadata = {
  title: "News — BASidekick",
  description: "The latest building automation news, curated by AI and the community.",
};

export default function NewsPage() {
  return <NewsList />;
}
