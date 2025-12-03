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
      
      // Extract message from response (backend returns {status, message, retrieved, interaction_id})
      const messageContent = data.message || "Sorry, I couldn't generate a response.";
      
      // Extract sources from retrieved documents
      const sources = data.retrieved 
        ? data.retrieved.map((hit: any) => {
            // Format source name nicely (remove .md/.pdf extension, handle subdirectories, capitalize)
            let sourceId = hit.id || "";
            
            // Remove chunk suffix if present (e.g., "file.pdf#chunk_1" -> "file.pdf")
            sourceId = sourceId.split("#chunk_")[0];
            
            // Remove file extension
            sourceId = sourceId.replace(/\.(md|pdf)$/i, "");
            
            // Replace path separators and underscores with spaces
            sourceId = sourceId.replace(/[\/\\]/g, " / ").replace(/_/g, " ");
            
            // Capitalize words
            const formattedId = sourceId.replace(/\b\w/g, (l: string) => l.toUpperCase());
            
            return formattedId || "Medical guideline";
          })
        : [];
      
      // Determine if this is an urgent/abstain response
      const status = data.status || "ok";
      const isUrgent = status === "urgent";
      const isAbstain = status === "abstain";
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "ai",
          content: messageContent,
          timestamp: new Date(),
          interaction_id: data.interaction_id,
          sources: sources.length > 0 ? sources : undefined,
          status: status,
          // Add visual indicators for status
          ...(isUrgent && { confidence: 1.0 }), // High confidence for urgent
          ...(isAbstain && { confidence: 0.3 }), // Low confidence for abstain
          ...(!isUrgent && !isAbstain && { confidence: 0.8 }), // Default confidence for normal responses
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
    scrollContainerRef,
    handleSendMessage,
    handleFeedback,
  };
};
