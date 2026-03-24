import { createContext, useContext, useEffect, useState, useCallback } from "react";

const AuthContext = createContext(null);

const ACCESS_TOKEN_KEY = "studymate-access-token";
const USER_KEY = "studymate-user";

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => {
    try {
      return window.localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState(() => {
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Hibás email vagy jelszó");
    }

    setAccessToken(data.accessToken);
    setUser(data.user ?? null);

    try {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      window.localStorage.setItem(USER_KEY, JSON.stringify(data.user ?? null));
    } catch {
      void 0;
    }
  };

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setAccessToken(null);
      setUser(null);
      try {
        window.localStorage.removeItem(ACCESS_TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
      } catch {
        void 0;
      }
    }
  }, []);

  const refreshAccessToken = useCallback(async (currentToken = null) => {
    try {
      const headers = {};
      if (currentToken) {
        headers.Authorization = `Bearer ${currentToken}`;
      }
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers,
      });

      if (!res.ok) throw new Error("Refresh failed");

      const data = await res.json();
      setAccessToken(data.accessToken);
      setUser(data.user ?? null);

      try {
        window.localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
        window.localStorage.setItem(USER_KEY, JSON.stringify(data.user ?? null));
      } catch {
        void 0;
      }

      return data.accessToken;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = window.localStorage.getItem(ACCESS_TOKEN_KEY);
        if (stored) {
          setLoading(false);
          return;
        }
      } catch {
        void 0;
      }

      await refreshAccessToken();
      setLoading(false);
    };
    initAuth();
  }, [refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        isAuthenticated: !!accessToken,
        loading,
        login,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
