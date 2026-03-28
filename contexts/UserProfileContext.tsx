"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { UserProfile } from "@/types";

interface UserProfileContextValue {
  profile: UserProfile | null;
  loading: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const ref = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(ref, async (snap) => {
      if (snap.exists()) {
        setProfile({ uid: user.uid, ...snap.data() } as UserProfile);
      } else {
        // Create default profile for new users
        const defaultProfile: Omit<UserProfile, "uid"> = {
          name:            user.displayName ?? "",
          email:           user.email ?? "",
          phone:           "",
          photoURL:        user.photoURL ?? "",
          hardSkills:      [],
          softSkills:      [],
          languages:       [],
          experience:      [],
          education:       [],
          certifications:  [],
          cvCredits:       5,
          plan:            "free",
          createdAt:       serverTimestamp() as Timestamp,
        };
        await setDoc(ref, defaultProfile);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  async function updateProfile(data: Partial<UserProfile>) {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    await setDoc(ref, data, { merge: true });
  }

  return (
    <UserProfileContext.Provider value={{ profile, loading, updateProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error("useUserProfile must be used within UserProfileProvider");
  return ctx;
}
