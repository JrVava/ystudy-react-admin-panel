import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import config from "../config";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate("/media");
    } catch (err: any) {
      if (err.message === "UNAUTHORIZED_ROLE") {
        setRedirecting(true);
        setError("Access Denied. You are not an administrator. Redirecting...");
        const publicDomain = config.publicDomain;
        setTimeout(() => {
          window.location.href = publicDomain;
        }, 2000);
      } else {
        setError(err.response?.data?.message || err.message || "Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      width: "100vw",
      position: "fixed",
      top: 0,
      left: 0,
      background: "radial-gradient(circle at 50% 50%, rgba(13, 17, 30, 1) 0%, rgba(7, 8, 14, 1) 100%)",
      padding: "1.5rem",
      boxSizing: "border-box"
    }}>
      <div className="panel-glass animate-fade-in" style={{
        width: "100%",
        maxWidth: "420px",
        padding: "2.5rem",
        textAlign: "center"
      }}>
        <div style={{
          display: "inline-flex",
          padding: redirecting ? "1rem" : "0",
          background: redirecting ? "rgba(244, 63, 94, 0.1)" : "transparent",
          borderRadius: redirecting ? "50%" : "0",
          marginBottom: "1.5rem",
          color: redirecting ? "#f43f5e" : "transparent"
        }}>
          {redirecting ? (
            <ShieldAlert size={36} />
          ) : (
            <img src="/ystudy-logo.png" alt="Y Study Logo" style={{ width: "80px", height: "80px", objectFit: "contain" }} />
          )}
        </div>

        <h2 style={{
          fontSize: "1.75rem",
          fontWeight: 800,
          marginBottom: "0.5rem",
          background: "linear-gradient(135deg, #ffffff 40%, #c7d2fe 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Y Study Admin CMS
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "0.95rem", marginBottom: "2rem" }}>
          Sign in to manage your site assets and content.
        </p>

        {error && (
          <div style={{
            background: "rgba(244, 63, 94, 0.1)",
            border: "1px solid rgba(244, 63, 94, 0.2)",
            color: "#f43f5e",
            padding: "0.75rem 1rem",
            borderRadius: "12px",
            fontSize: "0.9rem",
            marginBottom: "1.5rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textAlign: "left"
          }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="admin@ystudy.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              disabled={loading || redirecting}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "2.25rem" }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              disabled={loading || redirecting}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", height: "48px" }}
            disabled={loading || redirecting}
          >
            {loading ? "Authenticating..." : redirecting ? "Redirecting..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
