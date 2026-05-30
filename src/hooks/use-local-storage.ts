"use client";

import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T);
      }
    } catch {
      setStoredValue(initialValue);
    } finally {
      setHydrated(true);
    }
  }, [key, initialValue]);

  const setValue = useCallback(
    (value: T | ((current: T) => T)) => {
      setStoredValue((current) => {
        const next = value instanceof Function ? value(current) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Ignore quota or privacy mode errors.
        }
        return next;
      });
    },
    [key]
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage errors.
    }
    setStoredValue(initialValue);
  }, [initialValue, key]);

  return { value: storedValue, setValue, removeValue, hydrated };
}
