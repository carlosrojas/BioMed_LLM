import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { SplashScreen } from "./components/auth/SplashScreen";
import { LoginScreen } from "./components/auth/LoginScreen";
import { SignupScreen } from "./components/auth/SignupScreen";
import { OnboardingScreen } from "./components/onboarding/OnboardingScreen";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ScreenType, UserProfile, LoginForm, SignupForm } from "./types";

const HealthMateApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("splash");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Check auth on mount
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    age: "",
    gender: "",
    allergies: [],
    medications: [],
    conditions: [],
  });
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [signupForm, setSignupForm] = useState<SignupForm>({
    fullName: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    allergies: [],
    medications: [],
    conditions: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to fetch user profile
  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/user/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile({
          name: data.fullName,
          age: data.age,
          gender: data.gender,
          allergies: data.allergies || [],
          medications: data.medications || [],
          conditions: data.conditions || [],
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Check if user is already logged in on app mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");

      // No token found - user not logged in
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        // Validate token by calling the profile endpoint
        const response = await fetch("http://127.0.0.1:8000/user/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // Token is valid - keep user logged in and fetch profile
          const data = await response.json();
          console.log("Valid token found - keeping user logged in");

          // Update user profile
          setUserProfile({
            name: data.fullName,
            age: data.age,
            gender: data.gender,
            allergies: data.allergies || [],
            medications: data.medications || [],
            conditions: data.conditions || [],
          });

          setCurrentScreen("dashboard");
        } else {
          // Token is invalid or expired - remove it
          console.log("Invalid token - clearing storage");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Error validating token:", error);
        // On network error, remove token to be safe
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      if (response.ok) {
        const data = await response.json();

        // Store token and user info
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Fetch and set user profile
        await fetchUserProfile(data.access_token);

        // Navigate to dashboard
        setCurrentScreen("dashboard");
      } else {
        const error = await response.json();
        alert(`Login failed: ${error.detail || "Invalid credentials"}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(
        `Error logging in: ${
          error instanceof Error ? error.message : "Network error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupForm),
      });

      if (response.ok) {
        const data = await response.json();

        // Store token and user info
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Set user profile from signup data
        setUserProfile({
          name: signupForm.fullName,
          age: signupForm.age,
          gender: signupForm.gender,
          allergies: signupForm.allergies || [],
          medications: signupForm.medications || [],
          conditions: signupForm.conditions || [],
        });

        // Navigate to onboarding
        setCurrentScreen("onboarding");
      } else {
        const error = await response.json();
        alert(`Signup failed: ${error.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert(
        `Error signing up: ${
          error instanceof Error ? error.message : "Network error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Main App Render
  const renderScreen = () => {
    // Show loading screen while checking authentication
    if (isCheckingAuth) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">
              Checking authentication...
            </p>
          </div>
        </div>
      );
    }

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
        return <OnboardingScreen setCurrentScreen={setCurrentScreen} />;
      case "dashboard":
      case "chat":
      case "chat-history":
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#363636",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      {renderScreen()}
    </div>
  );
};

export default HealthMateApp;
