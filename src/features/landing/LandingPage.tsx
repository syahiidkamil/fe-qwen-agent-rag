import { useEffect } from "react";
import { useConfigStore } from "@/stores/useConfigStore";
import { LandingNav } from "@/features/landing/sections/LandingNav";
import { HeroSection } from "@/features/landing/sections/HeroSection";
import { Marquee } from "@/features/landing/sections/Marquee";
import { StatsStrip } from "@/features/landing/sections/StatsStrip";
import { ProgramsSection } from "@/features/landing/sections/ProgramsSection";
import { FlowSection } from "@/features/landing/sections/FlowSection";
import { LandingFooter } from "@/features/landing/sections/LandingFooter";
import { ChatWidget } from "@/components/chatbot/ChatWidget";

interface LandingPageProps {
  withChat?: boolean;
}

function isPreviewMode(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("preview");
}

export function LandingPage({ withChat = true }: LandingPageProps) {
  const config = useConfigStore((s) => s.config);
  const preview = isPreviewMode();

  // When embedded in the CMS preview iframe, rehydrate from localStorage on
  // every parent config change so edits show up live.
  useEffect(() => {
    if (!preview) return;
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "airanext:config:updated") {
        useConfigStore.persist.rehydrate();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [preview]);

  return (
    <>
      <LandingNav config={config} />
      <main>
        <HeroSection config={config} />
        {config.layout.showMarquee !== false && (
          <Marquee items={config.marquee} />
        )}
        {config.layout.showStats !== false && <StatsStrip config={config} />}
        <ProgramsSection config={config} />
        <FlowSection config={config} />
      </main>
      <LandingFooter config={config} />
      {withChat && !preview && <ChatWidget />}
    </>
  );
}
