import React, { useState, useEffect } from "react";
import { MessageSquare, Calendar, Clock, ArrowLeft } from "lucide-react";

interface ChatHistoryScreenProps {
  onBack: () => void;
  onSelectChat: (chatId: string) => void;
}

interface SavedChatResponse {
  _id: string;
  userId: string;
  userEmail: string;
  title: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  createdAt: string;
  savedAt?: string;
}

export const ChatHistoryScreen: React.FC<ChatHistoryScreenProps> = ({
  onBack,
  onSelectChat,
}) => {
  const [savedChats, setSavedChats] = useState<SavedChatResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedChats();
  }, []);

  const fetchSavedChats = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/chat/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSavedChats(data || []);
      } else {
        setError("Failed to load chat history");
      }
    } catch (error) {
      console.error("Error fetching saved chats:", error);
      setError("Failed to load chat history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPreviewText = (
    messages: Array<{ role: string; content: string }>
  ) => {
    if (messages.length === 0) return "No messages";
    const lastMessage = messages[messages.length - 1];
    return (
      lastMessage.content.substring(0, 60) +
      (lastMessage.content.length > 60 ? "..." : "")
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchSavedChats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 bg-gray-50">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chat History</h2>
          <p className="text-gray-600 text-sm mt-1">
            {savedChats.length} saved conversation
            {savedChats.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {savedChats.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No saved chats yet</p>
            <p className="text-gray-500 text-sm">
              Your saved conversations will appear here
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 max-w-4xl">
          {savedChats.map((chat) => (
            <button
              key={chat["_id"]}
              onClick={() => onSelectChat(chat["_id"])}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all text-left"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-lg flex-1">
                  {chat.title}
                </h3>
                <MessageSquare className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
              </div>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {getPreviewText(chat.messages)}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(chat.savedAt || chat.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(chat.savedAt || chat.createdAt)}
                </span>
                <span className="ml-auto">
                  {chat.messages.length} message
                  {chat.messages.length !== 1 ? "s" : ""}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
