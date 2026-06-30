import { useEffect, useRef, useState } from "react";
import api from "../utils/api";

const DEFAULT_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes fallback

export const useIdleLogout = (onLogout?: () => void) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const showWarningRef = useRef(false);

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
      
      if (onLogout) {
        onLogout();
      } else {
        alert("You have been logged out due to inactivity.");
        window.location.href = "/login";
      }
    }
  };

  const clearAllTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const resetTimer = () => {
    clearAllTimers();
    setShowWarning(false);
    setTimeLeft(0);
    
    const storedTimeout = localStorage.getItem("idleTimeoutMs");
    const timeoutMs = storedTimeout ? parseInt(storedTimeout, 10) : DEFAULT_IDLE_TIMEOUT_MS;
    
    // Calculate warning delay: 5 minutes (300,000 ms) before logout
    let warningMs = timeoutMs - 5 * 60 * 1000;
    if (warningMs <= 0 || timeoutMs <= 5 * 60 * 1000) {
      warningMs = timeoutMs * 0.8; // Fallback: 80% of idle time if idle time is <= 5 mins
    }
    
    // Warning Timer
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      const remainingSec = Math.max(0, Math.floor((timeoutMs - warningMs) / 1000));
      setTimeLeft(remainingSec);
      
      let sec = remainingSec;
      countdownIntervalRef.current = setInterval(() => {
        sec -= 1;
        if (sec <= 0) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
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

    resetTimer();

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    
    const handleEvent = () => {
      // If warning modal is active, don't reset timer on random mouse movements/scrolls.
      // The user must explicitly interact with the modal ("Stay Logged In") to reset.
      if (!showWarningRef.current) {
        resetTimer();
      }
    };

    events.forEach(event => {
      window.addEventListener(event, handleEvent);
    });

    return () => {
      clearAllTimers();
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
