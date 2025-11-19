import React, { useState } from "react";
import { Save, X } from "lucide-react";
import { Message } from "../../types";

interface SaveChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => Promise<void>;
  messages: Message[];
  isSaving?: boolean;
  initialTitle?: string;
  isEditing?: boolean;
}

export const SaveChatModal: React.FC<SaveChatModalProps> = ({
  isOpen,
  onClose,
  onSave,
  messages,
  isSaving = false,
  initialTitle,
  isEditing = false,
}) => {
  const [title, setTitle] = useState(initialTitle || "");
  const [error, setError] = useState<string | null>(null);

  // Update title when initialTitle changes (when modal opens with existing chat)
  React.useEffect(() => {
    if (isOpen && initialTitle) {
      setTitle(initialTitle);
    } else if (isOpen && !initialTitle && messages.length > 0) {
      // Auto-generate title from first user message if available
      const firstUserMessage = messages.find((m) => m.type === "user");
      if (firstUserMessage) {
        const autoTitle = firstUserMessage.content.substring(0, 50);
        setTitle(
          autoTitle.length < firstUserMessage.content.length
            ? autoTitle + "..."
            : autoTitle
        );
      }
    }
  }, [isOpen, initialTitle, messages]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Please enter a title for the conversation");
      return;
    }

    if (messages.length === 0) {
      setError("No messages to save");
      return;
    }

    setError(null);
    try {
      await onSave(title.trim());
      setTitle("");
      onClose();
    } catch (err) {
      setError("Failed to save chat. Please try again.");
    }
  };

  const handleClose = () => {
    setTitle("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Save className="w-5 h-5 text-blue-600" />
            {isEditing ? "Update Chat Conversation" : "Save Chat Conversation"}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSaving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conversation Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError(null);
            }}
            placeholder="Enter a title for this conversation..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={isSaving}
            maxLength={100}
            autoFocus
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <p className="mt-1 text-xs text-gray-500">
            {messages.length} message{messages.length !== 1 ? "s" : ""} will be
            saved
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim() || messages.length === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? "Update" : "Save"}</span>
              </>
            )}
          </button>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
