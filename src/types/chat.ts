export interface ChatSource {
  id: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  sources?: ChatSource[];
}
