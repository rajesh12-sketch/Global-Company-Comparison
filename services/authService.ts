
import { User } from "../types";

const SESSION_KEY = 'global_comp_session';

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Added missing signUp method
  async signUp(name: string, email: string, password: string): Promise<User> {
    await delay(800);
    const user: User = {
      id: `user-${Date.now()}`,
      name,
      email,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  // Added missing signIn method
  async signIn(email: string, password: string): Promise<User> {
    await delay(800);
    // In a real application, credentials would be verified on a secure server
    const user: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
      email,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  async updateProfile(updatedUser: User): Promise<User> {
    await delay(600); // Simulate network latency
    // Update current session
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },

  getCurrentUser(): User | null {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  }
};
