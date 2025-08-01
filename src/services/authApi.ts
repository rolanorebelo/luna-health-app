// src/services/authApi.ts

export const API_BASE_URL = "http://localhost:8000";

export async function registerUser(username: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Registration failed");
  }
  return response.json();
}


export async function loginUser(username: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password })
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Login failed");
  }
  return response.json();
}

export async function fetchProfile(token: string) {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Failed to fetch profile");
  }
  return response.json();
}
