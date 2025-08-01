// src/services/onboardingApi.ts

import { API_BASE_URL } from "./authApi";

export interface OnboardingApiData {
  first_name: string;
  last_name: string;
  age: number;
  reproductive_stage: string;
  health_goals: string[];
  onboarding_completed: boolean;
}

export async function submitOnboarding(token: string, onboardingData: OnboardingApiData) {
  const response = await fetch(`${API_BASE_URL}/onboarding`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(onboardingData)
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Onboarding failed");
  }
  return response.json();
}
