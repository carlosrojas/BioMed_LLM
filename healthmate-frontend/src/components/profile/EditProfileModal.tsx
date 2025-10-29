import React, { useState, useEffect } from "react";
import { X, Save, User, Plus, AlertTriangle, Pill } from "lucide-react";
import { UserProfile } from "../../types";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSave: (updatedProfile: Record<string, any>) => void;
}

const COMMON_ALLERGIES = [
  "Peanuts",
  "Tree nuts",
  "Milk",
  "Eggs",
  "Fish",
  "Shellfish",
  "Soy",
  "Wheat",
  "Sesame",
  "Pollen",
  "Dust mites",
  "Pet dander",
  "Mold",
  "Latex",
  "Penicillin",
  "Sulfa drugs",
  "Aspirin",
  "Ibuprofen",
  "Codeine",
  "Morphine",
  "Bee stings",
  "Wasp stings",
  "Food dyes",
  "Preservatives",
  "Nickel",
  "Fragrances",
  "Cleaning products",
  "Cosmetics",
  "Jewelry metals",
  "Rubber",
];

const COMMON_MEDICATIONS = [
  "Acetaminophen (Tylenol)",
  "Ibuprofen (Advil, Motrin)",
  "Aspirin",
  "Naproxen (Aleve)",
  "Lisinopril",
  "Metformin",
  "Amlodipine",
  "Omeprazole",
  "Losartan",
  "Albuterol",
  "Metoprolol",
  "Simvastatin",
  "Hydrochlorothiazide",
  "Sertraline",
  "Montelukast",
  "Tramadol",
  "Gabapentin",
  "Furosemide",
  "Prednisone",
  "Warfarin",
  "Insulin",
  "Levothyroxine",
  "Atorvastatin",
  "Clopidogrel",
  "Carvedilol",
  "Pantoprazole",
  "Trazodone",
  "Fluoxetine",
  "Citalopram",
  "Lorazepam",
  "Diazepam",
  "Codeine",
  "Morphine",
  "Oxycodone",
  "Hydrocodone",
  "Fentanyl",
  "Methadone",
  "Buprenorphine",
  "Naloxone",
  "Digoxin",
  "Flecainide",
  "Amiodarone",
  "Diltiazem",
  "Verapamil",
  "Nitroglycerin",
  "Isosorbide",
  "Hydralazine",
  "Minoxidil",
  "Clonidine",
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    fullName: userProfile.name || "",
    age: userProfile.age || "",
    gender: userProfile.gender || "",
  });

  const [allergies, setAllergies] = useState<string[]>(
    userProfile.allergies || []
  );
  const [medications, setMedications] = useState<string[]>(
    userProfile.medications || []
  );
  const [newAllergy, setNewAllergy] = useState("");
  const [newMedication, setNewMedication] = useState("");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: userProfile.name || "",
        age: userProfile.age || "",
        gender: userProfile.gender || "",
      });
      setAllergies(userProfile.allergies || []);
      setMedications(userProfile.medications || []);
      setNewAllergy("");
      setNewMedication("");
      setSelectedAllergies([]);
      setSelectedMedications([]);
      setErrors({});
    }
  }, [isOpen, userProfile]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Name is required";
    }

    if (!formData.age.trim()) {
      newErrors.age = "Age is required";
    } else if (
      isNaN(Number(formData.age)) ||
      Number(formData.age) < 1 ||
      Number(formData.age) > 120
    ) {
      newErrors.age = "Please enter a valid age (1-120)";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare update data
      const updateData: Record<string, any> = {
        fullName: formData.fullName.trim(),
        age: formData.age.trim(),
        gender: formData.gender,
        allergies: allergies,
        medications: medications,
        conditions: userProfile.conditions || [],
      };

      await onSave(updateData);
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({ general: "Failed to update profile. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Allergy management functions
  const addAllergy = (allergy: string) => {
    if (allergy.trim() && !allergies.includes(allergy.trim())) {
      setAllergies((prev) => [...prev, allergy.trim()]);
    }
  };

  const removeAllergy = (allergyToRemove: string) => {
    setAllergies((prev) =>
      prev.filter((allergy) => allergy !== allergyToRemove)
    );
  };

  const handleAddCustomAllergy = () => {
    if (newAllergy.trim()) {
      addAllergy(newAllergy);
      setNewAllergy("");
    }
  };

  const handleSelectAllergy = (allergy: string) => {
    setSelectedAllergies((prev) => {
      if (prev.includes(allergy)) {
        return prev.filter((a) => a !== allergy);
      } else {
        return [...prev, allergy];
      }
    });
  };

  const addSelectedAllergies = () => {
    selectedAllergies.forEach((allergy) => addAllergy(allergy));
    setSelectedAllergies([]);
  };

  // Medication management functions
  const addMedication = (medication: string) => {
    if (medication.trim() && !medications.includes(medication.trim())) {
      setMedications((prev) => [...prev, medication.trim()]);
    }
  };

  const removeMedication = (medicationToRemove: string) => {
    setMedications((prev) =>
      prev.filter((medication) => medication !== medicationToRemove)
    );
  };

  const handleAddCustomMedication = () => {
    if (newMedication.trim()) {
      addMedication(newMedication);
      setNewMedication("");
    }
  };

  const handleSelectMedication = (medication: string) => {
    setSelectedMedications((prev) => {
      if (prev.includes(medication)) {
        return prev.filter((m) => m !== medication);
      } else {
        return [...prev, medication];
      }
    });
  };

  const addSelectedMedications = () => {
    selectedMedications.forEach((medication) => addMedication(medication));
    setSelectedMedications([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Profile
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.fullName ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter your full name"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age *
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => handleInputChange("age", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.age ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter your age"
              min="1"
              max="120"
            />
            {errors.age && (
              <p className="mt-1 text-sm text-red-600">{errors.age}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender *
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.gender ? "border-red-300" : "border-gray-300"
              }`}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
            )}
          </div>

          {/* Allergies Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Allergies
            </h3>

            {/* Current Allergies */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Allergies
              </label>
              {allergies.length === 0 ? (
                <p className="text-gray-500 text-sm">No allergies recorded</p>
              ) : (
                <div className="space-y-2">
                  {allergies.map((allergy, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-orange-50 rounded-lg"
                    >
                      <span className="text-gray-900">{allergy}</span>
                      <button
                        type="button"
                        onClick={() => removeAllergy(allergy)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Custom Allergy */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Custom Allergy
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter allergy name"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAllergy}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>

            {/* Common Allergies Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select from Common Allergies
              </label>
              <div className="max-h-32 overflow-y-auto space-y-1 mb-3">
                {COMMON_ALLERGIES.filter(
                  (allergy) => !allergies.includes(allergy)
                ).map((allergy) => (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => handleSelectAllergy(allergy)}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-colors text-sm ${
                      selectedAllergies.includes(allergy)
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{allergy}</span>
                      {selectedAllergies.includes(allergy) && (
                        <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {selectedAllergies.length > 0 && (
                <button
                  type="button"
                  onClick={addSelectedAllergies}
                  className="w-full px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                >
                  Add {selectedAllergies.length} Selected Allergies
                </button>
              )}
            </div>
          </div>

          {/* Medications Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-green-500" />
              Medications
            </h3>

            {/* Current Medications */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Medications
              </label>
              {medications.length === 0 ? (
                <p className="text-gray-500 text-sm">No medications recorded</p>
              ) : (
                <div className="space-y-2">
                  {medications.map((medication, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-green-50 rounded-lg"
                    >
                      <span className="text-gray-900">{medication}</span>
                      <button
                        type="button"
                        onClick={() => removeMedication(medication)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Custom Medication */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Custom Medication
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter medication name"
                />
                <button
                  type="button"
                  onClick={handleAddCustomMedication}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>

            {/* Common Medications Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select from Common Medications
              </label>
              <div className="max-h-32 overflow-y-auto space-y-1 mb-3">
                {COMMON_MEDICATIONS.filter(
                  (medication) => !medications.includes(medication)
                ).map((medication) => (
                  <button
                    key={medication}
                    type="button"
                    onClick={() => handleSelectMedication(medication)}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-colors text-sm ${
                      selectedMedications.includes(medication)
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{medication}</span>
                      {selectedMedications.includes(medication) && (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {selectedMedications.length > 0 && (
                <button
                  type="button"
                  onClick={addSelectedMedications}
                  className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  Add {selectedMedications.length} Selected Medications
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
