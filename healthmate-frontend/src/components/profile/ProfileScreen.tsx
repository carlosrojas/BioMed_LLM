import React, { useState } from "react";
import { User, Settings, AlertTriangle, Plus, X } from "lucide-react";
import { UserProfile, ScreenType } from "../../types";
import { EditProfileModal } from "./EditProfileModal";

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentScreen("login");
  };

  const handleUpdateProfile = async (updatedProfile: Record<string, any>) => {
    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      // Get the current token
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Make API call to update profile with only the changed fields
      const response = await fetch("http://127.0.0.1:8000/user/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProfile),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update profile");
      }

      const serverResponse = await response.json();

      // Update local state with the server response (partial update)
      setUserProfile((prev) => ({
        ...prev,
        ...serverResponse,
      }));

      setUpdateMessage({
        type: "success",
        text: "Profile updated successfully!",
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdateMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to update profile",
      });

      // Clear error message after 5 seconds
      setTimeout(() => {
        setUpdateMessage(null);
      }, 5000);
    } finally {
      setIsUpdating(false);
    }
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
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Update Message */}
        {updateMessage && (
          <div
            className={`p-4 rounded-lg ${
              updateMessage.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{updateMessage.text}</p>
              <button
                onClick={() => setUpdateMessage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Health Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Allergies
              </h3>
            </div>
            {userProfile.allergies.length === 0 ? (
              <p className="text-gray-500">No allergies recorded</p>
            ) : (
              <div className="space-y-2">
                {userProfile.allergies.map((allergy, index) => (
                  <div key={index} className="p-2 bg-orange-50 rounded-lg">
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
            </div>
            {userProfile.medications.length === 0 ? (
              <p className="text-gray-500">No medications recorded</p>
            ) : (
              <div className="space-y-2">
                {userProfile.medications.map((medication, index) => (
                  <div key={index} className="p-2 bg-green-50 rounded-lg">
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

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userProfile={userProfile}
        onSave={handleUpdateProfile}
      />
    </div>
  );
};
