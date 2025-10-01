import React from "react";
import { Bell, HelpCircle, Settings } from "lucide-react";
import { ScreenType } from "../../types";

interface HeaderProps {
  currentScreen: ScreenType;
}

export const Header: React.FC<HeaderProps> = ({ currentScreen }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentScreen === "chat" && "AI Health Chat"}
            {currentScreen === "profile" && "My Profile"}
          </h1>
          {currentScreen === "chat" && (
            <p className="text-gray-600">
              Describe your symptoms and get personalized health guidance
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
