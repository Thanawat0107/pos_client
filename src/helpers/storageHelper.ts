export const storage = {
  set: async (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  },

  get: async (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error("Failed to load from localStorage", e);
      return null;
    }
  },

  remove: async (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("Failed to remove from localStorage", e);
    }
  },

  setJson: async <T>(key: string, value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Failed to save JSON to localStorage", e);
    }
  },

  getJson: async <T>(key: string): Promise<T | null> => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (e) {
      console.error("Failed to load JSON from localStorage", e);
      return null;
    }
  },
} as const;
