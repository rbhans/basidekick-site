import { PointStackPostDetail } from "@/components/pointstack/feed/post-detail";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params;
  return {
    title: `Post`,
    description: `View post on PointStack`,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  return <PointStackPostDetail slug={slug} />;
}
