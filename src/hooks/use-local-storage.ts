"use client";

import { useState, useEffect } from "react";

function getStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse from localStorage", e);
        return defaultValue;
      }
    }
  }
  return defaultValue;
}

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Failed to set item in localStorage", e);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
