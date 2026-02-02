import { PointStackMessagesView } from "@/components/pointstack/messages/inbox-view";

export const metadata = {
  title: "Messages - PointStack",
  description: "Your direct messages on PointStack.",
};

export default function MessagesPage() {
  return <PointStackMessagesView />;
}
