import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ChatScreen } from "../chat/ChatScreen";
import { ProfileScreen } from "../profile/ProfileScreen";
import { ScreenType, UserProfile } from "../../types";

interface DashboardLayoutProps {
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userProfile: UserProfile;
  setUserProfile: (
    profile: UserProfile | ((prev: UserProfile) => UserProfile)
  ) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentScreen,
  setCurrentScreen,
  sidebarOpen,
  setSidebarOpen,
  userProfile,
  setUserProfile,
}) => {
  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar
        currentScreen={currentScreen}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setCurrentScreen={setCurrentScreen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
        />
        {/* Show chat screen by default on dashboard, or when explicitly on chat */}
        {(currentScreen === "dashboard" || currentScreen === "chat") && (
          <ChatScreen />
        )}
        {currentScreen === "profile" && (
          <ProfileScreen
            setCurrentScreen={setCurrentScreen}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
          />
        )}
      </div>
    </div>
  );
};
