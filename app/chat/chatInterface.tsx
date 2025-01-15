"use client";

import { useState, useEffect, useRef } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string[];
};

export default function ChatInterface({
  initialThreadId,
  userId,
}: {
  initialThreadId: string | null;
  userId: string;
}) {
  const [threadId, setThreadId] = useState<string | null>(initialThreadId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Create thread if not exists
  useEffect(() => {
    const createThread = async () => {
      if (!threadId) {
        try {
          const response = await fetch("/api/chat");
          const data = await response.json();
          setThreadId(data.threadId);
        } catch (error) {
          console.error("Failed to create thread", error);
        }
      }
    };

    createThread();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !threadId) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: [input],
    } as Message;

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId,
          message: input,
          userId,
        }),
      });

      const data = await response.json();

      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      }

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {msg.content.map((content, idx) => (
                <p key={idx}>{content}</p>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-center text-gray-500">Thinking...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-grow p-2 border rounded-lg"
            placeholder="Type your message..."
            disabled={isLoading || !threadId}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim() || !threadId}
            className="bg-blue-500 text-white p-2 rounde d-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
