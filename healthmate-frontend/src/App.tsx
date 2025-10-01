import React, { useState } from "react";
import { SplashScreen } from "./components/auth/SplashScreen";
import { LoginScreen } from "./components/auth/LoginScreen";
import { SignupScreen } from "./components/auth/SignupScreen";
import { OnboardingScreen } from "./components/onboarding/OnboardingScreen";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ScreenType, UserProfile, LoginForm, SignupForm } from "./types";

const HealthMateApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("splash");
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    allergies: [],
    medications: [],
    conditions: [],
    language: "English",
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [signupForm, setSignupForm] = useState<SignupForm>({
    firstName: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setCurrentScreen("dashboard");
    }, 1500);
  };

  // Handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setUserProfile((prev) => ({
        ...prev,
        name: signupForm.firstName,
      }));
      setCurrentScreen("onboarding");
    }, 1500);
  };

  // Main App Render
  const renderScreen = () => {
    switch (currentScreen) {
      case "splash":
        return <SplashScreen setCurrentScreen={setCurrentScreen} />;
      case "login":
        return (
          <LoginScreen
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            isLoading={isLoading}
            handleLogin={handleLogin}
            setCurrentScreen={setCurrentScreen}
          />
        );
      case "signup":
        return (
          <SignupScreen
            signupForm={signupForm}
            setSignupForm={setSignupForm}
            isLoading={isLoading}
            handleSignup={handleSignup}
            setCurrentScreen={setCurrentScreen}
          />
        );
      case "onboarding":
        return (
          <OnboardingScreen
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            setCurrentScreen={setCurrentScreen}
          />
        );
      case "dashboard":
      case "chat":
      case "profile":
        return (
          <DashboardLayout
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
          />
        );
      default:
        return <SplashScreen setCurrentScreen={setCurrentScreen} />;
    }
  };

  return <div className="min-h-screen bg-gray-100">{renderScreen()}</div>;
};

export default HealthMateApp;
