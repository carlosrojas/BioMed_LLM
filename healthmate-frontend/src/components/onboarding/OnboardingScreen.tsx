import React, { useState } from "react";
import { Heart, CheckCircle } from "lucide-react";
import { UserProfile, ScreenType } from "../../types";

interface OnboardingScreenProps {
  userProfile: UserProfile;
  setUserProfile: (
    profile: UserProfile | ((prev: UserProfile) => UserProfile)
  ) => void;
  setCurrentScreen: (screen: ScreenType) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  userProfile,
  setUserProfile,
  setCurrentScreen,
}) => {
  const [onboardingStep, setOnboardingStep] = useState(0);

  const onboardingSteps = [
    {
      title: "Welcome to HealthMate",
      content: (
        <div className="text-center">
          <div className="mb-8">
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-16 h-16 text-blue-600" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="text-center p-4">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium mb-2">AI-Powered Diagnosis</h4>
              <p className="text-gray-600">
                Advanced AI analyzes your symptoms using medical databases
              </p>
            </div>
            <div className="text-center p-4">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium mb-2">24/7 Availability</h4>
              <p className="text-gray-600">
                Get health guidance whenever you need it
              </p>
            </div>
            <div className="text-center p-4">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium mb-2">Multilingual Support</h4>
              <p className="text-gray-600">
                Communicate in your preferred language
              </p>
            </div>
            <div className="text-center p-4">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium mb-2">Privacy Protected</h4>
              <p className="text-gray-600">
                Your health information stays confidential
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Set Up Your Profile",
      content: (
        <div className="max-w-md mx-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name (Optional)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
                value={userProfile.name}
                onChange={(e) =>
                  setUserProfile((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Range
              </label>
              <select
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={userProfile.age}
                onChange={(e) =>
                  setUserProfile((prev) => ({ ...prev, age: e.target.value }))
                }
              >
                <option value="">Select age range</option>
                <option value="18-29">18-29</option>
                <option value="30-49">30-49</option>
                <option value="50-69">50-69</option>
                <option value="70+">70+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Language
              </label>
              <select
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={userProfile.language}
                onChange={(e) =>
                  setUserProfile((prev) => ({
                    ...prev,
                    language: e.target.value,
                  }))
                }
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="Chinese">Chinese</option>
              </select>
            </div>
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={() => setCurrentScreen("dashboard")}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Skip for now - I'll set this up later
            </button>
          </div>
        </div>
      ),
    },
  ];

  const currentStep = onboardingSteps[onboardingStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">
                Step {onboardingStep + 1} of {onboardingSteps.length}
              </span>
              <div className="flex space-x-2">
                {onboardingSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index <= onboardingStep ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 text-center">
              {currentStep.title}
            </h2>
          </div>

          <div className="mb-8">{currentStep.content}</div>

          <div className="flex justify-between">
            <button
              onClick={() =>
                onboardingStep > 0
                  ? setOnboardingStep(onboardingStep - 1)
                  : setCurrentScreen("splash")
              }
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {onboardingStep > 0 ? "Previous" : "Back"}
            </button>
            <button
              onClick={() => {
                if (onboardingStep < onboardingSteps.length - 1) {
                  setOnboardingStep(onboardingStep + 1);
                } else {
                  setCurrentScreen("dashboard");
                }
              }}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {onboardingStep < onboardingSteps.length - 1
                ? "Next"
                : "Start Using HealthMate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
