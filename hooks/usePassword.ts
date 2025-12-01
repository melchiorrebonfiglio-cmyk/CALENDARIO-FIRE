import { useState, useEffect, useCallback } from 'react';

const PASSWORD_KEY = 'work-calendar-password-hash';
const SESSION_KEY = 'work-calendar-session-auth';

// Helper to hash a string using SHA-256
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export const usePassword = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Check if a password hash exists
      const storedHash = localStorage.getItem(PASSWORD_KEY);
      setIsPasswordSet(!!storedHash);

      // Check for an active session
      const sessionAuth = sessionStorage.getItem(SESSION_KEY);
      if (sessionAuth === 'true' && !!storedHash) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to check auth status", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (password: string): Promise<boolean> => {
    try {
      const storedHash = localStorage.getItem(PASSWORD_KEY);
      if (!storedHash) return false;

      const inputHash = await hashString(password);
      if (inputHash === storedHash) {
        setIsAuthenticated(true);
        sessionStorage.setItem(SESSION_KEY, 'true');
        return true;
      }
      return false;
    } catch (error) {
        console.error("Login failed", error);
        return false;
    }
  }, []);

  const setPassword = useCallback(async (password: string): Promise<void> => {
    try {
      const newHash = await hashString(password);
      localStorage.setItem(PASSWORD_KEY, newHash);
      setIsPasswordSet(true);
      // Automatically log in after setting the password
      await login(password);
    } catch (error) {
        console.error("Failed to set password", error);
    }
  }, [login]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  return { isAuthenticated, isPasswordSet, isLoading, login, setPassword, logout };
};
