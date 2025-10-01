// Core Types
export interface Message {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
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
  language: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  firstName: string;
  email: string;
  password: string;
}

export type ScreenType =
  | "splash"
  | "login"
  | "signup"
  | "onboarding"
  | "dashboard"
  | "chat"
  | "profile";
