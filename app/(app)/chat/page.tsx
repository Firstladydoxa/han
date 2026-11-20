"use client";

import { useRouter } from "next/navigation";
import { Chat } from "@/components/Chat";
import { PageTitle } from "@/components/ui";

export default function HanChatPage() {
  const router = useRouter();
  return (
    <div className="han-page">
      <PageTitle eyebrow="HAN · TNI Language Intelligence" title="Your conversation with HAN">
        Ask about doctrine from approved TNI knowledge, translation choices, terminology, or how to find and use features across the platform.
      </PageTitle>
      <Chat onOpenWorkspace={(id) => router.push(`/projects?translation=${encodeURIComponent(id)}`)} />
    </div>
  );
}
