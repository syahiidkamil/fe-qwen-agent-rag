import { useConfigStore } from "@/stores/useConfigStore";

interface ChatLauncherProps {
  onOpen: () => void;
}

export function ChatLauncher({ onOpen }: ChatLauncherProps) {
  const widget = useConfigStore((s) => s.config.widget);
  return (
    <button
      type="button"
      className="chat-launcher"
      onClick={onOpen}
      aria-label={`Open ${widget.name} chatbot`}
    >
      <span className="chat-launcher-icon">{widget.initial}</span>
      <span>Ask {widget.name}</span>
      <span className="ping" aria-hidden="true" />
    </button>
  );
}
