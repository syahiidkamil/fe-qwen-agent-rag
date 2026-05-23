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

export function LandingPage({ withChat = true }: LandingPageProps) {
  const config = useConfigStore((s) => s.config);

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
      {withChat && <ChatWidget />}
    </>
  );
}
