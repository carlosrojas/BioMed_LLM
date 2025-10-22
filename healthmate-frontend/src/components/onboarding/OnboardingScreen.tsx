import React, { useState } from "react";
import { Heart, CheckCircle } from "lucide-react";
import { UserProfile, ScreenType } from "../../types";

interface OnboardingScreenProps {
  setCurrentScreen: (screen: ScreenType) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
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
