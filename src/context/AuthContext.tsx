import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";
import { encrypt, decrypt } from "../utils/crypto";
import { useIdleLogout } from "../hooks/useIdleLogout";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const handleLogoutState = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("idleTimeoutMs");
  };

  // Wire up idle logout
  const { showWarning, timeLeft, resetTimer, logout: idleLogout } = useIdleLogout(handleLogoutState);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const encryptedPayload = encrypt({ email, password });
      const { data } = await api.post("/auth/login", { data: encryptedPayload });

      const decrypted = decrypt(data.data);
      console.log("decrypted ", decrypted);

      const { token: userToken, user: userData, idleTimeoutMs } = decrypted;

      if (userData.role !== "admin") {
        // Redirection to public domain handled by page or guard, throw specific error
        throw new Error("UNAUTHORIZED_ROLE");
      }

      setToken(userToken);
      setUser(userData);
      localStorage.setItem("token", userToken);
      localStorage.setItem("user", JSON.stringify(userData));
      if (idleTimeoutMs) {
        localStorage.setItem("idleTimeoutMs", String(idleTimeoutMs));
      }

      return userData;
    } catch (error: any) {
      console.error("[AuthContext:login] Error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("[AuthContext:logout] error:", e);
    } finally {
      handleLogoutState();
      window.location.href = "/login";
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && user?.role === "admin",
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showWarning && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(8, 11, 19, 0.8)",
            backdropFilter: "blur(12px)",
            zIndex: 99999,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            overflowY: "auto",
            padding: "40px 16px",
            color: "var(--text-primary)",
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          <div
            className="panel-glass animate-fade-in modal-solid-bg"
            style={{
              width: "100%",
              maxWidth: "420px",
              padding: "2.5rem 2rem",
              margin: "auto 0",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.65)"
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(245, 158, 11, 0.1)",
                color: "var(--warning)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                fontSize: "1.5rem",
                border: "1px solid rgba(245, 158, 11, 0.2)"
              }}
            >
              ⚠️
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800 }}>Session Inactivity</h3>
              <p style={{ margin: "10px 0 0 0", fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                You have been idle for a while. You will be automatically logged out in:
              </p>
              <p
                style={{
                  margin: "12px 0 0 0",
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  color: "var(--warning)",
                  fontFamily: "monospace"
                }}
              >
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "0.5rem" }}>
              <button
                onClick={idleLogout}
                className="btn-secondary"
                style={{ flex: 1, padding: "0.6rem 1rem", fontSize: "0.85rem", borderRadius: "10px" }}
              >
                Log Out
              </button>
              <button
                onClick={resetTimer}
                className="btn-primary"
                style={{ flex: 1, padding: "0.6rem 1rem", fontSize: "0.85rem", borderRadius: "10px" }}
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
