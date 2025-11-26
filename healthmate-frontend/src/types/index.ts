// Core Types
export interface Message {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[]; // Source IDs or names from retrieved documents
  interaction_id?: string;
  feedback?: number; // 1 for thumbs up, -1 for thumbs down
  feedback_comment?: string;
  status?: "ok" | "urgent" | "abstain"; // Response status from backend
}

export interface ChatHistory {
  id: string;
  date: Date;
  summary: string;
  messages: Message[];
}

export interface UserProfile {
  name: string;
  age?: string;
  gender?: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  fullName: string;
  email: string;
  password: string;
  age: string;
  gender: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
}

export interface SavedChat {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  messages: Message[];
  createdAt: string;
  savedAt?: string;
}

export type ScreenType =
  | "splash"
  | "login"
  | "signup"
  | "onboarding"
  | "dashboard"
  | "chat"
  | "profile"
  | "chat-history";
