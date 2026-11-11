import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { UserProfile, UserPlan } from "../types";
import { sound } from "../lib/soundEffects";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  modalMode: "signin" | "signup" | "trial";
  openAuthModal: (mode?: "signin" | "signup" | "trial") => void;
  closeAuthModal: () => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    name?: string,
    startTrial?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  startInstantTrial: (email?: string, name?: string) => Promise<UserProfile>;
  activateProTrial: () => Promise<void>;
  signOut: () => Promise<void>;
  daysRemaining: number;
  isTrialActive: boolean;
  isPro: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "voidwallz_auth_user_v1";
const TRIAL_DURATION_DAYS = 14;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"signin" | "signup" | "trial">("trial");

  // Calculate days remaining dynamically
  const daysRemaining = useMemo(() => {
    if (!user || user.plan !== "pro_trial" || !user.trialExpiresAt) {
      return user?.plan === "pro" ? 999 : 0;
    }
    const diffMs = new Date(user.trialExpiresAt).getTime() - Date.now();
    if (diffMs <= 0) return 0;
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }, [user]);

  const isTrialActive = useMemo(() => {
    return user?.plan === "pro_trial" && daysRemaining > 0;
  }, [user, daysRemaining]);

  const isPro = useMemo(() => {
    return user?.plan === "pro" || isTrialActive;
  }, [user, isTrialActive]);

  // Save / Sync user state to localStorage
  const saveLocalUser = useCallback((profile: UserProfile | null) => {
    setUser(profile);
    if (typeof window !== "undefined") {
      if (profile) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
      window.dispatchEvent(new Event("voidwallz-auth-changed"));
    }
  }, []);

  // Initialize auth: Supabase or Local Storage
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            const meta = session.user.user_metadata || {};
            const profile: UserProfile = {
              id: session.user.id,
              email: session.user.email || "user@voidwallz.com",
              name: meta.name || session.user.email?.split("@")[0] || "Void Explorer",
              avatarUrl: meta.avatarUrl,
              plan: (meta.plan as UserPlan) || "pro_trial",
              trialStartedAt: meta.trialStartedAt || new Date().toISOString(),
              trialExpiresAt:
                meta.trialExpiresAt ||
                new Date(Date.now() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
              createdAt: session.user.created_at || new Date().toISOString(),
              isGuest: false,
            };
            saveLocalUser(profile);
            setIsLoading(false);
            return;
          }
        }

        // Fallback: Check local storage
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (saved && mounted) {
            try {
              const parsed: UserProfile = JSON.parse(saved);
              setUser(parsed);
            } catch (e) {
              console.error("Failed to parse saved user", e);
            }
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth events if active
    let authListener: { subscription?: { unsubscribe: () => void } } | null = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email || "user@voidwallz.com",
            name: meta.name || session.user.email?.split("@")[0] || "Void Explorer",
            avatarUrl: meta.avatarUrl,
            plan: (meta.plan as UserPlan) || "pro_trial",
            trialStartedAt: meta.trialStartedAt || new Date().toISOString(),
            trialExpiresAt:
              meta.trialExpiresAt ||
              new Date(Date.now() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: session.user.created_at || new Date().toISOString(),
            isGuest: false,
          };
          saveLocalUser(profile);
        } else if (_event === "SIGNED_OUT") {
          saveLocalUser(null);
        }
      });
      authListener = data;
    }

    // Global listener for opening auth modal from any component
    const handleGlobalOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ mode?: "signin" | "signup" | "trial" }>;
      const mode = customEvent.detail?.mode || "trial";
      setModalMode(mode);
      setIsAuthModalOpen(true);
    };

    window.addEventListener("open-auth-modal", handleGlobalOpen);

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
      window.removeEventListener("open-auth-modal", handleGlobalOpen);
    };
  }, [saveLocalUser]);

  const openAuthModal = useCallback((mode: "signin" | "signup" | "trial" = "trial") => {
    sound.playOpenModal();
    setModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    sound.playClose();
    setIsAuthModalOpen(false);
  }, []);

  // Sign In implementation
  const signIn = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        if (supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            return { success: false, error: error.message };
          }

          if (data.user) {
            const meta = data.user.user_metadata || {};
            const profile: UserProfile = {
              id: data.user.id,
              email: data.user.email || email,
              name: meta.name || email.split("@")[0],
              plan: (meta.plan as UserPlan) || "pro_trial",
              trialStartedAt: meta.trialStartedAt,
              trialExpiresAt: meta.trialExpiresAt,
              createdAt: data.user.created_at,
              isGuest: false,
            };
            saveLocalUser(profile);
            sound.playSuccess();
            closeAuthModal();
            return { success: true };
          }
        }

        // Mock Fallback Sign In for development / testing without live Supabase
        const existingRaw = localStorage.getItem("voidwallz_demo_accounts");
        const accounts: Record<string, { password: string; profile: UserProfile }> = existingRaw
          ? JSON.parse(existingRaw)
          : {};

        if (accounts[email.toLowerCase()]) {
          if (accounts[email.toLowerCase()].password === password) {
            saveLocalUser(accounts[email.toLowerCase()].profile);
            sound.playSuccess();
            closeAuthModal();
            return { success: true };
          } else {
            return { success: false, error: "Incorrect security passkey / password." };
          }
        }

        // If no prior account found, authenticate as registered trial member
        const now = new Date();
        const trialExpires = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);
        const newProfile: UserProfile = {
          id: "usr_" + Math.random().toString(36).substring(2, 10),
          email,
          name: email.split("@")[0],
          plan: "pro_trial",
          trialStartedAt: now.toISOString(),
          trialExpiresAt: trialExpires.toISOString(),
          createdAt: now.toISOString(),
          isGuest: false,
        };

        accounts[email.toLowerCase()] = { password, profile: newProfile };
        localStorage.setItem("voidwallz_demo_accounts", JSON.stringify(accounts));
        saveLocalUser(newProfile);
        sound.playSuccess();
        closeAuthModal();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Failed to authenticate" };
      }
    },
    [saveLocalUser, closeAuthModal]
  );

  // Sign Up implementation
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      name?: string,
      startTrial: boolean = true
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const now = new Date();
        const trialExpires = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

        if (supabase) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: name || email.split("@")[0],
                plan: startTrial ? "pro_trial" : "free",
                trialStartedAt: startTrial ? now.toISOString() : null,
                trialExpiresAt: startTrial ? trialExpires.toISOString() : null,
              },
            },
          });

          if (error) {
            return { success: false, error: error.message };
          }

          if (data.user) {
            const profile: UserProfile = {
              id: data.user.id,
              email: data.user.email || email,
              name: name || email.split("@")[0],
              plan: startTrial ? "pro_trial" : "free",
              trialStartedAt: startTrial ? now.toISOString() : undefined,
              trialExpiresAt: startTrial ? trialExpires.toISOString() : undefined,
              createdAt: data.user.created_at || now.toISOString(),
              isGuest: false,
            };
            saveLocalUser(profile);
            sound.playSuccess();
            closeAuthModal();
            return { success: true };
          }
        }

        // Mock Fallback Sign Up
        const existingRaw = localStorage.getItem("voidwallz_demo_accounts");
        const accounts: Record<string, { password: string; profile: UserProfile }> = existingRaw
          ? JSON.parse(existingRaw)
          : {};

        const newProfile: UserProfile = {
          id: "usr_" + Math.random().toString(36).substring(2, 10),
          email,
          name: name || email.split("@")[0],
          plan: startTrial ? "pro_trial" : "free",
          trialStartedAt: startTrial ? now.toISOString() : undefined,
          trialExpiresAt: startTrial ? trialExpires.toISOString() : undefined,
          createdAt: now.toISOString(),
          isGuest: false,
        };

        accounts[email.toLowerCase()] = { password, profile: newProfile };
        localStorage.setItem("voidwallz_demo_accounts", JSON.stringify(accounts));
        saveLocalUser(newProfile);
        sound.playSuccess();
        closeAuthModal();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Failed to create account" };
      }
    },
    [saveLocalUser, closeAuthModal]
  );

  // 1-Click Instant Guest Pro Trial
  const startInstantTrial = useCallback(
    async (email?: string, name?: string): Promise<UserProfile> => {
      const randomSeed = Math.random().toString(36).substring(2, 7);
      const userEmail = email || `studio_guest_${randomSeed}@voidwallz.com`;
      const userName = name || `Guest Creator #${randomSeed.toUpperCase()}`;
      const now = new Date();
      const trialExpires = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

      const profile: UserProfile = {
        id: "trial_" + randomSeed,
        email: userEmail,
        name: userName,
        plan: "pro_trial",
        trialStartedAt: now.toISOString(),
        trialExpiresAt: trialExpires.toISOString(),
        createdAt: now.toISOString(),
        isGuest: !email,
      };

      saveLocalUser(profile);
      sound.playSuccess();
      closeAuthModal();
      return profile;
    },
    [saveLocalUser, closeAuthModal]
  );

  // Activate Pro Trial on current user
  const activateProTrial = useCallback(async () => {
    if (!user) return;
    const now = new Date();
    const trialExpires = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);
    const updated: UserProfile = {
      ...user,
      plan: "pro_trial",
      trialStartedAt: now.toISOString(),
      trialExpiresAt: trialExpires.toISOString(),
    };
    saveLocalUser(updated);
    sound.playSuccess();
  }, [user, saveLocalUser]);

  // Sign out
  const signOut = useCallback(async () => {
    sound.playSwitch();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (_) { }
    }
    saveLocalUser(null);
  }, [saveLocalUser]);

  const value = {
    user,
    isLoading,
    isAuthModalOpen,
    modalMode,
    openAuthModal,
    closeAuthModal,
    signIn,
    signUp,
    startInstantTrial,
    activateProTrial,
    signOut,
    daysRemaining,
    isTrialActive,
    isPro,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
