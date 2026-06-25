'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'customer';

// Maps Prisma DB enum → frontend snake_case role string
const ROLE_MAP: Record<string, UserRole> = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  CUSTOMER: 'customer',
};

function toFrontendRole(role: string | undefined): UserRole {
  if (!role) return 'customer';
  return ROLE_MAP[role] ?? 'customer';
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  canAccessAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  // Auth.js v5 enriched user (role comes from JWT callback)
  type ExtendedUser = {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };

  const sessionUser: ExtendedUser | undefined = session?.user as ExtendedUser | undefined;

  const user: AuthUser | null =
    sessionUser?.email
      ? {
          id: sessionUser.id ?? '',
          name: sessionUser.name ?? 'User',
          email: sessionUser.email,
          avatar: sessionUser.image ?? undefined,
          role: toFrontendRole(sessionUser.role),
        }
      : null;

  const canAccessAdmin = user
    ? ['super_admin', 'admin', 'editor'].includes(user.role)
    : false;

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: 'Invalid email or password.' };
    }
    if (!result?.ok) {
      return { success: false, error: 'Something went wrong. Please try again.' };
    }
    return { success: true };
  };

  const signUp = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error ?? 'Registration failed.' };
    }

    // Auto sign-in after successful registration
    const signInResult = await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (signInResult?.error) {
      return { success: false, error: 'Account created. Please sign in.' };
    }

    return { success: true };
  };

  const signOutHandler = () => {
    nextAuthSignOut({ callbackUrl: '/' });
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, signUp, signOut: signOutHandler, canAccessAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
