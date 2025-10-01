import React from "react";
import { Heart, MessageCircle, Shield, Globe } from "lucide-react";
import { ScreenType } from "../../types";

interface SplashScreenProps {
  setCurrentScreen: (screen: ScreenType) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  setCurrentScreen,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-8">
        <div className="text-center">
          <div className="mb-12">
            <Heart className="w-24 h-24 text-blue-600 mx-auto mb-6 animate-pulse" />
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              HealthMate
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your AI-Powered Health Companion
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Get instant health guidance, symptom analysis, and personalized
              recommendations from our advanced AI system trained on trusted
              medical sources.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6">
              <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">
                24/7 AI Support
              </h3>
              <p className="text-gray-600">
                Get immediate responses to your health questions anytime
              </p>
            </div>
            <div className="text-center p-6">
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">
                Private & Secure
              </h3>
              <p className="text-gray-600">
                Your health data is protected with enterprise-grade security
              </p>
            </div>
            <div className="text-center p-6">
              <Globe className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Multilingual</h3>
              <p className="text-gray-600">
                Available in multiple languages for global accessibility
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mb-8">
            <select className="px-4 py-2 border rounded-lg text-gray-700 bg-white">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>Chinese</option>
              <option>Arabic</option>
            </select>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setCurrentScreen("signup")}
              className="px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              Get Started
            </button>
            <button
              onClick={() => setCurrentScreen("login")}
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 text-lg rounded-lg hover:bg-blue-50 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
