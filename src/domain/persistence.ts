import { BASE, COLS } from "./data.ts";
import type { ChemicalKey, Material } from "./types.ts";

export const STORAGE_KEYS = { current: "selfil-db-v4", legacy: "selfil-db-v3", curator: "selfil-curador" } as const;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type StorageProvider = () => StorageLike | null | undefined;

export function getBrowserStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function storageValue(provider: StorageProvider): StorageLike | null {
  try {
    return provider() ?? null;
  } catch {
    return null;
  }
}

export function cloneMaterials(materials: readonly Material[] = BASE): Material[] {
  return JSON.parse(JSON.stringify(materials)) as Material[];
}

function savedField(record: Record<string, unknown>, key: string): unknown {
  if (!key.startsWith("c.")) return record[key];
  const chemicals = record.c;
  return chemicals && typeof chemicals === "object" ? (chemicals as Record<string, unknown>)[key.slice(2)] : undefined;
}

export function materialFieldValue(material: Material, key: string): number {
  if (key.startsWith("c.")) return material.c[key.slice(2) as ChemicalKey];
  return (material as unknown as Record<string, number>)[key];
}

export function setMaterialField(material: Material, key: string, value: number): void {
  if (key.startsWith("c.")) material.c[key.slice(2) as ChemicalKey] = value;
  else (material as unknown as Record<string, unknown>)[key] = value;
}

export function loadMaterialDatabase(provider: StorageProvider, base: readonly Material[] = BASE): Material[] {
  const database = cloneMaterials(base);
  let saved: unknown = null;
  try {
    const storage = storageValue(provider);
    saved = JSON.parse(storage?.getItem(STORAGE_KEYS.current) || storage?.getItem(STORAGE_KEYS.legacy) || "null");
  } catch {
    saved = null;
  }
  if (Array.isArray(saved)) database.forEach((material) => {
    const record = saved.find((item) => item && typeof item === "object" && (item as Record<string, unknown>).id === material.id) as Record<string, unknown> | undefined;
    if (!record) return;
    COLS.forEach(([key]) => {
      const value = savedField(record, key);
      if (typeof value === "number") setMaterialField(material, key, value);
    });
  });
  return database;
}

export function saveMaterialDatabase(provider: StorageProvider, database: readonly Material[]): boolean {
  try {
    const storage = storageValue(provider);
    if (!storage) return false;
    storage.setItem(STORAGE_KEYS.current, JSON.stringify(database));
    return true;
  } catch {
    return false;
  }
}

export function loadCuratorAccess(provider: StorageProvider, hash: string): boolean {
  try {
    return storageValue(provider)?.getItem(STORAGE_KEYS.curator) === "1" || hash === "#curador";
  } catch {
    return hash === "#curador";
  }
}

export function saveCuratorAccess(provider: StorageProvider, enabled: boolean): boolean {
  try {
    const storage = storageValue(provider);
    if (!storage) return false;
    storage.setItem(STORAGE_KEYS.curator, enabled ? "1" : "0");
    return true;
  } catch {
    return false;
  }
}

export function resetMaterialDatabase(provider: StorageProvider, base: readonly Material[] = BASE): Material[] {
  try {
    const storage = storageValue(provider);
    storage?.removeItem(STORAGE_KEYS.current);
    storage?.removeItem(STORAGE_KEYS.legacy);
  } catch {
    // Preserve the original reset behavior when browser storage is unavailable.
  }
  return cloneMaterials(base);
}

