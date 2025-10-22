import React from "react";
import {
  User,
  Settings,
  AlertTriangle,
  Plus,
  Globe,
  Shield,
  ChevronRight,
} from "lucide-react";
import { UserProfile, ScreenType } from "../../types";

interface ProfileScreenProps {
  userProfile: UserProfile;
  setUserProfile: (
    profile: UserProfile | ((prev: UserProfile) => UserProfile)
  ) => void;
  setCurrentScreen: (screen: ScreenType) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile,
  setUserProfile,
  setCurrentScreen,
}) => {
  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentScreen("login");
  };
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {userProfile.name || "Your Name"}
                </h2>
                <p className="text-gray-600">
                  {userProfile.age
                    ? `Age: ${userProfile.age}`
                    : "Age not specified"}
                </p>
              </div>
            </div>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Health Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Allergies
              </h3>
              <button className="text-blue-600 hover:text-blue-800 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {userProfile.allergies.length === 0 ? (
              <p className="text-gray-500">No allergies recorded</p>
            ) : (
              <div className="space-y-2">
                {userProfile.allergies.map((allergy, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-orange-50 rounded-lg"
                  >
                    <span className="text-gray-900">{allergy}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-500" />
                Current Medications
              </h3>
              <button className="text-blue-600 hover:text-blue-800 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {userProfile.medications.length === 0 ? (
              <p className="text-gray-500">No medications recorded</p>
            ) : (
              <div className="space-y-2">
                {userProfile.medications.map((medication, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-green-50 rounded-lg"
                  >
                    <span className="text-gray-900">{medication}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Logout button */}
        <button
          className="w-full bg-red-200 text-black font-bold px-4 py-2 rounded-lg hover:bg-red-300 transition-colors flex items-center justify-center"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};
