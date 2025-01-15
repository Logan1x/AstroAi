"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

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
  const messagesContainerRef = useRef<null | HTMLDivElement>(null);

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

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      // Scroll to the bottom of the container
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || !threadId) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: [input],
    } as Message;

    // Add user message and clear input
    setMessages((prev) => [userMessage, ...prev]);
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
        // Replace entire message history with new messages
        setMessages(data.messages);
      }

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-grow overflow-y-auto p-4 space-y-4 m-4"
      >
        <div className="h-full space-y-4 flex flex-col">
          {messages
            .slice()
            .reverse()
            .map(
              (
                msg // Reverse the messages here
              ) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="flex items-end space-x-2">
                    {msg.role === "assistant" && (
                      <Image
                        src="https://desilog.sivaramp.com/static/avatars/7.jpg"
                        alt="AI Avatar"
                        width={40}
                        height={40}
                        className="rounded-full scale-x-[-1]"
                      />
                    )}
                    <div
                      className={`p-3 rounded-lg max-w-[90%] ${
                        msg.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      {msg.content.map((content, idx) => (
                        <p key={idx}>{content}</p>
                      ))}
                    </div>
                    {msg.role === "user" && (
                      <Image
                        src="https://desilog.sivaramp.com/static/avatars/22.jpg"
                        alt="User  Avatar"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                  </div>
                </div>
              )
            )}

          {isLoading && (
            <div className={`flex justify-start`}>
              <div className="flex items-end space-x-2">
                <Image
                  src="https://desilog.sivaramp.com/static/avatars/7.jpg"
                  alt="AI Avatar"
                  width={40}
                  height={40}
                  className="rounded-full scale-x-[-1]"
                />
                <div className="bg-gray-200 text-black p-3 rounded-lg max-w-[70%]">
                  Thinking...
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t m-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-grow p-2 border-2 rounded-lg h-16"
            placeholder="Type your message..."
            disabled={isLoading || !threadId}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim() || !threadId}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 text-xl"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
