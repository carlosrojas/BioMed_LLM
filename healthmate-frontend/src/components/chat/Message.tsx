import React from "react";
import { Heart } from "lucide-react";
import { Message as MessageType } from "../../types";

interface MessageProps {
  message: MessageType;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
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
