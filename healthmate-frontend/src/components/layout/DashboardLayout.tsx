import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ChatScreen } from "../chat/ChatScreen";
import { ProfileScreen } from "../profile/ProfileScreen";
import { ChatHistoryScreen } from "../chat/ChatHistoryScreen";
import { ScreenType, UserProfile, Message } from "../../types";

interface DashboardLayoutProps {
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userProfile: UserProfile;
  setUserProfile: (
    profile: UserProfile | ((prev: UserProfile) => UserProfile)
  ) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentScreen,
  setCurrentScreen,
  sidebarOpen,
  setSidebarOpen,
  userProfile,
  setUserProfile,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentChatTitle, setCurrentChatTitle] = useState<string | null>(null);
  const [chatResetKey, setChatResetKey] = useState<string>("new-chat");

  // Reset chat state when navigating away from chat screens
  useEffect(() => {
    if (currentScreen !== "chat" && currentScreen !== "dashboard") {
      setMessages([]);
      setCurrentChatId(null);
      setCurrentChatTitle(null);
    }
  }, [currentScreen]);

  const handleSelectChat = async (chatId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `http://127.0.0.1:8000/chat/history/${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load chat");
      }

      const chatData = await response.json();

      // Convert backend message format (role) to frontend format (type)
      const convertedMessages: Message[] = chatData.messages.map(
        (msg: any, index: number) => ({
          id: `${chatId}-${index}`,
          type:
            msg.role === "user" ? "user" : msg.role === "ai" ? "ai" : "user",
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        })
      );

      setMessages(convertedMessages);
      setCurrentChatId(chatId);
      setCurrentChatTitle(chatData.title);
      // Update reset key when loading a chat to ensure proper remounting
      setChatResetKey(chatId);
      setCurrentScreen("chat");
    } catch (error) {
      console.error("Error loading chat:", error);
      alert("Failed to load chat. Please try again.");
    }
  };

  const handleNewChat = () => {
    // Reset all chat-related state - force complete reset
    setMessages([]);
    setCurrentChatId(null);
    setCurrentChatTitle(null);
    // Force ChatScreen to remount by changing the key
    setChatResetKey(`new-chat-${Date.now()}`);
    // Ensure we're on the dashboard/chat screen
    if (currentScreen !== "chat" && currentScreen !== "dashboard") {
      setCurrentScreen("dashboard");
    }
  };

  const handleSaveChat = async (title: string) => {
    if (messages.length === 0) {
      throw new Error("No messages to save");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    // If updating existing chat
    if (currentChatId) {
      const response = await fetch(
        `http://127.0.0.1:8000/chat/history/${currentChatId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title,
            messages: messages.map((m) => ({
              role: m.type === "user" ? "user" : "ai",
              content: m.content,
              timestamp:
                m.timestamp instanceof Date
                  ? m.timestamp.toISOString()
                  : m.timestamp,
            })),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to update chat");
      }

      setCurrentChatTitle(title);
      return await response.json();
    } else {
      // Creating new chat
      const response = await fetch("http://127.0.0.1:8000/chat/save", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.map((m) => ({
            type: m.type,
            content: m.content,
            timestamp:
              m.timestamp instanceof Date
                ? m.timestamp.toISOString()
                : m.timestamp,
          })),
          title: title,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to save chat");
      }

      const savedChat = await response.json();
      const newChatId = savedChat.id || savedChat._id;
      setCurrentChatId(newChatId);
      setCurrentChatTitle(title);
      // Update reset key when saving a new chat
      setChatResetKey(newChatId);
      return savedChat;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar
        currentScreen={currentScreen}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setCurrentScreen={setCurrentScreen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
          messages={messages}
          onSaveChat={handleSaveChat}
          onNewChat={handleNewChat}
          chatTitle={currentChatTitle}
          isEditing={!!currentChatId}
        />
        {/* Show chat screen by default on dashboard, or when explicitly on chat */}
        {(currentScreen === "dashboard" || currentScreen === "chat") && (
          <ChatScreen
            onMessagesChange={setMessages}
            initialMessages={
              currentChatId && messages.length > 0 ? messages : undefined
            }
            chatId={currentChatId || undefined}
            key={currentChatId || chatResetKey} // Force re-render when chat ID changes or reset key changes
          />
        )}
        {currentScreen === "chat-history" && (
          <ChatHistoryScreen
            onBack={() => setCurrentScreen("chat")}
            onSelectChat={handleSelectChat}
          />
        )}
        {currentScreen === "profile" && (
          <ProfileScreen
            setCurrentScreen={setCurrentScreen}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
          />
        )}
      </div>
    </div>
  );
};
