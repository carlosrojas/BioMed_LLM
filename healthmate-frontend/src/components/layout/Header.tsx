import React, { useState, useRef, useEffect } from "react";
import { Bell, HelpCircle, Settings, LogOut, User } from "lucide-react";
import { ScreenType } from "../../types";

interface HeaderProps {
  currentScreen: ScreenType;
  setCurrentScreen?: (screen: ScreenType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  setCurrentScreen,
}) => {
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
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

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentScreen === "chat" && "AI Health Chat"}
            {currentScreen === "dashboard" && "AI Health Chat"}
            {currentScreen === "profile" && "My Profile"}
          </h1>
          {(currentScreen === "chat" || currentScreen === "dashboard") && (
            <p className="text-gray-600">
              Describe your symptoms and get personalized health guidance
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
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
