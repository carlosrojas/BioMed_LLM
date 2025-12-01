import React, { useState, useEffect } from "react";
import { X, Mail, Send } from "lucide-react";

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (providerEmail: string, emailSubject: string) => Promise<void>;
  chatTitle: string;
  isLoading?: boolean;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onClose,
  onSend,
  chatTitle,
  isLoading = false,
}) => {
  const [providerEmail, setProviderEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState(chatTitle);
  const [error, setError] = useState<string | null>(null);

  // Update email subject when chatTitle changes (when modal opens with different chat)
  useEffect(() => {
    if (isOpen) {
      setEmailSubject(chatTitle);
    }
  }, [chatTitle, isOpen]);

  if (!isOpen) return null;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSend = async () => {
    setError(null);

    if (!providerEmail.trim()) {
      setError("Please enter a healthcare provider's email address");
      return;
    }

    if (!validateEmail(providerEmail.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      await onSend(providerEmail.trim(), emailSubject.trim() || chatTitle);
      setProviderEmail("");
      setEmailSubject(chatTitle);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to send email. Please try again.");
    }
  };

  const handleClose = () => {
    setProviderEmail("");
    setEmailSubject(chatTitle);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Send Chat to Provider
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label
              htmlFor="email-subject"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Subject
            </label>
            <input
              id="email-subject"
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Enter email subject..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be the subject line of the email sent to the provider
            </p>
          </div>

          <div className="mb-4">
            <label
              htmlFor="provider-email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Healthcare Provider's Email
            </label>
            <input
              id="provider-email"
              type="email"
              value={providerEmail}
              onChange={(e) => {
                setProviderEmail(e.target.value);
                setError(null);
              }}
              placeholder="provider@example.com"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleSend();
                }
              }}
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <p className="text-xs text-gray-500 mb-6">
            The formatted chat conversation will be sent to the healthcare
            provider's email address.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={
              isLoading || !providerEmail.trim() || !emailSubject.trim()
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
