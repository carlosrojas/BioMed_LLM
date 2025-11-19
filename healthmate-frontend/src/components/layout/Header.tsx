import React, { useState, useRef, useEffect } from "react";
import { Settings, LogOut, Save, Edit } from "lucide-react";
import toast from "react-hot-toast";
import { ScreenType, Message } from "../../types";
import { SaveChatModal } from "../chat/SaveChatModal";

interface HeaderProps {
  currentScreen: ScreenType;
  setCurrentScreen?: (screen: ScreenType) => void;
  messages?: Message[];
  onSaveChat?: (title: string) => Promise<void>;
  chatTitle?: string | null;
  isEditing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  setCurrentScreen,
  messages = [],
  onSaveChat,
  chatTitle,
  isEditing = false,
}) => {
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowSettingsDropdown(false);
      }
    };

    if (showSettingsDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSettingsDropdown]);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Close dropdown
    setShowSettingsDropdown(false);

    // Redirect to login
    if (setCurrentScreen) {
      setCurrentScreen("login");
    }
  };

  const handleSaveChat = async (title: string) => {
    if (!onSaveChat) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      await onSaveChat(title);
      setSaveMessage({ type: "success", text: "Chat saved successfully!" });
      toast.success(
        isEditing ? "Chat updated successfully!" : "Chat saved successfully!",
        {
          icon: "✅",
          duration: 3000,
        }
      );
      setTimeout(() => {
        setSaveMessage(null);
        setShowSaveModal(false);
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save chat. Please try again.";
      setSaveMessage({
        type: "error",
        text: errorMessage,
      });
      toast.error(errorMessage, {
        icon: "❌",
        duration: 4000,
      });
      setTimeout(() => setSaveMessage(null), 3000);
      throw error; // Re-throw so modal can handle it
    } finally {
      setIsSaving(false);
    }
  };

  const showSaveButton =
    (currentScreen === "chat" || currentScreen === "dashboard") &&
    messages.length > 0;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentScreen === "chat" && (chatTitle || "AI Health Chat")}
            {currentScreen === "dashboard" && (chatTitle || "AI Health Chat")}
            {currentScreen === "profile" && "My Profile"}
          </h1>
          {(currentScreen === "chat" || currentScreen === "dashboard") && (
            <p className="text-gray-600">
              {chatTitle
                ? "Continue your conversation"
                : "Describe your symptoms and get personalized health guidance"}
            </p>
          )}
        </div>

        <div className="flex items-center">
          {/* Save/Update Chat Button - only show on chat/dashboard screens when messages exist */}
          {showSaveButton && onSaveChat && (
            <>
              <button
                onClick={() => setShowSaveModal(true)}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                title={isEditing ? "Update Chat" : "Save Chat"}
              >
                {isEditing ? (
                  <Edit className="w-5 h-5" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
              </button>

              <SaveChatModal
                isOpen={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                onSave={handleSaveChat}
                messages={messages}
                isSaving={isSaving}
                initialTitle={chatTitle || undefined}
                isEditing={isEditing}
              />
            </>
          )}

          {/* Settings Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {showSettingsDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
