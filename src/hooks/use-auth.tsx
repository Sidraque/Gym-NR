"use client";

import { auth } from '@/lib/firebase';
import {
  Auth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return; // Evita erro no Next.js (SSR)

    const unsubscribe = onAuthStateChanged(auth as Auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth não está disponível.");
    try {
      await signInWithEmailAndPassword(auth as Auth, email, password);
    } catch (error) {
      console.error("Erro de login:", error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth não está disponível.");
    try {
      await createUserWithEmailAndPassword(auth as Auth, email, password);
    } catch (error) {
      console.error("Erro de registro:", error);
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) throw new Error("Firebase Auth não está disponível.");
    try {
      await signOut(auth as Auth);
    } catch (error) {
      console.error("Erro ao sair:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
