/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import { DEMO_USERS, type UserPersona } from './authTypes';

export type { UserPersona };
export { DEMO_USERS };

interface RegisteredUserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  department: string;
  createdAt: string;
}

interface AuthContextType {
  user: UserPersona | null;
  isDemoMode: boolean;
  loginAs: (user: UserPersona) => void;
  loginAsDemo: (personaId?: string) => UserPersona;
  loginWithCredentials: (email: string, pass: string) => { success: boolean; error?: string };
  registerUser: (name: string, email: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (id: string) => void;
  allDemoUsers: UserPersona[];
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserPersona | null>(() => {
    const saved = localStorage.getItem('invoiceguard_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return user ? Boolean(user.isDemoMode) : true;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('invoiceguard_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('invoiceguard_auth_user');
    }
  }, [user]);

  const loginAs = (persona: UserPersona) => {
    setUser(persona);
    setIsDemoMode(Boolean(persona.isDemoMode));
  };

  const loginAsDemo = (personaId?: string): UserPersona => {
    const target = personaId
      ? DEMO_USERS.find((u) => u.id === personaId) || DEMO_USERS[0]
      : DEMO_USERS[0];
    setUser(target);
    setIsDemoMode(true);
    return target;
  };

  const getRegisteredUsers = (): RegisteredUserRecord[] => {
    const stored = localStorage.getItem('invoiceguard_registered_users');
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  };

  const loginWithCredentials = (email: string, pass: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check demo users first
    const demoFound = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === cleanEmail || u.name.toLowerCase().includes(cleanEmail)
    );
    if (demoFound) {
      setUser(demoFound);
      setIsDemoMode(true);
      return { success: true };
    }

    // 2. Check registered local storage users
    const registered = getRegisteredUsers();
    const userFound = registered.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!userFound) {
      return { success: false, error: 'No account registered with this email address.' };
    }

    if (userFound.passwordHash !== pass) {
      return { success: false, error: 'Invalid password. Please check your credentials.' };
    }

    const persona: UserPersona = {
      id: userFound.id,
      name: userFound.name,
      email: userFound.email,
      role: userFound.role,
      department: userFound.department,
      avatarInitials: userFound.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      isDemoMode: false,
    };

    setUser(persona);
    setIsDemoMode(false);
    return { success: true };
  };

  const registerUser = (
    name: string,
    email: string,
    pass: string
  ): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName || !cleanEmail || !pass) {
      return { success: false, error: 'All fields are required.' };
    }

    const registered = getRegisteredUsers();
    if (
      registered.some((u) => u.email.toLowerCase() === cleanEmail) ||
      DEMO_USERS.some((u) => u.email.toLowerCase() === cleanEmail)
    ) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const newRecord: RegisteredUserRecord = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      passwordHash: pass,
      role: 'Finance Operations Lead',
      department: 'Corporate Finance',
      createdAt: new Date().toISOString(),
    };

    registered.push(newRecord);
    localStorage.setItem('invoiceguard_registered_users', JSON.stringify(registered));

    const persona: UserPersona = {
      id: newRecord.id,
      name: newRecord.name,
      email: newRecord.email,
      role: newRecord.role,
      department: newRecord.department,
      avatarInitials: cleanName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      isDemoMode: false,
    };

    setUser(persona);
    setIsDemoMode(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsDemoMode(false);
  };

  const switchUser = (id: string) => {
    const found = DEMO_USERS.find((u) => u.id === id);
    if (found) {
      setUser(found);
      setIsDemoMode(true);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isDemoMode,
        loginAs,
        loginAsDemo,
        loginWithCredentials,
        registerUser,
        logout,
        switchUser,
        allDemoUsers: DEMO_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { useAuth } from './useAuth';
