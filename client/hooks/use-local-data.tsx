import { useState, useEffect } from "react";

interface LocalDataOptions {
  key: string;
  defaultValue: any;
  syncToDatabase?: boolean;
}

interface LocalDataHook<T> {
  data: T;
  updateData: (newData: Partial<T>) => void;
  resetData: () => void;
  isLocal: boolean;
  lastSync: Date | null;
}

export function useLocalData<T extends Record<string, any>>({
  key,
  defaultValue,
  syncToDatabase = true,
}: LocalDataOptions): LocalDataHook<T> {
  const [data, setData] = useState<T>(defaultValue);
  const [isLocal, setIsLocal] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsedData = JSON.parse(stored);
        setData({ ...defaultValue, ...parsedData.data });
        setLastSync(parsedData.lastSync ? new Date(parsedData.lastSync) : null);
        setIsLocal(true);
      }
    } catch (error) {
      console.warn(`Failed to load ${key} from localStorage:`, error);
    }
  }, [key, defaultValue]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      const dataToStore = {
        data,
        lastSync: new Date().toISOString(),
        version: "1.0",
      };
      localStorage.setItem(key, JSON.stringify(dataToStore));
      setLastSync(new Date());
    } catch (error) {
      console.warn(`Failed to save ${key} to localStorage:`, error);
    }
  }, [data, key]);

  const updateData = (newData: Partial<T>) => {
    setData((prev) => ({ ...prev, ...newData }));
    setIsLocal(true);
  };

  const resetData = () => {
    setData(defaultValue);
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove ${key} from localStorage:`, error);
    }
    setIsLocal(false);
    setLastSync(null);
  };

  return {
    data,
    updateData,
    resetData,
    isLocal,
    lastSync,
  };
}

// Utility function to get all admin data keys
export const getAdminDataKeys = () => [
  "admin_hero_section",
  "admin_why_choose_section",
  "admin_product_gallery",
  "admin_trust_section",
  "admin_customer_reviews",
  "admin_offer_pricing",
  "admin_footer",
  "admin_seo_settings",
  "admin_product_popup",
  "admin_exit_intent_popup",
];

// Utility function to export all admin data
export const exportAllAdminData = () => {
  const allData: Record<string, any> = {};

  getAdminDataKeys().forEach((key) => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        allData[key] = JSON.parse(stored);
      }
    } catch (error) {
      console.warn(`Failed to export ${key}:`, error);
    }
  });

  return {
    data: allData,
    exportedAt: new Date().toISOString(),
    version: "1.0",
  };
};

// Utility function to import all admin data
export const importAllAdminData = (importedData: any) => {
  if (!importedData.data) {
    throw new Error("Invalid import data format");
  }

  const imported = [];
  const failed = [];

  Object.entries(importedData.data).forEach(([key, value]) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      imported.push(key);
    } catch (error) {
      console.warn(`Failed to import ${key}:`, error);
      failed.push(key);
    }
  });

  return { imported, failed };
};

// Utility function to clear all admin data
export const clearAllAdminData = () => {
  const cleared = [];
  const failed = [];

  getAdminDataKeys().forEach((key) => {
    try {
      localStorage.removeItem(key);
      cleared.push(key);
    } catch (error) {
      console.warn(`Failed to clear ${key}:`, error);
      failed.push(key);
    }
  });

  return { cleared, failed };
};
