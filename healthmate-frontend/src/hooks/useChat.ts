import { useState, useRef, useEffect, useCallback } from "react";
import { Message } from "../types";
import { generateAIResponse } from "../utils/aiResponse";

interface UseChatOptions {
  initialMessages?: Message[];
  chatId?: string;
}

export const useChat = (options?: UseChatOptions) => {
  const [messages, setMessages] = useState<Message[]>(
    options?.initialMessages || []
  );
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth: boolean = true) => {
    // Use setTimeout to ensure DOM is updated
    setTimeout(() => {
      // Try scrolling the container directly first (more reliable)
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        container.scrollTop = container.scrollHeight;
      }
      // Also try scrollIntoView as a fallback
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({
          behavior: smooth ? "smooth" : "auto",
          block: "end",
          inline: "nearest",
        });
      }
    }, 50);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping, scrollToBottom]);

  // Load initial messages if provided (only when chatId changes to avoid re-scrolling)
  useEffect(() => {
    if (options?.initialMessages && options.initialMessages.length > 0) {
      // Only set messages if they're different to avoid unnecessary updates
      setMessages(options.initialMessages);
      // Scroll to bottom immediately when loading existing chat (no smooth animation)
      const timeoutId = setTimeout(() => {
        scrollToBottom(false);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else if (!options?.chatId) {
      // Reset messages when starting a new chat (chatId is null/undefined)
      // Clear messages if initialMessages is explicitly undefined or empty
      if (!options?.initialMessages || options.initialMessages.length === 0) {
        setMessages([]);
      }
    }
  }, [options?.chatId, options?.initialMessages, scrollToBottom]); // Include scrollToBottom in deps

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          history: [...messages, userMessage].map((m) => ({
            type: m.type,
            content: m.content,
          })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "ai",
          content:
            data.message ||
            data.message ||
            "Sorry, I couldn't generate a response.",
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "ai",
          content: "Sorry, there was an error connecting to the backend.",
          timestamp: new Date(),
        },
      ]);
    }
    setIsTyping(false);
  };

  return {
    messages,
    inputText,
    setInputText,
    isTyping,
    chatEndRef,
    scrollContainerRef,
    handleSendMessage,
  };
};
