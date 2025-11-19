import React, { useEffect } from "react";
import { MessageCircle, Heart } from "lucide-react";
import { Message as MessageType } from "../../types";
import { ChatInput } from "./ChatInput";
import { useChat } from "../../hooks/useChat";
import { Message } from "./Message";

interface ChatScreenProps {
  onMessagesChange?: (messages: MessageType[]) => void;
  initialMessages?: MessageType[];
  chatId?: string;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  onMessagesChange,
  initialMessages,
  chatId,
}) => {
  const {
    messages,
    inputText,
    setInputText,
    isTyping,
    chatEndRef,
    scrollContainerRef,
    handleSendMessage,
  } = useChat({ initialMessages, chatId });

  // Notify parent when messages change
  useEffect(() => {
    if (onMessagesChange) {
      onMessagesChange(messages);
    }
  }, [messages, onMessagesChange]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-6 bg-gray-50 min-h-0"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to HealthMate!
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                I'm here to help you understand your health concerns. Describe
                any symptoms or ask health-related questions, and I'll provide
                personalized guidance based on medical knowledge.
              </p>
              <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {[
                  "I have a persistent headache",
                  "Feeling unusually tired lately",
                  "Experiencing stomach discomfort",
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInputText(suggestion)}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  >
                    <MessageCircle className="w-5 h-5 text-blue-600 mb-2" />
                    <p className="text-gray-900 font-medium">{suggestion}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-2xl mr-auto">
                <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-gray-600 ml-2">
                        HealthMate is analyzing your symptoms...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      <ChatInput
        inputText={inputText}
        setInputText={setInputText}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
};
