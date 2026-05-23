import { useState } from "react";
import { ChatLauncher } from "@/components/chatbot/ChatLauncher";
import { ChatPanel } from "@/components/chatbot/ChatPanel";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  return open ? (
    <ChatPanel onClose={() => setOpen(false)} />
  ) : (
    <ChatLauncher onOpen={() => setOpen(true)} />
  );
}
