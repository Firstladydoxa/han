"use client";

import { useRouter } from "next/navigation";
import { Chat } from "@/components/Chat";
import { Crumbs, ProjectGate } from "@/components/ProjectGate";
import { PageTitle } from "@/components/ui";

export default function ChatPage() {
  const router = useRouter();
  return (
    <ProjectGate>
      {({ project }) => (
        <div className="han-page-narrow">
          <Crumbs project={project} here="HAN Chat" />
          <PageTitle eyebrow={project.name} title="HAN Chat">Ask in plain language. HAN prepares a draft; you review, edit and decide what is approved.</PageTitle>
          <Chat project={project} onOpenWorkspace={(id) => router.push(`/projects/${project.id}/workspace?translation=${encodeURIComponent(id)}`)} />
        </div>
      )}
    </ProjectGate>
  );
}
