import { PointStackConversationView } from "@/components/pointstack/messages/conversation-view";

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export const metadata = {
  title: "Conversation",
  description: "Direct message conversation on PointStack.",
};

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = await params;
  return <PointStackConversationView conversationId={conversationId} />;
}
