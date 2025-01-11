"use client";

import { useState, useEffect, useRef } from "react";
import {
  addMessageToThread,
  runAssistant,
  checkRunStatus,
  getThreadMessages,
} from "@/lib/openai";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string[];
};

export default function ChatInterface({
  initialThreadId,
}: {
  initialThreadId: string;
}) {
  const [threadId, setThreadId] = useState(initialThreadId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: [input],
    } as Message;

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      await addMessageToThread(threadId, input);
      const run = await runAssistant(threadId);

      // Poll for run completion
      const checkStatus = async () => {
        const status = await checkRunStatus(threadId, run.id);

        if (status.status === "completed") {
          const updatedMessages = await getThreadMessages(threadId);

          const formattedMessages = updatedMessages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content.map((c) =>
              c.type === "text" ? c.text.value : ""
            ),
          }));

          setMessages(formattedMessages);
          setIsLoading(false);
        } else if (["failed", "cancelled"].includes(status.status)) {
          setIsLoading(false);
        } else {
          setTimeout(checkStatus, 1000);
        }
      };

      checkStatus();
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
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 text-white p-2 rounded-lg disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
