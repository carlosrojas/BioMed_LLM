import React, { useState } from "react";
import { Heart } from "lucide-react";
import { SignupForm, ScreenType } from "../../types";

interface SignupScreenProps {
  signupForm: SignupForm;
  setSignupForm: (form: SignupForm) => void;
  isLoading: boolean;
  handleSignup: (e: React.FormEvent) => void;
  setCurrentScreen: (screen: ScreenType) => void;
}

// Common medications list
const COMMON_MEDICATIONS = [
  "Aspirin",
  "Ibuprofen",
  "Acetaminophen (Tylenol)",
  "Lisinopril",
  "Metformin",
  "Atorvastatin (Lipitor)",
  "Levothyroxine",
  "Omeprazole",
  "Metoprolol",
  "Amlodipine",
  "Losartan",
  "Gabapentin",
  "Sertraline (Zoloft)",
  "Albuterol",
  "Prednisone",
];

// Common allergies list
const COMMON_ALLERGIES = [
  "Penicillin",
  "Peanuts",
  "Tree Nuts",
  "Shellfish",
  "Eggs",
  "Milk/Dairy",
  "Soy",
  "Wheat/Gluten",
  "Sulfa drugs",
  "Aspirin",
  "Latex",
  "Bee stings",
  "Pollen",
  "Dust mites",
  "Pet dander",
];

export const SignupScreen: React.FC<SignupScreenProps> = ({
  signupForm,
  setSignupForm,
  isLoading,
  handleSignup,
  setCurrentScreen,
}) => {
  const [showMedications, setShowMedications] = useState(false);
  const [showAllergies, setShowAllergies] = useState(false);
  const [passwordError, setPasswordError] = useState<string>("");

  const toggleMedication = (med: string) => {
    const current = signupForm.medications || [];
    if (current.includes(med)) {
      setSignupForm({
        ...signupForm,
        medications: current.filter((m) => m !== med),
      });
    } else {
      setSignupForm({ ...signupForm, medications: [...current, med] });
    }
  };

  const toggleAllergy = (allergy: string) => {
    const current = signupForm.allergies || [];
    if (current.includes(allergy)) {
      setSignupForm({
        ...signupForm,
        allergies: current.filter((a) => a !== allergy),
      });
    } else {
      setSignupForm({ ...signupForm, allergies: [...current, allergy] });
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupForm.password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }
    setPasswordError("");
    handleSignup(e);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl shadow-xl p-8 max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-8">
            <Heart className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign Up</h1>
            <p className="text-gray-600">Create your HealthMate account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                  value={signupForm.fullName}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, fullName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Age"
                  value={signupForm.age}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, age: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={signupForm.gender}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, gender: e.target.value })
                }
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                value={signupForm.email}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Create a password (min. 6 characters)"
                value={signupForm.password}
                onChange={(e) =>
                  setSignupForm({ ...signupForm, password: e.target.value })
                }
              />
              {passwordError && (
                <p className="text-sm text-red-500 mt-1">{passwordError}</p>
              )}
            </div>

            {/* Medications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Medications (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowMedications(!showMedications)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {signupForm.medications?.length > 0
                  ? `${signupForm.medications.length} medication(s) selected`
                  : "Select medications"}
              </button>
              {showMedications && (
                <div className="mt-2 p-4 border border-gray-200 rounded-lg max-h-48 overflow-y-auto bg-gray-50">
                  <div className="grid grid-cols-1 gap-2">
                    {COMMON_MEDICATIONS.map((med) => (
                      <label
                        key={med}
                        className="flex items-center space-x-2 hover:bg-white p-2 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={signupForm.medications?.includes(med)}
                          onChange={() => toggleMedication(med)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{med}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {signupForm.medications?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {signupForm.medications.map((med) => (
                    <span
                      key={med}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {med}
                      <button
                        type="button"
                        onClick={() => toggleMedication(med)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergies (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowAllergies(!showAllergies)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {signupForm.allergies?.length > 0
                  ? `${signupForm.allergies.length} allergy(ies) selected`
                  : "Select allergies"}
              </button>
              {showAllergies && (
                <div className="mt-2 p-4 border border-gray-200 rounded-lg max-h-48 overflow-y-auto bg-gray-50">
                  <div className="grid grid-cols-1 gap-2">
                    {COMMON_ALLERGIES.map((allergy) => (
                      <label
                        key={allergy}
                        className="flex items-center space-x-2 hover:bg-white p-2 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={signupForm.allergies?.includes(allergy)}
                          onChange={() => toggleAllergy(allergy)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{allergy}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {signupForm.allergies?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {signupForm.allergies.map((allergy) => (
                    <span
                      key={allergy}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                    >
                      {allergy}
                      <button
                        type="button"
                        onClick={() => toggleAllergy(allergy)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => setCurrentScreen("login")}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
