import { useState, useRef, useEffect } from "react";
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

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial messages if provided
  useEffect(() => {
    if (options?.initialMessages) {
      setMessages(options.initialMessages);
    }
  }, [options?.initialMessages]);

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
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
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
          interaction_id: data.interaction_id, // Store interaction_id from backend
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

  const handleFeedback = async (interactionId: string, feedback: number, comment?: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://127.0.0.1:8000/llm/feedback", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          interaction_id: interactionId,
          feedback,
          feedback_comment: comment,
        }),
      });
      
      // Update local message state to reflect feedback
      setMessages((prev) =>
        prev.map((msg) =>
          msg.interaction_id === interactionId
            ? { ...msg, feedback, feedback_comment: comment }
            : msg
        )
      );
    } catch (err) {
      console.error("Error submitting feedback:", err);
    }
  };

  return {
    messages,
    inputText,
    setInputText,
    isTyping,
    chatEndRef,
    handleSendMessage,
    handleFeedback,
  };
};
