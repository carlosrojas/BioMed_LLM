import React from "react";
import { Heart, MessageCircle, User, Menu, History } from "lucide-react";
import { ScreenType } from "../../types";

interface SidebarProps {
  currentScreen: ScreenType;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setCurrentScreen: (screen: ScreenType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  sidebarOpen,
  setSidebarOpen,
  setCurrentScreen,
}) => {
  const navItems = [
    {
      id: "chat" as ScreenType,
      icon: MessageCircle,
      label: "AI Chat",
      active: currentScreen === "chat" || currentScreen === "dashboard",
    },
    {
      id: "chat-history" as ScreenType,
      icon: History,
      label: "Chat History",
      active: currentScreen === "chat-history",
    },
    {
      id: "profile" as ScreenType,
      icon: User,
      label: "Profile",
      active: currentScreen === "profile",
    },
  ];

  return (
    <div
      className={`${
        sidebarOpen ? "w-64" : "w-16"
      } bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          <div
            className={`flex items-center ${
              sidebarOpen ? "" : "justify-center"
            }`}
          >
            <Heart className="w-8 h-8 text-blue-600" />
            {sidebarOpen && (
              <span className="ml-2 text-xl font-bold text-gray-900">
                HealthMate
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`w-full flex items-center px-3 py-3 rounded-lg transition-colors ${
                item.active
                  ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              } ${sidebarOpen ? "" : "justify-center"}`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span className="ml-3">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
