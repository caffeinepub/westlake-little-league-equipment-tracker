import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../backend";

const STORAGE_KEY = "wll_user";

interface AuthContextValue {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // bigint is serialized as string
      return { ...parsed, id: BigInt(parsed.id) };
    } catch {
      return null;
    }
  });

  function login(user: User) {
    const serializable = { ...user, id: user.id.toString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    setCurrentUser(user);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
