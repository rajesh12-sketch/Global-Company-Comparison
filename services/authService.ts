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

    // Return user with potential extra fields if they exist in storage
    const sessionUser: User = { 
        id: user.id, 
        name: user.name, 
        email: user.email,
        phone: user.phone,
        address: user.address,
        jobTitle: user.jobTitle
    };
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

    const sessionUser: User = { id: newUser.id, name: newUser.name, email: newUser.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  async updateProfile(updatedUser: User): Promise<User> {
    await delay(600); // Simulate network latency

    // Update in the "database" (users array)
    const usersStr = localStorage.getItem(USERS_KEY);
    let users = usersStr ? JSON.parse(usersStr) : [];
    
    // In a real app we'd find by ID, here we assume ID persistence or match by email if ID missing (legacy)
    const index = users.findIndex((u: any) => u.id === updatedUser.id || u.email === updatedUser.email);
    
    if (index !== -1) {
        // Preserve password which isn't in the User object
        const existingUser = users[index];
        users[index] = { ...existingUser, ...updatedUser };
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    // Update current session
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },

  signOut() {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser(): User | null {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  }
};