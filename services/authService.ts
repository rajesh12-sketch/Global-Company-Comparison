import { User } from "../types";

const USERS_KEY = 'global_comp_users';
const SESSION_KEY = 'global_comp_session';

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async signIn(email: string, password: string): Promise<User> {
    await delay(800); // Simulate network request

    const usersStr = localStorage.getItem(USERS_KEY);
    const users = usersStr ? JSON.parse(usersStr) : [];
    
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const sessionUser = { id: user.id, name: user.name, email: user.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  async signUp(name: string, email: string, password: string): Promise<User> {
    await delay(1000); // Simulate network request

    const usersStr = localStorage.getItem(USERS_KEY);
    const users = usersStr ? JSON.parse(usersStr) : [];

    if (users.find((u: any) => u.email === email)) {
      throw new Error("User already exists with this email");
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password // In a real app, never store plain text passwords!
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const sessionUser = { id: newUser.id, name: newUser.name, email: newUser.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  signOut() {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser(): User | null {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  }
};