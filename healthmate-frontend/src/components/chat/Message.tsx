import React, { useState } from "react";
import { Heart, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Message as MessageType } from "../../types";

interface MessageProps {
  message: MessageType;
  onFeedback?: (interactionId: string, feedback: number, comment?: string) => void;
}

export const Message: React.FC<MessageProps> = ({ message, onFeedback }) => {
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [localFeedback, setLocalFeedback] = useState(message.feedback);

  const handleFeedback = (feedback: number) => {
    if (!message.interaction_id || !onFeedback) return;
    
    setLocalFeedback(feedback);
    
    // If thumbs down, show comment input
    if (feedback === -1) {
      setShowFeedbackInput(true);
    } else {
      // Thumbs up - submit immediately
      onFeedback(message.interaction_id, feedback);
      setShowFeedbackInput(false);
    }
  };

  const submitFeedbackWithComment = () => {
    if (!message.interaction_id || !onFeedback) return;
    onFeedback(message.interaction_id, localFeedback!, feedbackComment);
    setShowFeedbackInput(false);
    setFeedbackComment("");
  };

  return (
    <div
      className={`flex ${
        message.type === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-2xl ${
          message.type === "user" ? "ml-auto" : "mr-auto"
        }`}
      >
        <div
          className={`p-6 rounded-xl ${
            message.type === "user"
              ? "bg-blue-600 text-white"
              : "bg-white shadow-sm border border-gray-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {message.type === "ai" && (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 text-blue-600" />
              </div>
            )}
            <div className="flex-1">
              <p className="whitespace-pre-wrap text-lg leading-relaxed">
                {message.content}
              </p>
              {message.confidence && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="text-sm text-gray-600">
                    Confidence:{" "}
                    <span className="font-medium">
                      {Math.round(message.confidence * 100)}%
                    </span>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${message.confidence * 100}%` }}
                    />
                  </div>
                </div>
              )}
              {message.sources && (
                <div className="mt-4">
                  <details className="text-sm">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                      View Sources
                    </summary>
                    <ul className="mt-2 space-y-1 text-gray-600">
                      {message.sources.map((source, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full" />
                          {source}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              )}
              
              {/* Feedback buttons for AI messages */}
              {message.type === "ai" && message.interaction_id && onFeedback && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 mr-2">Was this helpful?</span>
                    <button
                      onClick={() => handleFeedback(1)}
                      className={`p-2 rounded-lg transition-colors ${
                        localFeedback === 1
                          ? "bg-green-100 text-green-600"
                          : "hover:bg-gray-100 text-gray-600"
                      }`}
                      disabled={localFeedback !== undefined}
                      title="Thumbs up"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFeedback(-1)}
                      className={`p-2 rounded-lg transition-colors ${
                        localFeedback === -1
                          ? "bg-red-100 text-red-600"
                          : "hover:bg-gray-100 text-gray-600"
                      }`}
                      disabled={localFeedback !== undefined && !showFeedbackInput}
                      title="Thumbs down"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Feedback comment input (shown when thumbs down) */}
                  {showFeedbackInput && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-500 mt-2 flex-shrink-0" />
                        <textarea
                          value={feedbackComment}
                          onChange={(e) => setFeedbackComment(e.target.value)}
                          placeholder="What could be improved? (optional)"
                          className="flex-1 p-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setShowFeedbackInput(false);
                            setFeedbackComment("");
                            setLocalFeedback(undefined);
                          }}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={submitFeedbackWithComment}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div
            className={`text-xs mt-3 ${
              message.type === "user" ? "text-blue-100" : "text-gray-500"
            }`}
          >
            {message.timestamp.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};
