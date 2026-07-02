import { PointStackMessagesView } from "@/components/pointstack/messages/inbox-view";

export const metadata = {
  title: "Messages",
  description: "Your direct messages on PointStack.",
};

export default function MessagesPage() {
  return <PointStackMessagesView />;
}
