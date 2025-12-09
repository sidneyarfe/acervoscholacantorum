import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "schola_recent_searches";
const MAX_RECENT_SEARCHES = 5;

interface RecentSearch {
  id: string;
  query: string;
  timestamp: number;
  type: "song" | "celebration";
  itemId?: string;
}

export type { RecentSearch };

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  const addSearch = useCallback((query: string, type: "song" | "celebration" = "song", itemId?: string) => {
    if (!query.trim()) return;
    
    setRecentSearches((prev) => {
      // Filtrar por itemId (se existir) ou por query
      const filtered = itemId 
        ? prev.filter((s) => s.itemId !== itemId)
        : prev.filter((s) => s.query.toLowerCase() !== query.toLowerCase());
      const newSearch: RecentSearch = {
        id: Date.now().toString(),
        query: query.trim(),
        timestamp: Date.now(),
        type,
        itemId,
      };
      const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeSearch = useCallback((id: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { recentSearches, addSearch, removeSearch, clearSearches };
}
