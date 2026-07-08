import { useEffect, useRef, useState } from "react";
import api from "../utils/api";
import { toast } from "../context/ToastContext";

const DEFAULT_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes fallback

export const useIdleLogout = (onLogout?: () => void) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const showWarningRef = useRef(false);
  const lastResetRef = useRef(0);

  // Sync state to ref for access in static event handler
  useEffect(() => {
    showWarningRef.current = showWarning;
  }, [showWarning]);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Logout API call failed", e);
    } finally {
      // Clear timers & interval
      clearAllTimers();
      
      // Clear all auth fields
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("idleTimeoutMs");
      localStorage.removeItem("lastActivity");
      
      if (onLogout) {
        onLogout();
      } else {
        toast.warning("You have been logged out due to inactivity.");
        window.location.href = "/login";
      }
    }
  };

  const clearAllTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const checkSessionExpiration = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    const storedTimeout = localStorage.getItem("idleTimeoutMs");
    const timeoutMs = storedTimeout ? parseInt(storedTimeout, 10) : DEFAULT_IDLE_TIMEOUT_MS;

    const lastActivity = localStorage.getItem("lastActivity");
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed >= timeoutMs) {
        logout();
        return true;
      }
    } else {
      localStorage.setItem("lastActivity", String(Date.now()));
    }
    return false;
  };

  const resetTimer = () => {
    clearAllTimers();
    setShowWarning(false);
    setTimeLeft(0);
    
    // Save current activity timestamp
    localStorage.setItem("lastActivity", String(Date.now()));
    lastResetRef.current = Date.now();
    
    const storedTimeout = localStorage.getItem("idleTimeoutMs");
    const timeoutMs = storedTimeout ? parseInt(storedTimeout, 10) : DEFAULT_IDLE_TIMEOUT_MS;
    
    // Calculate warning delay: 5 minutes (300,000 ms) before logout
    let warningMs = timeoutMs - 5 * 60 * 1000;
    if (warningMs <= 0 || timeoutMs <= 5 * 60 * 1000) {
      warningMs = timeoutMs * 0.8; // Fallback: 80% of idle time if idle time is <= 5 mins
    }
    
    // Warning Timer
    warningTimerRef.current = setTimeout(() => {
      const elapsed = Date.now() - parseInt(localStorage.getItem("lastActivity") || "0", 10);
      const remainingSec = Math.max(0, Math.floor((timeoutMs - elapsed) / 1000));
      
      if (remainingSec <= 0) {
        logout();
        return;
      }

      setShowWarning(true);
      setTimeLeft(remainingSec);
      
      let sec = remainingSec;
      countdownIntervalRef.current = setInterval(() => {
        sec -= 1;
        if (sec <= 0) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          logout();
        }
        setTimeLeft(Math.max(0, sec));
      }, 1000);
    }, warningMs);

    // Final Logout Timer
    timerRef.current = setTimeout(logout, timeoutMs);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // Do not monitor if not logged in

    // Check if session has already expired since last check/activity
    if (checkSessionExpiration()) return;

    resetTimer();

    // Set up a periodic check (e.g., every 5 seconds) to catch session expiry
    // when computer was asleep or tab was in background
    const checkInterval = setInterval(() => {
      checkSessionExpiration();
    }, 5000);

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    
    const handleEvent = () => {
      if (checkSessionExpiration()) return;

      // If warning modal is active, don't reset timer on random mouse movements/scrolls.
      // The user must explicitly interact with the modal ("Stay Logged In") to reset.
      if (!showWarningRef.current) {
        const now = Date.now();
        if (now - lastResetRef.current > 15000) {
          resetTimer();
        }
      }
    };

    events.forEach(event => {
      window.addEventListener(event, handleEvent);
    });

    return () => {
      clearAllTimers();
      clearInterval(checkInterval);
      events.forEach(event => {
        window.removeEventListener(event, handleEvent);
      });
    };
  }, []);

  return {
    showWarning,
    timeLeft,
    resetTimer,
    logout
  };
};
