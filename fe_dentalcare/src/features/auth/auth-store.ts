import { create } from "zustand";
import { User, RoleType } from "@/types";
import usersSeed from "@/data/users.json";
import { hasPermission } from "@/config/permissions";
import { appConfig } from "@/config/app-config";

interface AuthState {
  currentUser: User | null;
  currentFacilityId: string;
  isAuthenticated: boolean;
  isHydrated: boolean;
  initFromStorage: () => void;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: RoleType) => void;
  setFacilityId: (facilityId: string) => void;
  can: (permission: string) => boolean;
}

const STORAGE_AUTH_KEY = "ehealth_auth_session";
const STORAGE_TOKEN_KEY = "dentalcare_token";

let isVerifyingAuth = false;
let hasVerifiedAuth = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  currentFacilityId: "FAC-001",
  isAuthenticated: false,
  isHydrated: false,

  initFromStorage: () => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_AUTH_KEY);
        const token = localStorage.getItem(STORAGE_TOKEN_KEY) || localStorage.getItem("auth_token");
        if (stored && token) {
          const user = JSON.parse(stored);
          document.cookie = `dentalcare_token=${token}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `auth_token=${token}; path=/; max-age=604800; SameSite=Lax`;
          set({ currentUser: user, isAuthenticated: true, isHydrated: true });
        } else {
          document.cookie = "dentalcare_token=; path=/; max-age=0";
          document.cookie = "auth_token=; path=/; max-age=0";
          set({ currentUser: null, isAuthenticated: false, isHydrated: true });
        }

        // Verify token with backend /auth/me once per session only if available
        if (token && !hasVerifiedAuth && !isVerifyingAuth) {
          isVerifyingAuth = true;
          fetch(`${appConfig.apiUrl}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((res) => (res.ok ? res.json() : null))
            .then((freshUser) => {
              hasVerifiedAuth = true;
              if (freshUser && freshUser.id) {
                localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(freshUser));
                set({ currentUser: freshUser, isAuthenticated: true });
              }
            })
            .catch(() => {})
            .finally(() => {
              isVerifyingAuth = false;
            });
        }
      } catch {
        set({ currentUser: null, isAuthenticated: false, isHydrated: true });
      }
      set({ isHydrated: true });
    }
  },

  login: async (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password || "password";

    try {
      const response = await fetch(`${appConfig.apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPass,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.user) {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_TOKEN_KEY, data.token);
          localStorage.setItem("auth_token", data.token);
          localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(data.user));
          document.cookie = `dentalcare_token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `auth_token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
        }
        set({ currentUser: data.user, isAuthenticated: true });
        return true;
      }

      if (!response.ok) {
        // Server explicitly returned an error (wrong password/unregistered email)
        return false;
      }
    } catch {
      // Backend not running/unreachable, fallback to local users for offline resilience
      const user = (usersSeed as User[]).find(
        (u) => u.email.toLowerCase() === cleanEmail
      );
      if (user) {
        const dummyToken = `jwt-offline-${user.id}-${Date.now()}`;
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_TOKEN_KEY, dummyToken);
          localStorage.setItem("auth_token", dummyToken);
          localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(user));
          document.cookie = `dentalcare_token=${dummyToken}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `auth_token=${dummyToken}; path=/; max-age=604800; SameSite=Lax`;
        }
        set({ currentUser: user, isAuthenticated: true });
        return true;
      }
    }
    return false;
  },

  logout: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(STORAGE_TOKEN_KEY) || localStorage.getItem("auth_token");
      if (token) {
        fetch(`${appConfig.apiUrl}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {});
      }
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem("auth_token");
      localStorage.removeItem(STORAGE_AUTH_KEY);
      document.cookie = "dentalcare_token=; path=/; max-age=0";
      document.cookie = "auth_token=; path=/; max-age=0";
    }
    set({ currentUser: null, isAuthenticated: false });
  },

  switchRole: (role: RoleType) => {
    const user = (usersSeed as User[]).find((u) => u.role === role) || {
      ...(get().currentUser || (usersSeed[0] as User)),
      role,
      roleName: role.replace("_", " ").toUpperCase(),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(user));
    }
    set({ currentUser: user, isAuthenticated: true });
  },

  setFacilityId: (facilityId: string) => {
    set({ currentFacilityId: facilityId });
  },

  can: (permission: string) => {
    const user = get().currentUser;
    return hasPermission(user?.role, permission);
  },
}));
