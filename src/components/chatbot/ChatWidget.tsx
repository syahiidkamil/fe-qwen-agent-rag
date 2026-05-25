import { useEffect, useState } from "react";
import { ChatLauncher } from "@/components/chatbot/ChatLauncher";
import { ChatPanel } from "@/components/chatbot/ChatPanel";

interface ChatWidgetProps {
  /** Initial open state when nothing has been persisted yet. */
  defaultOpen?: boolean;
  /** When set, the open/closed state is mirrored to localStorage under
   *  this key so it survives page reloads (e.g. for /workspace). */
  persistKey?: string;
}

function readPersisted(key: string | undefined, fallback: boolean): boolean {
  if (!key) return fallback;
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    return v === "true";
  } catch {
    return fallback;
  }
}

export function ChatWidget({ defaultOpen = false, persistKey }: ChatWidgetProps = {}) {
  const [open, setOpen] = useState<boolean>(() =>
    readPersisted(persistKey, defaultOpen),
  );

  useEffect(() => {
    if (!persistKey) return;
    try {
      localStorage.setItem(persistKey, String(open));
    } catch {
      // private browsing modes can refuse writes — silent fail is fine
    }
  }, [open, persistKey]);

  return open ? (
    <ChatPanel onClose={() => setOpen(false)} />
  ) : (
    <ChatLauncher onOpen={() => setOpen(true)} />
  );
}
