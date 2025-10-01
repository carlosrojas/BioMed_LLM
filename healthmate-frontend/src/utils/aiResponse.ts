import { Message } from "../types";

export const generateAIResponse = (userMessage: string): Message => {
  const lowercaseMessage = userMessage.toLowerCase();
  let response = "";
  let confidence = 0.8;

  if (lowercaseMessage.includes("headache")) {
    response =
      "I understand you're experiencing a headache. This could be due to various factors like stress, dehydration, or tension. Here are some general suggestions:\n\n• Stay hydrated\n• Rest in a quiet, dark room\n• Apply a cold or warm compress\n• Consider over-the-counter pain relievers if appropriate\n\nIf headaches persist or worsen, please consult a healthcare provider.";
  } else if (lowercaseMessage.includes("fever")) {
    response =
      "A fever can indicate your body is fighting an infection. General care includes:\n\n• Rest and stay hydrated\n• Monitor your temperature\n• Consider fever-reducing medications if appropriate\n• Watch for other symptoms\n\nSeek medical care if fever is high (over 103°F) or persists.";
  } else {
    response =
      "Thank you for sharing your symptoms with me. Based on what you've described, I'd recommend monitoring your symptoms and considering consulting with a healthcare provider for proper evaluation. Is there anything specific you'd like to know more about?";
  }

  return {
    id: Date.now().toString(),
    type: "ai",
    content: response,
    timestamp: new Date(),
    confidence,
    sources: ["Medical Guidelines", "CDC Health Information"],
  };
};
