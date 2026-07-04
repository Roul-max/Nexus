'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './client';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  organizations: Organization[];
  currentOrg: Organization | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null,
  organizations: [],
  currentOrg: null,
  loading: true 
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          let res = await fetch('/api/v1/users/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (res.status === 404) {
            const registration = await fetch('/api/v1/auth/register', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name: firebaseUser.displayName ?? undefined }),
            });
            if (registration.ok) {
              res = await fetch('/api/v1/users/me', {
                headers: { Authorization: `Bearer ${token}` },
              });
            }
          }
          
          if (res.ok) {
            const json = await res.json();
            if (json.data) {
              setProfile({
                id: json.data.id,
                email: json.data.email,
                name: json.data.name,
                avatarUrl: json.data.avatarUrl
              });
              setOrganizations(json.data.organizations || []);
              if (json.data.organizations && json.data.organizations.length > 0) {
                setCurrentOrg(json.data.organizations[0]);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setProfile(null);
        setOrganizations([]);
        setCurrentOrg(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, organizations, currentOrg, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
