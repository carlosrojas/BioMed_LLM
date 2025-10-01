import React from "react";
import { Mic, Send } from "lucide-react";

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  handleSendMessage: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputText,
  setInputText,
  handleSendMessage,
}) => {
  return (
    <div className="bg-white border-t border-gray-200 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-4">
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" &&
                !e.shiftKey &&
                (e.preventDefault(), handleSendMessage())
              }
              placeholder="Describe your symptoms or ask a health question..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
            <button className="absolute right-3 bottom-3 text-gray-400 hover:text-blue-600 transition-colors">
              <Mic className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line. Remember: This is AI
          guidance, not medical diagnosis.
        </p>
      </div>
    </div>
  );
};
